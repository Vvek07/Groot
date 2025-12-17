import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.image?.url);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.put('/api/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser(response.data.user);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-dark-bg overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6 bg-gradient-to-r from-highlight to-pink-500 bg-clip-text text-transparent">
          Edit Profile
        </h1>

        <div className="glass-effect rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6 text-center">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-highlight"
                />
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white p-2 rounded-full cursor-pointer transition transform hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-text-secondary mt-2">Click the camera icon to change your profile picture</p>
            </div>

            <div className="mb-4">
              <label className="block text-text-primary text-sm font-bold mb-2">Username</label>
              <input
                type="text"
                value={user?.username}
                disabled
                className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-secondary cursor-not-allowed"
              />
            </div>

            <div className="mb-4">
              <label className="block text-text-primary text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-text-secondary cursor-not-allowed"
              />
            </div>

            <div className="mb-6">
              <label className="block text-text-primary text-sm font-bold mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
                maxLength="500"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary placeholder-text-secondary"
              />
              <p className="text-xs text-text-secondary mt-1">{bio.length}/500 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 transform hover:scale-105"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Account Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-dark-hover rounded-lg">
              <p className="text-3xl font-bold text-highlight">{user?.friends?.length || 0}</p>
              <p className="text-sm text-text-secondary">Friends</p>
            </div>
            <div className="text-center p-4 bg-dark-hover rounded-lg">
              <p className="text-3xl font-bold bg-gradient-to-r from-highlight to-pink-500 bg-clip-text text-transparent">{user?.groups?.length || 0}</p>
              <p className="text-sm text-text-secondary">Groups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
