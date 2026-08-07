import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle,
  Loader2 
} from 'lucide-react';

const Step6Documents = ({ watch, setValue }) => {
  const documents = watch('documents') || {};
  const [uploading, setUploading] = useState({});

  const documentTypes = [
    { key: 'certificates', label: 'Academic & Professional Certificates', required: true },
    { key: 'achievements', label: 'Awards & Achievements Proof', required: true },
    { key: 'organizationProfile', label: 'Organization Profile / Brochure', required: false },
    { key: 'patents', label: 'Patents Copy (if any)', required: false },
    { key: 'publications', label: 'Publications / Journals Copy (if any)', required: false },
    { key: 'necAlumniCertificate', label: 'NEC Alumni Registration Certificate', required: false },
    { key: 'otherDocuments', label: 'Other Supporting Documents', required: false }
  ];

  const handleUpload = async (files, key) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // File validation: Size <= 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [key]: true }));
      const response = await uploadFile(file);
      
      const currentList = documents[key] || [];
      setValue(`documents.${key}`, [...currentList, response.fileUrl], {
        shouldValidate: true
      });
      toast.success(`${file.name} uploaded successfully.`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'File upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const removeFile = (key, indexToRemove) => {
    const currentList = documents[key] || [];
    const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);
    setValue(`documents.${key}`, updatedList, { shouldValidate: true });
    toast.info('File removed.');
  };

  // Render file icon helper
  const renderFileIcon = (url) => {
    const isImage = /\.(jpeg|jpg|png)$/i.test(url);
    if (isImage) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-red-500" />;
  };

  // Document Dropzone Sub-Component
  const DocumentDropzone = ({ docType }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => handleUpload(acceptedFiles, docType.key),
      accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/png': ['.png'],
        'image/jpeg': ['.jpeg', '.jpg']
      },
      multiple: false
    });

    const fileList = documents[docType.key] || [];
    const isBusy = uploading[docType.key];

    return (
      <div className="border border-borderlight bg-white rounded-nec p-5 shadow-premium space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">
            {docType.label} {docType.required && <span className="text-red-500">*</span>}
          </label>
          {fileList.length > 0 && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Uploaded
            </span>
          )}
        </div>

        {/* Dropzone Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-slate-300 hover:border-primary hover:bg-slate-50'
          } flex flex-col items-center justify-center min-h-[110px]`}
        >
          <input {...getInputProps()} />
          
          {isBusy ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-slate-500">Uploading document...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="w-7 h-7 text-slate-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-600">Drag & drop or browse</span>
              <span className="text-[10px] text-slate-400">PDF, DOCX, PNG, JPEG (Max 10MB)</span>
            </div>
          )}
        </div>

        {/* Uploaded File List */}
        {fileList.length > 0 && (
          <div className="space-y-2">
            {fileList.map((url, idx) => {
              const fileName = url.slice(url.lastIndexOf('/') + 1);
              return (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    {renderFileIcon(url)}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-700 hover:text-primary hover:underline truncate"
                    >
                      {fileName.slice(14) || `Document-${idx + 1}`} {/* Crop date prefix */}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(docType.key, idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-heading text-xl font-bold text-primary">Supporting Documents</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload certificates and relevant evidence to support the nomination. Certificates and Achievements are required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((docType) => (
          <DocumentDropzone key={docType.key} docType={docType} />
        ))}
      </div>
    </div>
  );
};

export default Step6Documents;
