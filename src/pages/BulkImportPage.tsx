import { useState, useRef } from 'react';
import { Upload, Play, Pause, RotateCcw, Download, AlertCircle } from 'lucide-react';
import { parseGoogleMapsCsv, validateStores } from '../utils/csvParser';
import { useBulkImport } from '../hooks/useBulkImport';
import { BulkImportQueue } from '../components/admin/BulkImportQueue';
import { Button } from '../components/common/Button';
import type { BulkImportQueueItem } from '../types/bulkImport';

export default function BulkImportPage() {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { state, progress, actions } = useBulkImport();

  /**
   * Handle CSV file upload
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Read file content
      const content = await file.text();

      // Parse CSV
      const { stores, errors, format } = parseGoogleMapsCsv(content);

      if (stores.length === 0) {
        setUploadError('No valid stores found in CSV');
        return;
      }

      // Validate stores
      const { valid, invalid } = validateStores(stores);

      if (invalid.length > 0) {
        console.warn(`⚠️ ${invalid.length} invalid rows:`, invalid);
      }

      // Convert to queue items
      const queueItems: BulkImportQueueItem[] = valid.map(store => ({
        csvData: store,
        placeId: store.placeId,
        subCategories: [],
        status: 'pending',
        attemptCount: 0,
      }));

      // Load into queue
      actions.loadCsv(queueItems, file.name);

      setUploadSuccess(`✅ Loaded ${queueItems.length} stores from ${format.toUpperCase()} format CSV`);

      if (errors.length > 0) {
        setUploadSuccess(prev => `${prev}\n⚠️ ${errors.length} rows had errors (see console)`);
      }

      console.log(`📊 CSV Upload Summary:
- Total rows: ${stores.length}
- Valid: ${valid.length}
- Invalid: ${invalid.length}
- Format: ${format}
- Errors: ${errors.length}`);
    } catch (error) {
      console.error('❌ CSV upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to parse CSV');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Download results report
   */
  const downloadReport = () => {
    const csvRows = [
      ['Store Name', 'Status', 'Error', 'Place ID'],
      ...state.items.map(item => [
        item.csvData.title,
        item.status,
        item.error || '',
        item.placeId || ''
      ])
    ];

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-import-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Import Stores</h1>
          <p className="text-gray-600 mt-2">
            Upload a CSV file from Google Maps Saved Places to import multiple stores at once.
          </p>
        </div>

        {/* Upload Section */}
        {state.items.length === 0 && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload CSV File
              </h3>
              <p className="text-gray-600 mb-6">
                Supports both full and simple Google Maps export formats
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />

              <label
                htmlFor="csv-upload"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose CSV File
              </label>

              {uploadError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 inline mr-2" />
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 whitespace-pre-line">
                  {uploadSuccess}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Queue Section */}
        {state.items.length > 0 && (
          <>
            {/* Progress Bar & Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Progress: {state.currentIndex + 1}/{state.stats.total}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">{progress}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{state.stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{state.stats.completed}</div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{state.stats.pending}</div>
                  <div className="text-sm text-blue-700">Pending</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{state.stats.skipped}</div>
                  <div className="text-sm text-yellow-700">Skipped</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{state.stats.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3">
                {!state.isProcessing && state.currentIndex < state.items.length && (
                  <Button
                    onClick={actions.startProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {state.currentIndex === 0 ? 'Start Processing' : 'Resume Processing'}
                  </Button>
                )}

                {state.isProcessing && (
                  <Button
                    onClick={actions.pauseProcessing}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause Queue
                  </Button>
                )}

                <Button
                  onClick={downloadReport}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Report
                </Button>

                <Button
                  onClick={() => {
                    if (confirm('Reset and start over? This will clear all progress.')) {
                      actions.reset();
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* File Info */}
              {state.uploadedFileName && (
                <div className="mt-4 text-sm text-gray-600">
                  📄 File: {state.uploadedFileName}
                  {state.uploadedAt && ` • Uploaded: ${new Date(state.uploadedAt).toLocaleString()}`}
                </div>
              )}
            </div>

            {/* Queue Processor */}
            <BulkImportQueue
              items={state.items}
              currentIndex={state.currentIndex}
              isProcessing={state.isProcessing}
              onUpdateItem={actions.updateItem}
              onApprove={actions.approveItem}
              onSkip={actions.skipItem}
              onMarkFailed={actions.markFailed}
              onMoveToNext={actions.moveToNext}
            />
          </>
        )}
      </div>
    </div>
  );
}
