import { openDB } from 'idb';

const DB_NAME = 'LifeMedsOfflineDB';
const DB_VERSION = 1;

// Initialize IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('MedicationLog')) {
        const logStore = db.createObjectStore('MedicationLog', { keyPath: 'id', autoIncrement: false });
        logStore.createIndex('medication_id', 'medication_id', { unique: false });
        logStore.createIndex('scheduled_time', 'scheduled_time', { unique: false });
        logStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      if (!db.objectStoreNames.contains('HealthTracker')) {
        const healthStore = db.createObjectStore('HealthTracker', { keyPath: 'id', autoIncrement: false });
        healthStore.createIndex('tracker_type', 'tracker_type', { unique: false });
        healthStore.createIndex('measured_at', 'measured_at', { unique: false });
        healthStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      if (!db.objectStoreNames.contains('SyncQueue')) {
        const syncStore = db.createObjectStore('SyncQueue', { keyPath: 'queueId', autoIncrement: true });
        syncStore.createIndex('entity', 'entity', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    },
  });
};

export const useOfflineStore = () => {
  // Save medication log locally
  const saveMedicationLogLocally = async (logData) => {
    const db = await initDB();
    const id = logData.id || `temp_${Date.now()}_${Math.random()}`;
    const dataWithSync = {
      ...logData,
      id,
      syncStatus: 'pending',
      updatedAt: new Date().toISOString(),
      isOffline: true
    };

    await db.put('MedicationLog', dataWithSync);
    return dataWithSync;
  };

  // Save health tracker locally
  const saveHealthTrackerLocally = async (healthData) => {
    const db = await initDB();
    const id = healthData.id || `temp_${Date.now()}_${Math.random()}`;
    const dataWithSync = {
      ...healthData,
      id,
      syncStatus: 'pending',
      updatedAt: new Date().toISOString(),
      isOffline: true
    };

    await db.put('HealthTracker', dataWithSync);
    return dataWithSync;
  };

  // Add to sync queue
  const addToSyncQueue = async (entity, operation, data) => {
    const db = await initDB();
    const queueItem = {
      entity,
      operation, // 'create' or 'update'
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    await db.add('SyncQueue', queueItem);
  };

  // Get all medication logs (including offline ones)
  const getMedicationLogsLocally = async () => {
    const db = await initDB();
    return db.getAll('MedicationLog');
  };

  // Get all health trackers (including offline ones)
  const getHealthTrackersLocally = async () => {
    const db = await initDB();
    return db.getAll('HealthTracker');
  };

  // Get sync queue
  const getSyncQueue = async () => {
    const db = await initDB();
    return db.getAll('SyncQueue');
  };

  // Clear sync queue item
  const clearSyncQueueItem = async (queueId) => {
    const db = await initDB();
    await db.delete('SyncQueue', queueId);
  };

  // Update sync status
  const updateSyncStatus = async (storeName, id, status) => {
    const db = await initDB();
    const item = await db.get(storeName, id);
    if (item) {
      item.syncStatus = status;
      item.isOffline = status === 'pending';
      await db.put(storeName, item);
    }
  };

  // Merge local and remote data
  const mergeData = async (storeName, remoteData) => {
    const db = await initDB();
    const localData = await db.getAll(storeName);

    // Create a map of remote data by ID
    const remoteMap = new Map(remoteData.map(item => [item.id, item]));

    // Sync remote data to local
    for (const remoteItem of remoteData) {
      const localItem = localData.find(l => l.id === remoteItem.id);
      
      if (!localItem) {
        // New item from server
        await db.put(storeName, { ...remoteItem, syncStatus: 'synced', isOffline: false });
      } else if (localItem.syncStatus === 'synced') {
        // Update from server (last write wins)
        const remoteTime = new Date(remoteItem.updated_date || remoteItem.updatedAt || 0);
        const localTime = new Date(localItem.updated_date || localItem.updatedAt || 0);
        
        if (remoteTime >= localTime) {
          await db.put(storeName, { ...remoteItem, syncStatus: 'synced', isOffline: false });
        }
      }
      // If local item is pending, keep it as is for sync
    }

    return db.getAll(storeName);
  };

  // Clear all local data (useful for logout)
  const clearAllLocalData = async () => {
    const db = await initDB();
    await db.clear('MedicationLog');
    await db.clear('HealthTracker');
    await db.clear('SyncQueue');
  };

  return {
    saveMedicationLogLocally,
    saveHealthTrackerLocally,
    addToSyncQueue,
    getMedicationLogsLocally,
    getHealthTrackersLocally,
    getSyncQueue,
    clearSyncQueueItem,
    updateSyncStatus,
    mergeData,
    clearAllLocalData
  };
};