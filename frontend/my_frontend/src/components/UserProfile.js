import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Dashboard.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [useUrl, setUseUrl] = useState(true);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/users/me');

      setUserData(response.data);
      setName(response.data.name || '');
      setProfilePicture(response.data.profilePicture || '');
      setPreviewImage(response.data.profilePicture || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfilePicture(base64String);
      setPreviewImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPictureUrl(url);
    setPreviewImage(url);
    setProfilePicture(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: name.trim(),
        profilePicture: profilePicture
      };

      await axios.put('/users/me', updateData);

      toast.success('Profile updated successfully!');
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture('');
    setPreviewImage('');
    setPictureUrl('');
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '20px' }}>Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <p className="text-danger">Failed to load profile data</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '20px auto' }}>
      <div className="tournaments-header">
        <h2>My Profile</h2>
        <p style={{ color: '#7f8c8d', margin: '10px 0 0 0' }}>Manage your profile information</p>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
        <form onSubmit={handleSubmit}>
          {/* Profile Picture Section */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
              Profile Picture
            </label>
            
            {previewImage && (
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src={previewImage} 
                  alt="Profile Preview" 
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '3px solid #3498db',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }} 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              </div>
            )}

            {!previewImage && (
              <div style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                backgroundColor: '#ecf0f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '3rem',
                color: '#7f8c8d',
                border: '3px solid #bdc3c7'
              }}>
                {userData.name ? userData.name[0].toUpperCase() : '?'}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
              <button
                type="button"
                className={`btn ${useUrl ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setUseUrl(true)}
              >
                Use URL
              </button>
              <button
                type="button"
                className={`btn ${!useUrl ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setUseUrl(false)}
              >
                Upload Image
              </button>
            </div>

            {useUrl ? (
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <input
                  type="url"
                  className="form-control"
                  placeholder="Enter image URL"
                  value={pictureUrl}
                  onChange={handleUrlChange}
                />
                <small className="text-muted">Enter a direct link to an image</small>
              </div>
            ) : (
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <small className="text-muted">Max size: 2MB</small>
              </div>
            )}

            {previewImage && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm mt-3"
                onClick={handleRemoveProfilePicture}
              >
                Remove Picture
              </button>
            )}
          </div>

          {/* Name Field */}
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
              Name
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email Field (Read-only) */}
          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              value={userData.email}
              disabled
              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
            />
            <small className="text-muted">Email cannot be changed</small>
          </div>

          {/* Account Info */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: '5px 0', color: '#555' }}>
              <strong>Member Since:</strong> {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {userData.team && (
              <p style={{ margin: '5px 0', color: '#555' }}>
                <strong>Team Status:</strong> <span style={{ color: '#27ae60' }}>Active</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
