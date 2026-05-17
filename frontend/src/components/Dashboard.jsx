import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Code2, Loader2, Sparkles } from 'lucide-react';

function Dashboard() {
  const [language, setLanguage] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/assessment/generate', { language, topic });
      navigate(`/assessment/${res.data.id}`, { state: { questions: res.data.questions, language, topic } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate assessment. Ensure the LLM is running.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-panel p-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-brand-500/20 text-brand-400 rounded-full mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold mb-4">New Assessment</h2>
          <p className="text-dark-text-muted text-lg">Pick a language and topic. Our AI will generate custom interview questions for you.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-dark-text-muted">Programming Language</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Code2 className="h-5 w-5 text-dark-text-muted" />
              </div>
              <input
                type="text"
                className="w-full glass-input pl-12 py-3 text-lg"
                placeholder="e.g. JavaScript, Python, React"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-3 text-dark-text-muted">Specific Topic</label>
            <input
              type="text"
              className="w-full glass-input py-3 text-lg"
              placeholder="e.g. Hooks, Context API, Async/Await"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full primary-button py-4 mt-8 flex justify-center items-center text-lg gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating Assessment...
              </>
            ) : (
              'Start Interview'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
