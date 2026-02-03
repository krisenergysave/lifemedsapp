import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role to check all users' medications
    const medications = await base44.asServiceRole.entities.Medication.filter({ 
      reminder_enabled: true 
    });
    
    const now = new Date();
    const currentUTCHour = now.getUTCHours();
    const currentUTCMinute = now.getUTCMinutes();
    const currentUTCTime = `${String(currentUTCHour).padStart(2, '0')}:${String(currentUTCMinute).padStart(2, '0')}`;
    
    const remindersToSend = [];
    
    for (const med of medications) {
      // Skip if no times configured
      if (!med.times_utc || med.times_utc.length === 0) {
        // Fallback: if times_utc doesn't exist but times does, use times as local
        if (med.times && med.times.length > 0) {
          console.log(`Medication ${med.id} missing times_utc, using local times`);
          continue;
        }
        continue;
      }
      
      // Check if current UTC time matches any of the medication's UTC times (within 2 minute window for reliability)
      for (let i = 0; i < med.times_utc.length; i++) {
        const medUTCTime = med.times_utc[i];
        const [medHour, medMinute] = medUTCTime.split(':').map(Number);
        
        // Check if we're within 2 minutes of the scheduled UTC time
        const timeDiffMinutes = Math.abs((currentUTCHour * 60 + currentUTCMinute) - (medHour * 60 + medMinute));
        
        if (timeDiffMinutes <= 2) {
          // Create the scheduled time in UTC
          const scheduledTimeUTC = new Date();
          scheduledTimeUTC.setUTCHours(medHour, medMinute, 0, 0);
          
          // Check if already logged today at this time
          const existingLog = await base44.asServiceRole.entities.MedicationLog.filter({
            medication_id: med.id,
            scheduled_time: scheduledTimeUTC.toISOString()
          });
          
          // Only send reminder if no log exists or status is pending
          if (existingLog.length === 0 || existingLog[0].status === 'pending') {
            // Get the local time for display (if timezone info available)
            let displayTime = medUTCTime;
            if (med.times && med.times[i]) {
              displayTime = med.times[i];
            }
            
            remindersToSend.push({
              medication: med,
              scheduledTime: scheduledTimeUTC.toISOString(),
              displayTime: displayTime,
              userEmail: med.created_by
            });
            
            // Create pending log if it doesn't exist
            if (existingLog.length === 0) {
              await base44.asServiceRole.entities.MedicationLog.create({
                medication_id: med.id,
                scheduled_time: scheduledTimeUTC.toISOString(),
                status: 'pending',
                created_by: med.created_by
              });
            }
          }
        }
      }
    }
    
    // Send email reminders
    for (const reminder of remindersToSend) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: reminder.userEmail,
        subject: `💊 Medication Reminder: ${reminder.medication.name}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00BCD4;">Time to Take Your Medication</h2>
            <div style="background: #f0f9fc; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">${reminder.medication.name}</h3>
              <p style="margin: 5px 0;"><strong>Dosage:</strong> ${reminder.medication.dosage}</p>
              <p style="margin: 5px 0;"><strong>Scheduled Time:</strong> ${reminder.displayTime}</p>
              ${reminder.medication.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${reminder.medication.notes}</p>` : ''}
            </div>
            <p style="color: #666;">Log in to Life-Meds to mark this medication as taken.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Reminder triggered at ${new Date().toISOString()}
            </p>
          </div>
        `
      });
    }
    
    return Response.json({ 
      success: true, 
      remindersSent: remindersToSend.length,
      currentUTC: currentUTCTime,
      message: `Sent ${remindersToSend.length} medication reminders`
    });
    
  } catch (error) {
    console.error('Error sending medication reminders:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});