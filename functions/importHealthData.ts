import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const source = formData.get('source') || 'imported';

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload the file
    const uploadResult = await base44.integrations.Core.UploadFile({ file });
    const fileUrl = uploadResult.file_url;

    // Define the expected schema for health data
    const healthDataSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tracker_type: { type: 'string' },
          value: { type: 'number' },
          systolic: { type: 'number' },
          diastolic: { type: 'number' },
          measured_at: { type: 'string' },
          notes: { type: 'string' },
          device_name: { type: 'string' }
        },
        required: ['tracker_type', 'value']
      }
    };

    // Extract data from the file
    const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: healthDataSchema
    });

    if (extractResult.status === 'error') {
      return Response.json({ 
        error: 'Failed to parse file', 
        details: extractResult.details 
      }, { status: 400 });
    }

    // Prepare data for bulk insert
    const healthRecords = extractResult.output.map(record => ({
      tracker_type: record.tracker_type,
      value: record.value,
      systolic: record.systolic || null,
      diastolic: record.diastolic || null,
      measured_at: record.measured_at || new Date().toISOString(),
      notes: record.notes || null,
      device_name: record.device_name || null,
      source: source
    }));

    // Bulk create health records
    await base44.entities.HealthTracker.bulkCreate(healthRecords);

    return Response.json({
      success: true,
      imported: healthRecords.length,
      message: `Successfully imported ${healthRecords.length} health records`
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});