import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { Loader2, Send } from 'lucide-react';

function Assessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If we land here directly without state, fetch report which contains questions
    if (questions.length === 0) {
      api.get(`/assessment/report/${id}`)
        .then(res => setQuestions(res.data.questions))
        .catch(err => setError('Failed to load assessment.'));
    }
  }, [id, questions.length]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/assessment/evaluate/${id}`, { answers });
      navigate(`/report/${id}`);
    } catch (err) {
      setError('Failed to evaluate assessment. ' + (err.response?.data?.error || err.message));
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (qId, text) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  if (!questions.length && !error) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Technical Assessment</h2>
        <p className="text-dark-text-muted h-1 bg-dark-border rounded-full overflow-hidden mt-6">
           <div className="bg-gradient-to-r from-brand-500 to-indigo-500 w-full h-full"></div>
        </p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>}

      <div className="space-y-8">
        {questions.map((q, index) => (
          <div key={q.id} className="glass-panel p-8 transition-transform hover:shadow-brand-500/10 hover:border-brand-500/30">
            <h3 className="text-xl font-semibold mb-6 flex items-start gap-4">
              <span className="bg-brand-500/20 text-brand-400 text-sm py-1 px-3 rounded-md min-w-[max-content]">Q {index + 1}</span> 
              <span className="leading-relaxed">{q.question}</span>
            </h3>
            {q.type === 'mcq' ? (
              <div className="space-y-3 mt-4">
                {q.options?.map((opt, oIdx) => (
                  <label key={oIdx} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === opt ? 'border-brand-500 bg-brand-500/10' : 'border-dark-border/50 hover:bg-dark-bg/50'}`}>
                    <input 
                      type="radio" 
                      name={`question-${q.id}`} 
                      value={opt} 
                      checked={answers[q.id] === opt}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      disabled={submitting}
                      className="w-4 h-4 text-brand-500 bg-dark-bg border-dark-border focus:ring-brand-500 focus:ring-2"
                    />
                    <span className="text-slate-300">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full glass-input min-h-[150px] resize-y p-5 leading-relaxed font-mono text-sm"
                placeholder="Write your answer here..."
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                disabled={submitting}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <button 
          onClick={handleSubmit} 
          disabled={submitting} 
          className="primary-button py-4 px-10 flex items-center gap-3 text-lg"
        >
          {submitting ? (
             <><Loader2 className="w-6 h-6 animate-spin" /> Evaluating...</>
          ) : (
             <><Send className="w-5 h-5" /> Submit Assessment</>
          )}
        </button>
      </div>
    </div>
  );
}

export default Assessment;
