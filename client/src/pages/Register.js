import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-highlight to-pink-500 bg-clip-text text-transparent mb-2">
            Groot1
          </h1>
          <p className="text-text-secondary">by Vivek</p>
        </div>
        <h2 className="text-2xl font-semibold text-center text-text-primary mb-6">Join Us Today</h2>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text-primary text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary"
              required
              minLength="3"
            />
          </div>

          <div className="mb-4">
            <label className="block text-text-primary text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-text-primary text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 transform hover:scale-105"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-highlight hover:text-pink-500 font-semibold">
            Login
          </Link>
        </p>
        
        <div className="mt-6 p-4 bg-dark-hover rounded-lg border border-highlight/20">
          <p className="text-sm text-text-secondary text-center">
            🤖 Get instant access to Vivek's AI Assistant powered by Google Gemini!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
