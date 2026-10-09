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
  const nominationType = watch('nominationType') || 'self';
  const [uploading, setUploading] = useState({});

  const documentTypes = [
    { key: 'photos', label: 'Two Recent Photographs', required: true, maxFiles: 2, imagesOnly: true },
    { key: 'identityProof', label: 'Proof of Identity', required: true },
    { key: 'eligibilityProof', label: 'Documents Proving Eligibility', required: true },
    { key: 'certificates', label: 'Academic & Professional Certificates', required: true },
    { key: 'achievements', label: 'Awards & Achievements Proof', required: true },
    { key: 'appreciationLetters', label: 'Letters of Appreciation / News Articles', required: true },
    { key: 'shortProfile', label: 'Short Profile', required: true },
    ...(nominationType === 'self' ? [] : [
      { key: 'nomineeDetails', label: 'Nominee Details', required: true },
      { key: 'nomineeConsent', label: 'Nominee Consent Letter', required: true },
    ]),
    { key: 'organizationProfile', label: 'Organization Profile / Brochure', required: false },
    { key: 'patents', label: 'Patents Copy (if any)', required: false },
    { key: 'publications', label: 'Publications / Journals Copy (if any)', required: false },
    { key: 'necAlumniCertificate', label: 'NEC Alumni Registration Certificate', required: false },
    { key: 'otherDocuments', label: 'Other Supporting Documents', required: false }
  ];

  const handleUpload = async (files, docType) => {
    if (!files || files.length === 0) return;
    const { key } = docType;
    const invalidFile = files.find((file) => file.size > 10 * 1024 * 1024);

    // File validation: Size <= 10MB
    if (invalidFile) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [key]: true }));
      const filesToUpload = docType.maxFiles ? files.slice(0, docType.maxFiles - (documents[key]?.length || 0)) : files.slice(0, 1);
      if (filesToUpload.length === 0) {
        toast.info(`You can upload up to ${docType.maxFiles} files here.`);
        return;
      }
      const responses = await Promise.all(filesToUpload.map((selectedFile) => uploadFile(selectedFile)));
      
      const currentList = documents[key] || [];
      setValue(`documents.${key}`, [...currentList, ...responses.map((response) => response.fileUrl)], {
        shouldValidate: true
      });
      toast.success(`${filesToUpload.length} file${filesToUpload.length === 1 ? '' : 's'} uploaded successfully.`);
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
    const isImage = /\.(jpeg|jpg|png|webp|gif|bmp|heic|heif|svg)$/i.test(url);
    if (isImage) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-red-500" />;
  };

  // Document Dropzone Sub-Component
  const DocumentDropzone = ({ docType }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => handleUpload(acceptedFiles, docType),
      accept: docType.imagesOnly ? {
        'image/png': ['.png'],
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/webp': ['.webp'],
        'image/gif': ['.gif'],
        'image/bmp': ['.bmp'],
        'image/heic': ['.heic'],
        'image/heif': ['.heif'],
      } : {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'application/vnd.ms-powerpoint': ['.ppt'],
        'text/plain': ['.txt'],
        'application/rtf': ['.rtf'],
        'text/csv': ['.csv'],
        'image/png': ['.png'],
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/webp': ['.webp'],
        'image/gif': ['.gif'],
        'image/heic': ['.heic'],
      },
      multiple: Boolean(docType.maxFiles),
      maxFiles: docType.maxFiles || 1
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
              <span className="text-[10px] text-slate-400">
                {docType.imagesOnly ? 'PNG, JPG, WEBP, GIF, HEIC (Max 10MB)' : 'PDF, DOCX, DOC, XLS, PPT, TXT, PNG, JPG, WEBP (Max 10MB)'}
              </span>
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
          Upload the signed application, two recent photographs, identity and eligibility proof, achievement evidence, appreciation letters or news articles, and a short profile. Nominations by others also need nominee details and a consent letter.
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
