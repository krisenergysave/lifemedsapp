import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

export default function HealthDataImport({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [source, setSource] = useState('imported');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', source);

      const response = await base44.functions.invoke('importHealthData', formData);

      if (response.data.success) {
        setResult({ success: true, message: response.data.message });
        setFile(null);
        if (onImportComplete) onImportComplete();
      } else {
        setResult({ success: false, message: response.data.error });
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to import data. Please check your file format.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Import Health Data</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-slate-700 mb-2 block">Data Source</Label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imported">CSV/Excel File</SelectItem>
              <SelectItem value="device">Wearable Device Export</SelectItem>
              <SelectItem value="manual">Manual Entry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-700 mb-2 block">Upload CSV File</Label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-sky-400 transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="health-file-upload"
            />
            <label htmlFor="health-file-upload" className="cursor-pointer">
              {file ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileText className="w-8 h-8" />
                  <span className="font-medium">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-12 h-12 text-slate-400" />
                  <p className="text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">CSV, Excel files supported</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>CSV Format:</strong> Include columns: tracker_type, value, measured_at
            <br />
            <strong>Types:</strong> steps, heart_rate, sleep_hours, exercise_minutes, water_intake, oxygen_saturation
          </p>
        </div>

        {result && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{result.message}</span>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || isUploading}
          className="w-full gradient-cyan text-white hover:opacity-90">
          {isUploading ? 'Importing...' : 'Import Health Data'}
        </Button>
      </div>
    </div>
  );
}