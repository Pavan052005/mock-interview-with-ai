import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus } from 'lucide-react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { username, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto glass-panel p-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex flex-col items-center justify-center mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold">Create Account</h2>
        <p className="text-dark-text-muted mt-2">Start practicing interviews with AI</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-text-muted">Username</label>
          <input 
            type="text" 
            className="w-full glass-input" 
            placeholder="Choose a username"
            value={username} onChange={(e) => setUsername(e.target.value)} required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-text-muted">Password</label>
          <input 
            type="password" 
            className="w-full glass-input" 
            placeholder="Create a password"
            value={password} onChange={(e) => setPassword(e.target.value)} required 
          />
        </div>
        
        <button type="submit" className="w-full primary-button py-3 mt-4 text-center bg-indigo-600 hover:bg-indigo-500">
          Sign Up
        </button>
      </form>

      <p className="mt-6 text-center text-dark-text-muted text-sm">
        Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Log in</Link>
      </p>
    </div>
  );
}

export default Register;
