import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Loader2, ArrowLeft, CheckCircle, Target, Award } from 'lucide-react';

function Report() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/assessment/report/${id}`)
      .then(res => setData(res.data))
      .catch(err => setError('Failed to load report.'));
  }, [id]);

  if (error) return <div className="text-red-400 p-4 max-w-lg mx-auto text-center mt-20">{error}</div>;
  if (!data) return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-brand-500" /></div>;

  const { evaluation, questions, answers, language, topic } = data;
  
  if (!evaluation) {
     return (
        <div className="max-w-2xl mx-auto glass-panel p-10 text-center">
            <h2 className="text-2xl font-semibold mb-4">Evaluation Pending</h2>
            <p className="text-dark-text-muted mb-6">Looks like you didn't finish this assessment.</p>
            <Link to={`/assessment/${id}`} className="primary-button inline-flex">Resume Assessment</Link>
        </div>
     );
  }

  // Determine score color
  const score = evaluation.score || 0;
  let scoreColor = "text-green-400";
  let ringColor = "ring-green-400/30";
  if (score < 50) { scoreColor = "text-red-400"; ringColor = "ring-red-400/30"; }
  else if (score < 80) { scoreColor = "text-yellow-400"; ringColor = "ring-yellow-400/30"; }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
           <Link to="/dashboard" className="text-dark-text-muted hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
           </Link>
           <h2 className="text-4xl font-bold flex items-center gap-4">
              Interview Evaluation
           </h2>
           <p className="text-dark-text-muted mt-2 text-lg">{language} • {topic}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className={`glass-panel p-8 col-span-1 flex flex-col items-center justify-center ring-2 ${ringColor}`}>
            <Award className={`w-16 h-16 mb-4 ${scoreColor}`} />
            <div className={`text-6xl font-bold ${scoreColor}`}>{score}</div>
            <div className="text-dark-text-muted text-sm mt-3 uppercase tracking-widest">Overall Score</div>
         </div>
         <div className="glass-panel p-8 col-span-1 md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Target className="w-6 h-6 text-brand-400"/> AI Feedback</h3>
            <p className="text-slate-300 leading-relaxed text-lg">{evaluation.feedback}</p>
         </div>
      </div>

      <div className="glass-panel p-8">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-indigo-400"/> Key Improvements</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluation.improvements?.map((item, idx) => (
            <li key={idx} className="bg-dark-bg/50 p-4 rounded-lg border border-dark-border/50 flex items-start gap-3 shadow-inner">
               <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
               <span className="text-slate-300 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-6 mt-12">
        <h3 className="text-2xl font-bold mb-6">Detailed Q&A Transcript</h3>
        {questions.map((q, index) => (
          <div key={q.id} className="glass-panel p-6 border-l-4 border-brand-500">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-brand-500/20 text-brand-400 text-xs py-1 px-2 rounded font-bold uppercase">{q.type === 'mcq' ? 'MCQ' : 'Descriptive'}</span>
              <h4 className="font-semibold text-lg text-white">Q{index + 1}: {q.question}</h4>
            </div>
            
            {q.type === 'mcq' && (
              <div className="mb-4 pl-4 border-l-2 border-dark-border/50">
                <p className="text-sm text-slate-400 mb-2">Options:</p>
                <ul className="list-disc pl-5 text-sm text-slate-300 mb-2">
                  {q.options?.map((opt, i) => <li key={i}>{opt}</li>)}
                </ul>
              </div>
            )}
            
            <div className="bg-dark-bg p-5 rounded-md border border-dark-border font-mono text-sm text-slate-300 whitespace-pre-wrap">
              <span className="text-brand-400 font-bold block mb-2">Your Answer:</span>
              {answers[q.id] || <span className="italic text-slate-500">No answer provided.</span>}
            </div>
            
            {q.type === 'mcq' && q.correctAnswer && (
              <div className="mt-3 text-sm flex gap-2">
                 <span className="font-bold text-slate-400">Correct Answer:</span> 
                 <span className={answers[q.id] === q.correctAnswer ? "text-green-400" : "text-red-400"}>{q.correctAnswer}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Report;
