import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader';

const ProfileSettings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    notifications: true,
    privacy: 'public',
    security: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(form);
      setSuccess('Profile updated!');
    } catch {
      setError('Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" required />
        <input name="avatar" value={form.avatar} onChange={handleChange} placeholder="Avatar URL" className="border p-2 rounded" />
        <select name="privacy" value={form.privacy} onChange={handleChange} className="border p-2 rounded">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <input name="security" value={form.security} onChange={handleChange} placeholder="Security (e.g. password)" className="border p-2 rounded" type="password" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="notifications" checked={form.notifications} onChange={e => setForm({ ...form, notifications: e.target.checked })} />
          Enable notifications
        </label>
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">Update Profile</button>
        {loading && <Loader />}
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
      </form>
      <div className="mt-6 text-sm text-gray-600">
        <a href="/help">Help Center</a> | <a href="/contact">Contact</a>
      </div>
    </div>
  );
};

export default ProfileSettings;
