import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all medications with refill tracking enabled
    const medications = await base44.asServiceRole.entities.Medication.filter({
      refill_enabled: true
    });

    const today = new Date().toISOString().split('T')[0];
    const remindersSent = [];

    for (const med of medications) {
      // Skip if no supply tracking or already reminded today
      if (!med.current_supply || !med.refill_threshold_days) continue;
      if (med.last_refill_reminder_date === today) continue;

      // Calculate daily doses based on frequency
      let dailyDoses = 1;
      switch (med.frequency) {
        case 'twice_daily': dailyDoses = 2; break;
        case 'three_times_daily': dailyDoses = 3; break;
        case 'four_times_daily': dailyDoses = 4; break;
        case 'every_other_day': dailyDoses = 0.5; break;
        case 'weekly': dailyDoses = 1/7; break;
        case 'as_needed': dailyDoses = 0; break;
      }

      // Skip if as_needed
      if (dailyDoses === 0) continue;

      // Calculate days of supply remaining
      const daysRemaining = Math.floor(med.current_supply / dailyDoses);

      // Send reminder if below threshold
      if (daysRemaining <= med.refill_threshold_days) {
        // Get user
        const users = await base44.asServiceRole.entities.User.filter({
          email: med.created_by
        });
        const user = users[0];

        if (!user) continue;

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `🔔 Refill Reminder: ${med.name}`,
          body: `
            <h2>Time to refill your medication!</h2>
            <p><strong>${med.name}</strong> - ${med.dosage}</p>
            <p>You have approximately <strong>${daysRemaining} days</strong> of supply remaining (${med.current_supply} doses).</p>
            ${med.pharmacy_name ? `<p><strong>Pharmacy:</strong> ${med.pharmacy_name}</p>` : ''}
            ${med.pharmacy_phone ? `<p><strong>Phone:</strong> ${med.pharmacy_phone}</p>` : ''}
            <p>Don't forget to contact your pharmacy or doctor to request a refill.</p>
            <p style="margin-top: 20px;">
              <a href="https://life-meds.com" style="background: linear-gradient(to right, #0ea5e9, #14b8a6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Update Supply in App
              </a>
            </p>
          `
        });

        // Update last reminder date
        await base44.asServiceRole.entities.Medication.update(med.id, {
          last_refill_reminder_date: today
        });

        remindersSent.push({
          medication: med.name,
          daysRemaining,
          user: user.email
        });
      }
    }

    return Response.json({ 
      success: true, 
      remindersSent,
      count: remindersSent.length
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});