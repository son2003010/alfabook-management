import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import logo from '../assets/logo.png';

const AdminLoginPage = () => {
  const [adminCode, setAdminCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  // Declare navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: adminCode, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Handle success, e.g., save token and navigate
        console.log('Login successful:', data);
        // Navigate to AdminPage
        navigate('/admin');  // Navigate to AdminPage
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('An error occurred, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Image Section */}
        <div className="flex items-center justify-center w-1/2 p-6">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label htmlFor="admin-code" className="block text-sm font-medium text-gray-600 mb-1">
                Tài Khoản/Username
              </label>
              <input 
                type="text" 
                id="admin-code" 
                placeholder="Nhập username" 
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                Mật Khẩu
              </label>
              <input 
                type="password" 
                id="password" 
                placeholder="Nhập mật khẩu" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-gray-400 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
