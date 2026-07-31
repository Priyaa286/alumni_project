import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { nominationService } from '../services/api';
import { Upload, FileText, CheckCircle2, Trash2, Loader2, AlertCircle } from 'lucide-react';

const documentTypes = [
  { id: 'Award Certificates', label: 'Award Certificates *' },
  { id: 'Achievement Documents', label: 'Achievement Documents *' },
  { id: 'Organization Profile', label: 'Organization Profile (if applicable)' },
  { id: 'Publications / Patents', label: 'Publications / Patents (if applicable)' },
  { id: 'NEC Alumni Certificate', label: 'NEC Alumni Certificate *' },
  { id: 'Other Documents', label: 'Any Other Supporting Documents' }
];

const Step6Documents = ({ watch, setValue, errors }) => {
  const [selectedDocType, setSelectedDocType] = useState('Award Certificates');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const documents = watch('supportingDocuments') || [];

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validation limit (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File exceeds the maximum size limit of 10 MB.');
        return;
      }

      setUploading(true);
      setUploadError('');
      setUploadProgress(10);

      try {
        const response = await nominationService.uploadFile(
          file,
          selectedDocType,
          (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        );

        if (response.success) {
          const newDoc = {
            fieldName: selectedDocType,
            fileName: response.data.fileName,
            filePath: response.data.filePath,
            fileSize: response.data.fileSize,
            mimeType: response.data.mimeType
          };

          // Append to the list
          const updatedDocs = [...documents.filter(d => d.fieldName !== selectedDocType), newDoc];
          setValue('supportingDocuments', updatedDocs, { shouldValidate: true });
        }
      } catch (error) {
        console.error('File upload failure:', error);
        setUploadError('Failed to upload file. Please check file type and try again.');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [selectedDocType, documents, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: false
  });

  const removeDocument = (index) => {
    const updatedDocs = documents.filter((_, idx) => idx !== index);
    setValue('supportingDocuments', updatedDocs, { shouldValidate: true });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/10 pb-4">
        <h3 className="text-xl font-bold text-gray-900 font-heading">Supporting Documents</h3>
        <p className="text-sm text-gray-500 font-sans">
          Upload certificates, publications, patents, organization profiles, and other credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Action Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 font-sans">
              Select Document Type to Upload:
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-nec border border-primary/20 bg-white/50 focus:bg-white focus:outline-none focus:border-primary focus:shadow-glow font-sans"
            >
              {documentTypes.map((type, idx) => (
                <option key={idx} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-nec p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-primary bg-primary/5 shadow-glow'
                : 'border-primary/20 hover:border-primary/50 bg-white/30 hover:bg-white/60'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 font-sans">
                Drag & drop your files here, or <span className="text-primary underline">browse</span>
              </h4>
              <p className="text-xs text-gray-500 font-sans">
                Supports PDF, DOCX, PNG, JPEG (Max 10 MB)
              </p>
            </div>
          </div>

          {/* Progress bar / Upload state */}
          {uploading && (
            <div className="bg-white/60 rounded-nec p-4 border border-primary/10 flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Uploading {selectedDocType}...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="bg-red-50 text-red-700 rounded-nec p-3 border border-red-200 flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Uploaded Files Summary Panel */}
        <div className="glass-card p-4 rounded-nec h-fit">
          <h4 className="text-sm font-bold text-gray-800 border-b border-primary/10 pb-2 mb-3 font-heading">
            Uploaded Documents ({documents.length})
          </h4>
          
          {documents.length === 0 ? (
            <div className="text-center py-6 text-gray-400 font-sans text-xs">
              No files uploaded yet. Please upload at least one mandatory certificate to proceed.
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-white/70 shadow-sm gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-800 truncate" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {doc.fieldName} &bull; {formatBytes(doc.fileSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(idx)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Validation Error Message */}
          {errors.supportingDocuments && (
            <div className="mt-3 text-xs text-red-500 font-semibold font-sans flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>At least one document is required.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Step6Documents;
