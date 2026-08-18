// src/components/common/ProfilePictureUpload.tsx
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProfilePictureUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  size = 'md',
  editable = true,
  onUploadSuccess,
  onUploadError,
}) => {
  const { user, uploadProfilePicture, loading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const profilePicture = previewUrl || user?.profile_picture || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=200&color=fff&bold=true`;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const url = await uploadProfilePicture(file);
      onUploadSuccess?.(url);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (editable && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full overflow-hidden 
          ${editable ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
          ${isUploading ? 'opacity-50' : ''}
          bg-gray-200
        `}
        onClick={handleClick}
      >
        <img
          src={profilePicture}
          alt="Profile"
          className="w-full h-full object-cover"
        />
        
        {(isUploading || loading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {editable && (
        <>
          <button
            onClick={handleClick}
            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 border-2 border-white hover:bg-primary-dark transition-colors duration-200"
            disabled={isUploading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </>
      )}
    </div>
  );
};

export default ProfilePictureUpload;