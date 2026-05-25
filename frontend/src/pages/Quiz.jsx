import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

// Screen states
const SCREEN = {
  COURSE_SELECT: 'course_select',
  TOPIC_SELECT: 'topic_select',
  QUIZ: 'quiz',
  RESULTS: 'results',
};

export default function Quiz() {
  const { refreshUser } = useAuth();
  const [screen, setScreen] = useState(SCREEN.COURSE_SELECT);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});   // { questionId: selectedIndex }
  const [revealed, setRevealed] = useState(false); // whether current question is answered
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);

  useEffect(() => {
    api.get('/quiz/courses')
      .then(r => setCourses(r.data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  async function selectCourse(course) {
    setSelectedCourse(course);
    setLoading(true);
    const r = await api.get(`/quiz/topics/${course.id}`);
    setTopics(r.data.topics || []);
    setSelectedTopic(null);
    setQuestionCount(5);
    setLoading(false);
    setScreen(SCREEN.TOPIC_SELECT);
  }

  async function startQuiz() {
    setLoading(true);
    const topic = selectedTopic === 'All' || !selectedTopic ? undefined : selectedTopic;
    const params = { course_id: selectedCourse.id, limit: questionCount };
    if (topic) params.topic = topic;
    const r = await api.get('/quiz/questions', { params });
    setQuestions(r.data.questions || []);
    setCurrent(0);
    setAnswers({});
    setRevealed(false);
    setResults(null);
    setXpTotal(0);
    setLoading(false);
    setScreen(SCREEN.QUIZ);
  }

  function handleOptionClick(qId, idx) {
    if (revealed) return;
    setAnswers(prev => ({ ...prev, [qId]: idx }));
    setRevealed(true);
    // Track XP live
    const q = questions[current];
    if (idx === q.correct_index) {
      setXpTotal(prev => prev + 30);
    }
  }

  function goNext() {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setRevealed(false);
    } else {
      submitQuiz();
    }
  }

  async function submitQuiz() {
    setSubmitting(true);
    const question_ids = questions.map(q => q.id);
    try {
      const { data } = await api.post('/quiz/submit', {
        course_id: selectedCourse.id,
        topic: selectedTopic,
        answers,
        question_ids,
      });
      setResults(data);
      refreshUser();
    } catch (e) {
      // fallback: compute locally
      let score = 0;
      questions.forEach(q => { if (answers[q.id] === q.correct_index) score++; });
      setResults({ score, total: questions.length, xp_earned: score * 30 });
    }
    setSubmitting(false);
    setScreen(SCREEN.RESULTS);
  }

  function resetToTopics() {
    setScreen(SCREEN.TOPIC_SELECT);
    setResults(null);
  }

  function resetToCourses() {
    setScreen(SCREEN.COURSE_SELECT);
    setSelectedCourse(null);
    setSelectedTopic(null);
    setResults(null);
  }

  if (loading) {
    return <div className="loading"><div className="spinner" />Loading...</div>;
  }

  // ── Course Selection ──────────────────────────────────────────────────────
  if (screen === SCREEN.COURSE_SELECT) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">Quiz Center</div>
          <div className="page-sub">Choose a course to test your knowledge and earn XP</div>
        </div>

        {courses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '2.5rem' }}>
            No quizzes available yet. Complete a course to unlock quizzes.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', maxWidth: 900 }}>
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => selectCourse(course)}
                style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, transform 0.1s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = course.color || '#7F77DD'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: `${course.color || '#7F77DD'}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {course.icon || '📊'}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>{course.title}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, background: 'var(--bg)', borderRadius: 20, padding: '3px 10px', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                    {course.topic_count} topic{course.topic_count !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 11, background: 'var(--bg)', borderRadius: 20, padding: '3px 10px', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                    {course.question_count} questions
                  </span>
                </div>
                <div style={{ color: course.color || '#7F77DD', fontSize: 13, fontWeight: 600 }}>
                  Start Quiz →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Topic Selection ───────────────────────────────────────────────────────
  if (screen === SCREEN.TOPIC_SELECT) {
    return (
      <div className="page">
        <div className="page-header">
          <button
            onClick={resetToCourses}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 6 }}
          >
            ← Back to courses
          </button>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {selectedCourse.icon} {selectedCourse.title}
          </div>
          <div className="page-sub">Choose a topic and how many questions</div>
        </div>

        <div style={{ maxWidth: 560 }}>
          {/* Topic pills */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topic</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {/* Mix All option */}
              <button
                onClick={() => setSelectedTopic('All')}
                style={{
                  padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${selectedTopic === 'All' ? (selectedCourse.color || '#7F77DD') : 'var(--border)'}`,
                  background: selectedTopic === 'All' ? `${selectedCourse.color || '#7F77DD'}22` : 'var(--card)',
                  color: selectedTopic === 'All' ? (selectedCourse.color || '#7F77DD') : 'var(--text)',
                  transition: 'all 0.15s',
                }}
              >
                Mix All Topics
              </button>
              {topics.map(t => (
                <button
                  key={t.topic}
                  onClick={() => setSelectedTopic(t.topic)}
                  style={{
                    padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${selectedTopic === t.topic ? (selectedCourse.color || '#7F77DD') : 'var(--border)'}`,
                    background: selectedTopic === t.topic ? `${selectedCourse.color || '#7F77DD'}22` : 'var(--card)',
                    color: selectedTopic === t.topic ? (selectedCourse.color || '#7F77DD') : 'var(--text)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.topic}
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({t.question_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question count selector */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[5, 10, 15].map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  style={{
                    padding: '8px 22px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    border: `1.5px solid ${questionCount === n ? (selectedCourse.color || '#7F77DD') : 'var(--border)'}`,
                    background: questionCount === n ? `${selectedCourse.color || '#7F77DD'}22` : 'var(--card)',
                    color: questionCount === n ? (selectedCourse.color || '#7F77DD') : 'var(--text)',
                    transition: 'all 0.15s',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* XP preview */}
          <div style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '1.5rem', fontSize: 13, color: '#7ab8f0' }}>
            Earn up to <strong>+{questionCount * 30} XP</strong> ({questionCount} questions × 30 XP each)
          </div>

          <button
            className="btn-primary"
            onClick={startQuiz}
            disabled={!selectedTopic}
            style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700 }}
          >
            {selectedTopic ? `Start Quiz →` : 'Select a topic to continue'}
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz Screen ───────────────────────────────────────────────────────────
  if (screen === SCREEN.QUIZ) {
    const q = questions[current];
    const selectedIdx = answers[q?.id];
    const progPct = Math.round((current / questions.length) * 100);
    const isLastQuestion = current + 1 === questions.length;

    return (
      <div className="page">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 18 }}>
                {selectedCourse.icon} {selectedCourse.title}
              </div>
              <div className="page-sub">
                {selectedTopic !== 'All' ? selectedTopic + ' · ' : ''}Question {current + 1} of {questions.length}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: '#F5C542', fontWeight: 700 }}>+{xpTotal} XP</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>earned so far</div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 580 }}>
          {/* Progress bar */}
          <div style={{ background: 'var(--border)', borderRadius: 99, height: 6, marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{
              width: `${progPct}%`, height: '100%',
              background: selectedCourse.color || '#7F77DD',
              borderRadius: 99, transition: 'width 0.3s ease',
            }} />
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            {/* Question */}
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: '1.5rem', lineHeight: 1.5, color: 'var(--text)' }}>
              {q.question}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {q.options.map((opt, i) => {
                const isSelected = i === selectedIdx;
                const isCorrect = i === q.correct_index;
                let optStyle = {
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '14px 16px', borderRadius: 'var(--radius)',
                  cursor: revealed ? 'default' : 'pointer',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg)',
                  transition: 'all 0.2s',
                  textAlign: 'left', width: '100%', fontSize: 14,
                  color: 'var(--text)', fontWeight: 500,
                };

                if (revealed) {
                  if (isCorrect) {
                    optStyle = { ...optStyle, background: 'rgba(92,200,160,0.15)', border: '1.5px solid #5CC8A0', color: '#5CC8A0', fontWeight: 700 };
                  } else if (isSelected && !isCorrect) {
                    optStyle = { ...optStyle, background: 'rgba(239,68,68,0.15)', border: '1.5px solid #ef4444', color: '#ef4444' };
                  }
                } else if (!revealed) {
                  // hover handled via onMouseEnter
                }

                const icon = revealed
                  ? isCorrect ? '✓' : (isSelected ? '✗' : String.fromCharCode(64 + i + 1))
                  : String.fromCharCode(64 + i + 1);

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(q.id, i)}
                    style={optStyle}
                    onMouseEnter={e => { if (!revealed) { e.currentTarget.style.borderColor = selectedCourse.color || '#7F77DD'; e.currentTarget.style.background = `${selectedCourse.color || '#7F77DD'}11`; } }}
                    onMouseLeave={e => { if (!revealed) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; } }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: revealed ? 15 : 12, fontWeight: 700,
                      background: revealed
                        ? isCorrect ? '#5CC8A0' : (isSelected ? '#ef4444' : 'var(--border)')
                        : 'var(--border)',
                      color: revealed && (isCorrect || isSelected) ? '#fff' : 'var(--muted)',
                    }}>
                      {icon}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {revealed && q.explanation && (
              <div style={{
                marginTop: '1.25rem', padding: '14px 16px',
                background: 'rgba(92,200,160,0.08)', border: '1px solid rgba(92,200,160,0.25)',
                borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text)', lineHeight: 1.6,
              }}>
                <span style={{ fontWeight: 700, color: '#5CC8A0' }}>Explanation: </span>
                {q.explanation}
              </div>
            )}

            {/* Next button */}
            {revealed && (
              <div style={{ marginTop: '1.25rem' }}>
                <button
                  className="btn-primary"
                  onClick={goNext}
                  disabled={submitting}
                  style={{ width: '100%', padding: '13px', fontSize: 15, fontWeight: 700 }}
                >
                  {submitting ? 'Submitting...' : isLastQuestion ? 'See Results →' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Results Screen ────────────────────────────────────────────────────────
  if (screen === SCREEN.RESULTS && results) {
    const pct = Math.round((results.score / results.total) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
    const message = pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort!' : 'Keep practicing!';

    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">Quiz Complete</div>
          <div className="page-sub">{selectedCourse.icon} {selectedCourse.title}{selectedTopic !== 'All' ? ` · ${selectedTopic}` : ''}</div>
        </div>

        <div style={{ maxWidth: 500 }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: 56, marginBottom: '1rem' }}>{emoji}</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: pct >= 60 ? '#5CC8A0' : '#ef4444', marginBottom: '0.3rem' }}>
              {results.score} / {results.total}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>{pct}% — {message}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem' }}>
              {results.total - results.score} wrong · {results.score} correct
            </div>

            {/* XP banner */}
            <div style={{
              background: 'rgba(245,197,66,0.12)', border: '1px solid rgba(245,197,66,0.3)',
              borderRadius: 'var(--radius)', padding: '14px', marginBottom: '1.5rem',
              color: '#F5C542', fontWeight: 700, fontSize: 15,
            }}>
              +{results.xp_earned} XP earned!
            </div>

            {/* Score bar */}
            <div style={{ background: 'var(--border)', borderRadius: 99, height: 10, marginBottom: '2rem', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: pct >= 60 ? '#5CC8A0' : '#ef4444',
                borderRadius: 99, transition: 'width 0.5s ease',
              }} />
            </div>

            {/* Per-question summary */}
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              {questions.map((q, i) => {
                const userAns = answers[q.id];
                const correct = userAns === q.correct_index;
                return (
                  <div key={q.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: correct ? '#5CC8A0' : '#ef4444', fontWeight: 700, flexShrink: 0, fontSize: 15 }}>
                      {correct ? '✓' : '✗'}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{i + 1}. {q.question}</div>
                      {!correct && (
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          Correct: <span style={{ color: '#5CC8A0', fontWeight: 600 }}>{q.options[q.correct_index]}</span>
                          {userAns !== undefined && (
                            <> · You picked: <span style={{ color: '#ef4444' }}>{q.options[userAns]}</span></>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={resetToTopics} style={{ flex: 1, minWidth: 140 }}>
                Try Again
              </button>
              <button className="btn-secondary" onClick={resetToCourses} style={{ flex: 1, minWidth: 140 }}>
                Choose Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
