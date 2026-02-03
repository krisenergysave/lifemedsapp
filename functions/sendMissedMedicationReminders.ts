import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users
    const users = await base44.asServiceRole.entities.User.list();
    let emailsSent = 0;

    for (const user of users) {
      // Get user's medications
      const medications = await base44.asServiceRole.entities.Medication.filter({
        created_by: user.email
      });

      if (medications.length === 0) continue;

      // Get today's logs
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const logs = await base44.asServiceRole.entities.MedicationLog.filter({
        created_by: user.email
      });

      // Build today's schedule
      const missedMeds = [];
      const now = new Date();

      for (const med of medications) {
        if (!med.times || med.times.length === 0) continue;

        for (const time of med.times) {
          const [hours, minutes] = time.split(':');
          const scheduledTime = new Date();
          scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          // Only check times that have already passed
          if (scheduledTime > now) continue;

          // Check if there's a log for this medication at this time
          const hasLog = logs.some(log => {
            const logTime = new Date(log.scheduled_time);
            return log.medication_id === med.id &&
                   logTime.getHours() === scheduledTime.getHours() &&
                   logTime.getDate() === scheduledTime.getDate() &&
                   (log.status === 'taken' || log.status === 'skipped');
          });

          if (!hasLog) {
            missedMeds.push({
              name: med.name,
              dosage: med.dosage,
              time: time
            });
          }
        }
      }

      // Send email if there are missed medications
      if (missedMeds.length > 0) {
        const medsList = missedMeds.map(m => 
          `• ${m.name} (${m.dosage}) at ${m.time}`
        ).join('\n');

        const emailBody = `
Hi ${user.full_name || 'there'},

You have ${missedMeds.length} missed medication${missedMeds.length > 1 ? 's' : ''} for today:

${medsList}

Don't forget to take your medications and log them in Life-Meds!

Stay healthy,
Life-Meds Team
        `.trim();

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: '⏰ Missed Medication Reminder - Life-Meds',
          body: emailBody,
          from_name: 'Life-Meds'
        });

        emailsSent++;
      }
    }

    return Response.json({
      success: true,
      emailsSent,
      message: `Sent ${emailsSent} missed medication reminder email${emailsSent !== 1 ? 's' : ''}`
    });
  } catch (error) {
    console.error('Missed medication reminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});