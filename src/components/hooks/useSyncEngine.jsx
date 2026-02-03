import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useOfflineStore } from './useOfflineStore';
import { toast } from 'sonner';
import { networkBridge } from '../utils/nativeBridge';

export const useSyncEngine = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  
  const offlineStore = useOfflineStore();

  // Check initial network status
  useEffect(() => {
    const checkNetworkStatus = async () => {
      const status = await networkBridge.getStatus();
      setIsOnline(status.connected);
    };
    checkNetworkStatus();
  }, []);

  // Update pending sync count
  const updatePendingCount = useCallback(async () => {
    const queue = await offlineStore.getSyncQueue();
    setPendingSyncCount(queue.length);
  }, [offlineStore]);

  // Sync data to server
  const syncData = useCallback(async () => {
    const networkStatus = await networkBridge.getStatus();
    if (!networkStatus.connected || isSyncing) return;

    setIsSyncing(true);
    console.log('🔄 Starting sync...');

    try {
      const queue = await offlineStore.getSyncQueue();
      console.log(`📦 Found ${queue.length} items to sync`);

      let successCount = 0;
      let errorCount = 0;

      for (const queueItem of queue) {
        try {
          const { entity, operation, data, queueId } = queueItem;

          // Remove temporary ID flag
          const cleanData = { ...data };
          delete cleanData.syncStatus;
          delete cleanData.isOffline;
          delete cleanData.updatedAt;

          let result;

          if (operation === 'create') {
            // If it has a temp ID, remove it so server generates a real one
            if (cleanData.id && cleanData.id.startsWith('temp_')) {
              delete cleanData.id;
            }

            if (entity === 'MedicationLog') {
              result = await base44.entities.MedicationLog.create(cleanData);
              await offlineStore.updateSyncStatus('MedicationLog', data.id, 'synced');
            } else if (entity === 'HealthTracker') {
              result = await base44.entities.HealthTracker.create(cleanData);
              await offlineStore.updateSyncStatus('HealthTracker', data.id, 'synced');
            }
          } else if (operation === 'update') {
            if (entity === 'MedicationLog' && !cleanData.id.startsWith('temp_')) {
              result = await base44.entities.MedicationLog.update(cleanData.id, cleanData);
              await offlineStore.updateSyncStatus('MedicationLog', data.id, 'synced');
            } else if (entity === 'HealthTracker' && !cleanData.id.startsWith('temp_')) {
              result = await base44.entities.HealthTracker.update(cleanData.id, cleanData);
              await offlineStore.updateSyncStatus('HealthTracker', data.id, 'synced');
            }
          }

          // Remove from sync queue
          await offlineStore.clearSyncQueueItem(queueId);
          successCount++;

          console.log(`✅ Synced ${entity} #${queueId}`);
        } catch (error) {
          console.error(`❌ Failed to sync item:`, error);
          errorCount++;
          
          // Increment retry count (optional: remove after max retries)
          if (queueItem.retryCount > 5) {
            await offlineStore.clearSyncQueueItem(queueItem.queueId);
            console.log(`🗑️ Removed item after max retries`);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`✅ Synced ${successCount} item${successCount > 1 ? 's' : ''}`);
      }

      if (errorCount > 0) {
        toast.error(`Failed to sync ${errorCount} item${errorCount > 1 ? 's' : ''}`);
      }

      await updatePendingCount();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed. Will retry when online.');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, offlineStore, updatePendingCount]);

  // Create medication log (offline-first)
  const createMedicationLog = useCallback(async (logData) => {
    const networkStatus = await networkBridge.getStatus();
    if (networkStatus.connected) {
      try {
        const result = await base44.entities.MedicationLog.create(logData);
        await offlineStore.saveMedicationLogLocally({ ...result, syncStatus: 'synced', isOffline: false });
        return result;
      } catch (error) {
        console.error('Failed to create online, saving offline:', error);
        const saved = await offlineStore.saveMedicationLogLocally(logData);
        await offlineStore.addToSyncQueue('MedicationLog', 'create', saved);
        await updatePendingCount();
        toast.info('📱 Saved offline. Will sync when online.');
        return saved;
      }
    } else {
      const saved = await offlineStore.saveMedicationLogLocally(logData);
      await offlineStore.addToSyncQueue('MedicationLog', 'create', saved);
      await updatePendingCount();
      toast.info('📱 Saved offline. Will sync when online.');
      return saved;
    }
  }, [offlineStore, updatePendingCount]);

  // Update medication log (offline-first)
  const updateMedicationLog = useCallback(async (id, logData) => {
    const fullData = { ...logData, id };
    const networkStatus = await networkBridge.getStatus();

    if (networkStatus.connected && !id.startsWith('temp_')) {
      try {
        const result = await base44.entities.MedicationLog.update(id, logData);
        await offlineStore.saveMedicationLogLocally({ ...result, syncStatus: 'synced', isOffline: false });
        return result;
      } catch (error) {
        console.error('Failed to update online, saving offline:', error);
        await offlineStore.saveMedicationLogLocally(fullData);
        await offlineStore.addToSyncQueue('MedicationLog', 'update', fullData);
        await updatePendingCount();
        toast.info('📱 Saved offline. Will sync when online.');
        return fullData;
      }
    } else {
      await offlineStore.saveMedicationLogLocally(fullData);
      await offlineStore.addToSyncQueue('MedicationLog', 'update', fullData);
      await updatePendingCount();
      toast.info('📱 Saved offline. Will sync when online.');
      return fullData;
    }
  }, [offlineStore, updatePendingCount]);

  // Create health tracker (offline-first)
  const createHealthTracker = useCallback(async (healthData) => {
    const networkStatus = await networkBridge.getStatus();
    if (networkStatus.connected) {
      try {
        const result = await base44.entities.HealthTracker.create(healthData);
        await offlineStore.saveHealthTrackerLocally({ ...result, syncStatus: 'synced', isOffline: false });
        return result;
      } catch (error) {
        console.error('Failed to create online, saving offline:', error);
        const saved = await offlineStore.saveHealthTrackerLocally(healthData);
        await offlineStore.addToSyncQueue('HealthTracker', 'create', saved);
        await updatePendingCount();
        toast.info('📱 Saved offline. Will sync when online.');
        return saved;
      }
    } else {
      const saved = await offlineStore.saveHealthTrackerLocally(healthData);
      await offlineStore.addToSyncQueue('HealthTracker', 'create', saved);
      await updatePendingCount();
      toast.info('📱 Saved offline. Will sync when online.');
      return saved;
    }
  }, [offlineStore, updatePendingCount]);

  // Load medication logs (merge local + remote)
  const loadMedicationLogs = useCallback(async () => {
    const networkStatus = await networkBridge.getStatus();
    if (networkStatus.connected) {
      try {
        const remoteLogs = await base44.entities.MedicationLog.filter({});
        return await offlineStore.mergeData('MedicationLog', remoteLogs);
      } catch (error) {
        console.error('Failed to load remote logs, using local:', error);
        return await offlineStore.getMedicationLogsLocally();
      }
    } else {
      return await offlineStore.getMedicationLogsLocally();
    }
  }, [offlineStore]);

  // Load health trackers (merge local + remote)
  const loadHealthTrackers = useCallback(async () => {
    const networkStatus = await networkBridge.getStatus();
    if (networkStatus.connected) {
      try {
        const remoteTrackers = await base44.entities.HealthTracker.list('-measured_at', 100);
        return await offlineStore.mergeData('HealthTracker', remoteTrackers);
      } catch (error) {
        console.error('Failed to load remote trackers, using local:', error);
        return await offlineStore.getHealthTrackersLocally();
      }
    } else {
      return await offlineStore.getHealthTrackersLocally();
    }
  }, [offlineStore]);

  // Listen for network status changes (Web + Native)
  useEffect(() => {
    const handleNetworkChange = (status) => {
      const isConnected = status.connected;
      setIsOnline(isConnected);
      
      if (isConnected) {
        console.log('🌐 Connection restored!');
        toast.success('Back online! Syncing data...');
        syncData();
      } else {
        console.log('📵 Connection lost');
        toast.warning('You are offline. Changes will sync when connection is restored.');
      }
    };

    // Add network listener (works for both web and native)
    const removeListener = networkBridge.addListener(handleNetworkChange);

    // Initial sync if online
    const initSync = async () => {
      const status = await networkBridge.getStatus();
      if (status.connected) {
        updatePendingCount();
        // Sync after a short delay to avoid blocking initial render
        setTimeout(syncData, 2000);
      }
    };
    initSync();

    return removeListener;
  }, [syncData, updatePendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingSyncCount,
    createMedicationLog,
    updateMedicationLog,
    createHealthTracker,
    loadMedicationLogs,
    loadHealthTrackers,
    syncData,
    offlineStore
  };
};