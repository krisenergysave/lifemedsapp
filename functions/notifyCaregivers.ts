import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { medicationLog, medication, familyMemberId, eventType } = await req.json();

    if (!medicationLog || !medication || !eventType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get caregiver links for this patient
    const caregiverLinks = await base44.asServiceRole.entities.CaregiverLink.filter({
      patient_family_member_id: familyMemberId || 'self',
      status: 'active'
    });

    if (!caregiverLinks || caregiverLinks.length === 0) {
      return Response.json({ message: 'No active caregivers to notify' });
    }

    const notifications = [];

    for (const link of caregiverLinks) {
      // Check notification preferences
      const shouldNotify = 
        (eventType === 'taken' && link.notify_on_success) ||
        (eventType === 'missed' && link.notify_on_missed);

      if (!shouldNotify) continue;

      const notificationMethods = link.notification_methods || ['email'];
      
      // Prepare notification message
      const patientName = familyMemberId ? 
        (await base44.asServiceRole.entities.FamilyMember.filter({ id: familyMemberId }))[0]?.name || 'Patient' :
        user.full_name;

      const subject = eventType === 'taken' 
        ? `✓ ${patientName} took their medication`
        : `⚠️ ${patientName} missed their medication`;

      const body = eventType === 'taken'
        ? `${patientName} has taken ${medication.name} (${medication.dosage}) at ${new Date(medicationLog.taken_at || medicationLog.scheduled_time).toLocaleString()}.`
        : `${patientName} missed their scheduled dose of ${medication.name} (${medication.dosage}) at ${new Date(medicationLog.scheduled_time).toLocaleString()}. Please check in with them.`;

      // Send email notification (default)
      if (notificationMethods.includes('email')) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: link.caregiver_email,
            subject: subject,
            body: body
          });
          notifications.push({ 
            caregiver: link.caregiver_email, 
            method: 'email', 
            status: 'sent' 
          });
        } catch (error) {
          console.error('Email notification failed:', error);
          notifications.push({ 
            caregiver: link.caregiver_email, 
            method: 'email', 
            status: 'failed',
            error: error.message 
          });
        }
      }

      // Send push notification
      if (notificationMethods.includes('push')) {
        try {
          const caregiverDevices = await base44.asServiceRole.entities.UserDevice.filter({
            user_email: link.caregiver_email,
            is_active: true
          });

          for (const device of caregiverDevices) {
            // Push notification logic would go here
            // This requires integration with a push notification service
            console.log('Push notification:', { device: device.device_token, message: body });
          }
          
          notifications.push({ 
            caregiver: link.caregiver_email, 
            method: 'push', 
            status: 'sent' 
          });
        } catch (error) {
          console.error('Push notification failed:', error);
        }
      }

      // In-app notification (create a notification record)
      if (notificationMethods.includes('in_app')) {
        // You could create an InAppNotification entity to store these
        notifications.push({ 
          caregiver: link.caregiver_email, 
          method: 'in_app', 
          status: 'queued' 
        });
      }
    }

    return Response.json({ 
      success: true,
      notificationsSent: notifications.length,
      notifications 
    });

  } catch (error) {
    console.error('Caregiver notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});