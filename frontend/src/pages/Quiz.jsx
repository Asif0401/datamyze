import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

export default function Quiz() {
  const { refreshUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/quiz').then(r => setQuizzes(r.data.quizzes)).finally(() => setLoading(false));
  }, []);

  async function startQuiz(q) {
    setLoading(true);
    const { data } = await api.get(`/quiz/${q.id}`);
    setQuiz(data.quiz);
    setQuestions(data.questions);
    setCurrent(0);
    setAnswers({});
    setAnswered(false);
    setResults(null);
    setLoading(false);
  }

  function selectAnswer(qId, idx) {
    if (answered) return;
    setAnswers(a => ({ ...a, [qId]: idx }));
  }

  function checkAnswer() {
    setAnswered(true);
  }

  function next() {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setAnswered(false);
    } else {
      submitQuiz();
    }
  }

  async function submitQuiz() {
    setSubmitting(true);
    const { data } = await api.post(`/quiz/${quiz.id}/submit`, { answers });
    setResults(data);
    refreshUser();
    setSubmitting(false);
  }

  function restart() {
    setCurrent(0);
    setAnswers({});
    setAnswered(false);
    setResults(null);
  }

  if (loading) return <div className="loading"><div className="spinner" />Loading quiz...</div>;

  if (!quiz) {
    return (
      <div className="page">
        <div className="page-header"><div className="page-title">🧠 Quizzes</div><div className="page-sub">Test your knowledge and earn XP</div></div>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: 500 }}>
          {quizzes.map(q => (
            <div key={q.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: 36 }}>🧠</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{q.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Multiple choice · Earn up to +210 XP</div>
              </div>
              <button className="btn-primary" onClick={() => startQuiz(q)}>Start →</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results) {
    const pct = Math.round(results.score / results.total * 100);
    return (
      <div className="page">
        <div className="page-header"><div className="page-title">🧠 Quiz Results</div></div>
        <div className="card" style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: 60, marginBottom: '1rem' }}>{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#7ab8f0', marginBottom: '0.3rem' }}>{results.score}/{results.total}</div>
          <div style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>You scored {pct}% — {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good effort!' : 'Keep practicing!'}</div>
          {results.xp_earned > 0 && (
            <div style={{ background: 'rgba(74,144,217,0.14)', border: '1px solid rgba(74,144,217,0.25)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '1.5rem', color: '#7ab8f0', fontWeight: 600 }}>
              🎉 +{results.xp_earned} XP earned!
            </div>
          )}
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            {results.results?.map((r, i) => (
              <div key={r.question_id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{i + 1}. {r.question}</div>
                <div style={{ fontSize: 12, color: r.correct ? 'var(--teal)' : 'var(--coral)', fontWeight: 600 }}>{r.correct ? '✓ Correct' : `✗ Wrong — correct: ${r.options[r.correct_index]}`}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={restart}>Try Again</button>
            <button className="btn-secondary" onClick={() => setQuiz(null)}>Back to Quizzes</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const selected = answers[q?.id];
  const progPct = Math.round((current / questions.length) * 100);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🧠 {quiz.title}</div>
        <div className="page-sub">Question {current + 1} of {questions.length}</div>
      </div>
      <div style={{ maxWidth: 560 }}>
        <div className="quiz-progress"><div className="quiz-progress-fill" style={{ width: `${progPct}%` }} /></div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: '1.5rem', lineHeight: 1.5 }}>{q.question}</div>
          {q.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (answered) {
              if (i === q.correct_index) cls += ' correct';
              else if (i === selected && i !== q.correct_index) cls += ' wrong';
            } else if (i === selected) cls += ' selected';
            return (
              <button key={i} className={cls} onClick={() => selectAnswer(q.id, i)}>
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            );
          })}
          {answered && q.explanation && (
            <div className="explanation-box">💡 {q.explanation}</div>
          )}
          <div style={{ marginTop: '1rem' }}>
            {!answered
              ? <button className="btn-primary" onClick={checkAnswer} disabled={selected === undefined}>Check Answer</button>
              : <button className="btn-primary" onClick={next} disabled={submitting}>{current + 1 < questions.length ? 'Next Question →' : submitting ? 'Submitting...' : 'See Results →'}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
