// src/pages/Profile.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProfilePictureUpload from '../components/common/ProfilePictureUpload';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const handleUploadSuccess = (url: string) => {
    console.log('Profile picture uploaded:', url);
    // Update user profile with new picture URL
    updateProfile({ profile_picture: url });
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <ProfilePictureUpload
            size="xl"
            editable={true}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {user?.name}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-400 mt-1">{user?.bio}</p>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="font-medium">{user?.phone || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Country</label>
              <p className="font-medium">{user?.country || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Region</label>
              <p className="font-medium">{user?.region || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">City</label>
              <p className="font-medium">{user?.city || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;