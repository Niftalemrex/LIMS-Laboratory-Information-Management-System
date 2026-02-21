import React, { useState, useRef, useEffect } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './Profile.css';

interface UserMenuProfile {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
}

interface ProfileProps {
  userMenuProfile: UserMenuProfile;
  setUserMenuProfile: React.Dispatch<React.SetStateAction<UserMenuProfile>>;
}

const Profile: React.FC<ProfileProps> = ({ userMenuProfile, setUserMenuProfile }) => {
  const { t } = useAppSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserMenuProfile>(userMenuProfile);
  const [avatarPreview, setAvatarPreview] = useState(
    userMenuProfile.avatar_url || '/static/images/default-avatar.png'
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync editData and avatarPreview when userMenuProfile changes
  useEffect(() => {
    setEditData(userMenuProfile);
    setAvatarPreview(userMenuProfile.avatar_url || '/static/images/default-avatar.png');
  }, [userMenuProfile]);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/tenantadmin/profiles/');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const profile = data.length > 0 ? data[0] : null;

        if (profile) {
          profile.avatar_url = profile.avatar_url || '/static/images/default-avatar.png';
          setUserMenuProfile(profile);
          setEditData(profile);
          setAvatarPreview(profile.avatar_url);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [setUserMenuProfile]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setEditData(userMenuProfile);
    setAvatarPreview(userMenuProfile.avatar_url || '/static/images/default-avatar.png');
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', editData.name);
    formData.append('email', editData.email);
    if (avatarFile) formData.append('avatar', avatarFile);
  
    try {
      const method = editData.id ? 'PATCH' : 'POST';
      const url = editData.id
        ? `http://127.0.0.1:8000/api/tenantadmin/profiles/${editData.id}/`
        : 'http://127.0.0.1:8000/api/tenantadmin/profiles/';
  
      const res = await fetch(url, {
        method,
        body: formData,
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
  
      const updated = await res.json();
      updated.avatar_url = updated.avatar_url || '/static/images/default-avatar.png';
      setUserMenuProfile(updated);
      setEditData(updated);
      setAvatarPreview(updated.avatar_url);
      setAvatarFile(null);
      setIsEditing(false);
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Error saving profile: ' + err);
    }
  };
  

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{t('profile')}</h1>
        <div className="header-actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={handleEdit}>
              {t('edit_profile')}
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                {t('cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {t('save_changes')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img src={avatarPreview} alt={editData.name} className="profile-avatar" />
              {isEditing && (
                <>
                  <button
                    className="avatar-edit-btn"
                    onClick={triggerFileInput}
                    aria-label="Change profile picture"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14.06 9.02L14.98 9.94L5.92 19H5V18.08L14.06 9.02ZM17.66 3C17.41 3 17.15 3.1 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C18.17 3.09 17.92 3 17.66 3ZM14.06 6.19L3 17.25V21H6.75L17.81 9.94L14.06 6.19Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>

            <div className="avatar-info">
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label htmlFor="name">{t('name')}</label>
                    <input
                      id="name"
                      type="text"
                      value={editData.name}
                      onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">{t('email')}</label>
                    <input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={e => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2>{userMenuProfile.name}</h2>
                  <p>{userMenuProfile.email}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
