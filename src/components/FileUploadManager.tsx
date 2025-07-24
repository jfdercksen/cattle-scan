import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
  fileId: string;
}

export interface CaptureResult {
  success: boolean;
  file?: File;
  error?: string;
}

export type DocumentType = 'brand_photo' | 'vet_letterhead' | 'affidavit';

interface FileUploadManagerProps {
  documentType: DocumentType;
  label: string;
  required?: boolean;
  accept?: string;
  maxSizeBytes?: number;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadStart?: () => void;
  currentFileUrl?: string;
  disabled?: boolean;
}

const ALLOWED_FILE_TYPES = {
  brand_photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  vet_letterhead: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
  affidavit: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
};

const STORAGE_BUCKETS = {
  brand_photo: 'documents',
  vet_letterhead: 'documents', 
  affidavit: 'livestock_affidavits'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  documentType,
  label,
  required = false,
  accept,
  maxSizeBytes = MAX_FILE_SIZE,
  onUploadComplete,
  onUploadStart,
  currentFileUrl,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(currentFileUrl || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFileType = useCallback((file: File): boolean => {
    const allowedTypes = ALLOWED_FILE_TYPES[documentType];
    return allowedTypes.includes(file.type);
  }, [documentType]);

  const validateFileSize = useCallback((file: File): boolean => {
    return file.size <= maxSizeBytes;
  }, [maxSizeBytes]);

  const generateFileName = useCallback((file: File, userId?: string): string => {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const baseName = documentType.replace('_', '-');
    return userId 
      ? `${baseName}_${userId}_${timestamp}.${extension}`
      : `${baseName}_${timestamp}.${extension}`;
  }, [documentType]);

  const uploadBrandPhoto = async (file: File, userId: string): Promise<UploadResult> => {
    const fileName = generateFileName(file, userId);
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.brand_photo)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
        fileId: fileName
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.brand_photo)
      .getPublicUrl(data.path);

    return {
      success: true,
      fileUrl: publicUrlData.publicUrl,
      fileId: data.path
    };
  };

  const uploadVetLetterhead = async (file: File, userId: string): Promise<UploadResult> => {
    const fileName = generateFileName(file, userId);
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.vet_letterhead)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
        fileId: fileName
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.vet_letterhead)
      .getPublicUrl(data.path);

    return {
      success: true,
      fileUrl: publicUrlData.publicUrl,
      fileId: data.path
    };
  };

  const uploadAffidavit = async (file: File, listingId?: string): Promise<UploadResult> => {
    const fileName = listingId 
      ? generateFileName(file, listingId)
      : generateFileName(file);
    
    console.log('Uploading affidavit with filename:', fileName);
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.affidavit)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Affidavit upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
        fileId: fileName
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.affidavit)
      .getPublicUrl(data.path);

    return {
      success: true,
      fileUrl: publicUrlData.publicUrl,
      fileId: data.path
    };
  };

  const capturePhoto = async (): Promise<CaptureResult> => {
    try {
      // Trigger camera input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Camera capture failed'
      };
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    // Validate file type
    if (!validateFileType(file)) {
      const allowedTypes = ALLOWED_FILE_TYPES[documentType].join(', ');
      setError(`Invalid file type. Allowed types: ${allowedTypes}`);
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
      setError(`File size too large. Maximum size: ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [documentType, validateFileType, validateFileSize, maxSizeBytes]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    onUploadStart?.();

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      let result: UploadResult;
      
      // Get user ID for file naming
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      switch (documentType) {
        case 'brand_photo':
          result = await uploadBrandPhoto(selectedFile, userId || 'anonymous');
          break;
        case 'vet_letterhead':
          result = await uploadVetLetterhead(selectedFile, userId || 'anonymous');
          break;
        case 'affidavit':
          result = await uploadAffidavit(selectedFile, userId);
          break;
        default:
          throw new Error('Invalid document type');
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadedFileUrl(result.fileUrl || null);
        toast({
          title: "Upload Successful",
          description: "File uploaded successfully",
          variant: "default"
        });
        onUploadComplete?.(result);
      } else {
        setError(result.error || 'Upload failed');
        toast({
          title: "Upload Failed",
          description: result.error || 'Upload failed',
          variant: "destructive"
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedFileUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const getAcceptAttribute = () => {
    if (accept) return accept;
    return ALLOWED_FILE_TYPES[documentType].join(',');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`file-upload-${documentType}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        {/* File Input Controls */}
        <div className="mt-2 space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={capturePhoto}
              disabled={disabled || uploading}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>

          {/* Hidden file inputs */}
          <Input
            ref={fileInputRef}
            type="file"
            accept={getAcceptAttribute()}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          <Input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Preview */}
      {(selectedFile || uploadedFileUrl) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : uploadedFileUrl ? (
                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                    <File className="w-6 h-6 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                    <File className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile?.name || 'Uploaded file'}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  )}
                  
                  {uploadedFileUrl && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">Uploaded</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={disabled || uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-3">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && !uploadedFileUrl && !uploading && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={disabled}
                  className="w-full"
                >
                  Upload File
                </Button>
              </div>
            )}

            {/* View Uploaded File */}
            {uploadedFileUrl && (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(uploadedFileUrl, '_blank')}
                  className="w-full"
                >
                  View File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Requirements Info */}
      <div className="text-xs text-gray-500">
        <p>Accepted formats: {ALLOWED_FILE_TYPES[documentType].join(', ')}</p>
        <p>Maximum size: {formatFileSize(maxSizeBytes)}</p>
      </div>
    </div>
  );
};

export default FileUploadManager;