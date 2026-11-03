// src/components/common/ProfilePictureUpload.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

interface ProfilePictureUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

const sizeClasses: Record<NonNullable<ProfilePictureUploadProps['size']>, string> = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  size = 'md',
  editable = true,
  onUploadSuccess,
  onUploadError,
}) => {
  const { user } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Derive a display name the same way AdminHeader does
  const displayName =
    user?.full_name ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name) ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'User';

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=amber&color=fff&size=200&bold=true`;

  const profilePicture =
    previewUrl || user?.profile_picture || fallbackAvatar;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so selecting the same file again still triggers change
    e.target.value = '';

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

    // Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload via API
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response: any = await api.patch('/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response?.data ?? response;
      const uploadedUrl: string | undefined =
        data?.profile_picture ?? data?.profile_picture_url;

      if (uploadedUrl) {
        setPreviewUrl(uploadedUrl);
        onUploadSuccess?.(uploadedUrl);
      } else {
        onUploadSuccess?.(objectUrl);
      }
    } catch (error) {
      // Revert preview on failure
      setPreviewUrl(null);
      onUploadError?.(
        error instanceof Error ? error.message : 'Upload failed'
      );
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

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
          </div>
        )}
      </div>

      {editable && (
        <>
          <button
            type="button"
            onClick={handleClick}
            className="absolute bottom-0 right-0 bg-amber-500 text-white rounded-full p-1.5 border-2 border-white hover:bg-amber-600 transition-colors duration-200"
            disabled={isUploading}
            aria-label="Change profile picture"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
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