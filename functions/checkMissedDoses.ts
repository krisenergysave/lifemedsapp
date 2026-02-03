import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function should be called by a scheduled automation every 30 minutes
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Get all pending medication logs scheduled more than 30 minutes ago
    const pendingLogs = await base44.asServiceRole.entities.MedicationLog.filter({
      status: 'pending'
    });

    const missedLogs = pendingLogs.filter(log => {
      const scheduledTime = new Date(log.scheduled_time);
      return scheduledTime <= thirtyMinutesAgo;
    });

    console.log(`Found ${missedLogs.length} missed doses`);

    const updates = [];
    const notifications = [];

    for (const log of missedLogs) {
      // Update log status to missed
      await base44.asServiceRole.entities.MedicationLog.update(log.id, {
        status: 'missed'
      });

      updates.push(log.id);

      // Get medication details
      const medications = await base44.asServiceRole.entities.Medication.filter({
        id: log.medication_id
      });

      if (medications.length === 0) continue;

      const medication = medications[0];

      // Get the patient info
      const patientEmail = log.created_by;

      // Find caregiver links for this patient's family member
      const familyMemberId = medication.family_member_id || 'self';

      // Send missed dose notification to caregivers
      try {
        const result = await base44.asServiceRole.functions.invoke('notifyCaregivers', {
          medicationLog: log,
          medication: medication,
          familyMemberId: familyMemberId,
          eventType: 'missed'
        });

        notifications.push({
          logId: log.id,
          medicationName: medication.name,
          notificationResult: result.data
        });
      } catch (error) {
        console.error('Failed to notify caregivers:', error);
      }
    }

    return Response.json({
      success: true,
      missedDosesFound: missedLogs.length,
      logsUpdated: updates,
      notificationsSent: notifications
    });

  } catch (error) {
    console.error('Check missed doses error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});