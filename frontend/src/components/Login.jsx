import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { LogIn } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto glass-panel p-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-brand-500/20 text-brand-500 rounded-2xl flex flex-col items-center justify-center mb-4">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold">Welcome Back</h2>
        <p className="text-dark-text-muted mt-2">Log in to continue your mock interviews</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-text-muted">Username</label>
          <input
            type="text"
            className="w-full glass-input"
            placeholder="Enter your username"
            value={username} onChange={(e) => setUsername(e.target.value)} required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-dark-text-muted">Password</label>
          <input
            type="password"
            className="w-full glass-input"
            placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>

        <button type="submit" className="w-full primary-button py-3 mt-4 text-center">
          Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-dark-text-muted text-sm">
        Don't have an account? <Link to="/register" className="text-brand-500 hover:text-brand-400 transition-colors font-medium">Create one</Link>
      </p>
    </div>
  );
}

export default Login;
