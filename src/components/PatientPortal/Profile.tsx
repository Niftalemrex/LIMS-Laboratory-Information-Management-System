import React, { useState, type ChangeEvent, type FormEvent } from 'react';

import './Profile.css';

type LanguageOption = 'English' | 'Amharic' | 'Spanish' | 'French';

interface ProfileData {
  email: string;
  phone: string;
  language: LanguageOption;
}

const initialProfile: ProfileData = {
  email: 'user@example.com',
  phone: '+251912345678',
  language: 'English',
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Basic email pattern
    if (!profile.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Basic phone validation (allow digits, spaces, +, -, parentheses)
    if (!profile.phone.match(/^[\d\s+\-()]{7,}$/)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Future: send updated profile to backend here
    setEditMode(false);
    alert('Profile updated successfully!');
  };

  return (
    <section className="profile-container">
      <h1 className="profile-title">Your Profile</h1>
      <p className="profile-subtitle">Manage your personal information and settings.</p>

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={profile.email}
          onChange={handleChange}
          disabled={!editMode}
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          required
        />
        {errors.email && (
          <span id="email-error" className="error-message">
            {errors.email}
          </span>
        )}

        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={profile.phone}
          onChange={handleChange}
          disabled={!editMode}
          aria-invalid={errors.phone ? 'true' : undefined}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          required
        />
        {errors.phone && (
          <span id="phone-error" className="error-message">
            {errors.phone}
          </span>
        )}

        <label htmlFor="language">Preferred Language</label>
        <select
          id="language"
          name="language"
          value={profile.language}
          onChange={handleChange}
          disabled={!editMode}
        >
          <option value="English">English</option>
          <option value="Amharic">Amharic</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>

        <div className="profile-actions">
          {editMode ? (
            <>
              <button type="submit" className="btn btn-save">
                Save
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => {
                  setEditMode(false);
                  setProfile(initialProfile);
                  setErrors({});
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-edit"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

export default Profile;
