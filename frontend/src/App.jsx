import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Assessment from './components/Assessment';
import Report from './components/Report';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen text-dark-text flex flex-col font-sans">
        <header className="py-6 px-10 border-b border-dark-border/50 bg-dark-bg/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-indigo-400 bg-clip-text text-transparent">
              AI Mock Interview 
            </h1>
            {localStorage.getItem('token') && (
              <button 
                onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                className="text-sm text-dark-text-muted hover:text-white transition-colors"
              >
                Log Out
              </button>
            )}
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-6">
          <div className="w-full max-w-7xl">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              
              <Route path="/assessment/:id" element={
                <PrivateRoute><Assessment /></PrivateRoute>
              } />
              
              <Route path="/report/:id" element={
                <PrivateRoute><Report /></PrivateRoute>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
