import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import api from '../hooks/useApi';

/* ── Difficulty badge ───────────────────────────────── */
function DiffBadge({ d }) {
  const map = {
    Easy:   { bg: 'rgba(92,200,160,0.15)',  color: '#5CC8A0', border: 'rgba(92,200,160,0.3)'  },
    Medium: { bg: 'rgba(232,168,56,0.15)',  color: '#E8A838', border: 'rgba(232,168,56,0.3)'  },
    Hard:   { bg: 'rgba(240,123,106,0.15)', color: '#F07B6A', border: 'rgba(240,123,106,0.3)' },
  };
  const s = map[d] || map.Easy;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{d}</span>
  );
}

/* ── Results table ──────────────────────────────────── */
function ResultTable({ columns, rows }) {
  if (!columns?.length) return null;
  return (
    <div style={{ overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 400 }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{ padding: '7px 14px', textAlign: 'left', background: 'rgba(74,144,217,0.15)', color: '#4A90D9', fontWeight: 700, borderBottom: '1px solid rgba(74,144,217,0.25)', whiteSpace: 'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '6px 14px', color: '#e2e8f0', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap' }}>
                  {cell === null ? <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && (
        <div style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
          Showing 50 of {rows.length} rows
        </div>
      )}
    </div>
  );
}

/* ── Full-screen Problem IDE ────────────────────────── */
function ProblemIDE({ problem, onClose, onSolved }) {
  const lang = problem.topic === 'Python' ? 'python' : 'sql';
  const emptyCode = lang === 'sql' ? '-- Write your SQL query here\n' : '# Write your Python code here\n';
  const [code, setCode]           = useState(emptyCode);
  const [running, setRunning]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [bottomTab, setBottomTab] = useState('output');
  const [panelH, setPanelH]       = useState(220);
  const [hintUsed, setHintUsed]   = useState(false);
  const [hintData, setHintData]   = useState(null);
  const [showHint, setShowHint]   = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const dragRef = useRef(null);

  async function handleRun() {
    setRunning(true);
    setSubmitResult(null);
    setBottomTab('output');
    try {
      const { data } = await api.post(`/problems/${problem.id}/run`, { code });
      setRunResult(data);
    } catch {
      setRunResult({ success: false, error: 'Server error. Please try again.' });
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setBottomTab('output');
    try {
      const { data } = await api.post(`/problems/${problem.id}/submit`, { code, hint_used: hintUsed });
      setSubmitResult({ ...data, _title: problem.title });
      if (data.status === 'accepted') onSolved();
    } catch {
      setSubmitResult({ status: 'wrong_answer', message: '❌ Server error.', xp_earned: 0 });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHint() {
    if (hintData) { setShowHint(h => !h); return; }
    setLoadingHint(true);
    try {
      const { data } = await api.post(`/problems/${problem.id}/hint`);
      setHintData(data);
      setHintUsed(true);
      setShowHint(true);
    } catch {
      setHintData({ hint: '💡 Think about what columns and tables you need, then build the query step by step.', penalty: 0, xp_after_hint: problem.xp_reward });
      setHintUsed(true);
      setShowHint(true);
    } finally {
      setLoadingHint(false);
    }
  }

  // Drag to resize bottom panel
  function startDrag(e) {
    e.preventDefault();
    const startY = e.clientY;
    const startH = panelH;
    function onMove(ev) {
      const delta = startY - ev.clientY;
      setPanelH(Math.max(80, Math.min(500, startH + delta)));
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  const accepted = submitResult?.status === 'accepted';
  const isError  = runResult && !runResult.success;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(4,10,24,0.98)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 16px', height: 48, flexShrink: 0,
        background: 'rgba(20,27,56,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}>
        <button onClick={onClose} style={{ background: 'rgba(20,27,56,0.75)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.10)' }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: '#fff', flex: 1 }}>{problem.title}</span>
        <DiffBadge d={problem.difficulty} />
        <span style={{ background: 'rgba(108,99,255,0.18)', color: '#a78bfa', border: '1px solid rgba(108,99,255,0.25)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{problem.topic}</span>
        {problem.solved && <span style={{ background: 'rgba(92,200,160,0.15)', color: '#5CC8A0', border: '1px solid rgba(92,200,160,0.25)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>✓ Solved</span>}
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>+{problem.xp_reward} XP</span>

        {/* Hint, Run & Submit */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 8, alignItems: 'center' }}>
          {/* Hint button */}
          <button onClick={handleHint} disabled={loadingHint} title={hintUsed ? 'Hint used: XP reduced by 50%' : 'Use hint (costs 50% XP)'} style={{
            background: hintUsed ? 'rgba(232,168,56,0.20)' : 'rgba(232,168,56,0.10)',
            border: `1px solid ${hintUsed ? 'rgba(232,168,56,0.50)' : 'rgba(232,168,56,0.25)'}`,
            color: '#E8A838', padding: '6px 14px', borderRadius: 8,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
          }}>
            💡 {loadingHint ? 'Loading…' : hintUsed ? 'Hint (−50% XP)' : 'Hint'}
          </button>
          <button onClick={handleRun} disabled={running || submitting} style={{
            background: running ? 'rgba(92,200,160,0.12)' : 'rgba(92,200,160,0.18)',
            border: '1px solid rgba(92,200,160,0.30)',
            color: '#5CC8A0', padding: '6px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
          }}>
            {running ? <><SpinIcon />Running…</> : <>▶ Run Code</>}
          </button>
          <button onClick={handleSubmit} disabled={running || submitting} style={{
            background: submitting ? 'rgba(74,144,217,0.18)' : 'linear-gradient(135deg, #4A90D9, #38bdf8)',
            border: 'none', color: '#fff', padding: '6px 18px', borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
            boxShadow: submitting ? 'none' : '0 4px 14px rgba(74,144,217,0.35)',
            opacity: submitting ? 0.7 : 1,
          }}>
            {submitting ? <><SpinIcon />Submitting…</> : <>✓ Submit</>}
          </button>
        </div>
      </div>

      {/* ── Main split area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left: Problem description ── */}
        <div style={{
          width: 380, flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.12)',
          overflowY: 'auto',
          padding: '1.4rem',
          background: 'rgba(20,27,56,0.88)',
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
            <DiffBadge d={problem.difficulty} />
            <span style={{ background: 'rgba(232,168,56,0.15)', color: '#E8A838', border: '1px solid rgba(232,168,56,0.25)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>+{problem.xp_reward} XP</span>
          </div>

          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: '1rem', lineHeight: 1.4 }}>{problem.title}</h2>

          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
            {problem.description}
          </div>

          {/* Schema + Sample Data toggle */}
          {problem.topic === 'SQL' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: '0.6rem' }}>
                <button onClick={() => setShowSchema(false)} style={{ flex:1, padding:'5px 0', borderRadius:8, border:`1px solid ${!showSchema?'rgba(74,144,217,0.45)':'rgba(255,255,255,0.10)'}`, background:!showSchema?'rgba(74,144,217,0.15)':'transparent', color:!showSchema?'#4A90D9':'rgba(255,255,255,0.40)', fontSize:11, fontWeight:700, cursor:'pointer' }}>📊 Sample Data</button>
                <button onClick={() => setShowSchema(true)}  style={{ flex:1, padding:'5px 0', borderRadius:8, border:`1px solid ${showSchema?'rgba(167,139,250,0.45)':'rgba(255,255,255,0.10)'}`, background:showSchema?'rgba(167,139,250,0.15)':'transparent', color:showSchema?'#a78bfa':'rgba(255,255,255,0.40)', fontSize:11, fontWeight:700, cursor:'pointer' }}>🗃️ Schema</button>
              </div>
              {!showSchema
                ? <SampleDataPreview topic={problem.topic} title={problem.title} />
                : <SchemaPanel />
              }
            </div>
          )}
          {problem.topic !== 'SQL' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '0.6rem' }}>📊 Sample Data</div>
              <SampleDataPreview topic={problem.topic} title={problem.title} />
            </div>
          )}
        </div>

        {/* ── Right: Editor + output ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Editor language bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px',
            background: 'rgba(20,27,56,0.88)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <div style={{
              background: lang === 'sql' ? 'rgba(74,144,217,0.18)' : 'rgba(92,200,160,0.15)',
              color: lang === 'sql' ? '#4A90D9' : '#5CC8A0',
              border: `1px solid ${lang === 'sql' ? 'rgba(74,144,217,0.30)' : 'rgba(92,200,160,0.30)'}`,
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
            }}>{lang.toUpperCase()}</div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
              {lang === 'sql' ? '⌃⏎ Run  ·  Ctrl+Space Autocomplete' : '⌃⏎ Run'}
            </span>
          </div>

          {/* Hint panel */}
          {showHint && hintData && (
            <div style={{
              background: 'rgba(232,168,56,0.08)', borderBottom: '1px solid rgba(232,168,56,0.25)',
              padding: '10px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, flexShrink: 0,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1.4 }}>💡</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#E8A838', marginBottom: 3 }}>
                  Hint used: XP reduced to {hintData.xp_after_hint} XP (was {problem.xp_reward} XP)
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>{hintData.hint}</div>
              </div>
              <button onClick={() => setShowHint(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>✕</button>
            </div>
          )}

          {/* Monaco Editor */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <Editor
              height="100%"
              language={lang}
              theme="vs-dark"
              value={code}
              onChange={v => setCode(v || '')}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                autoIndent: 'full',
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
              }}
            />
          </div>

          {/* ── Resize handle ── */}
          <div
            ref={dragRef}
            onMouseDown={startDrag}
            style={{
              height: 6, flexShrink: 0, cursor: 'row-resize',
              background: 'rgba(20,27,56,0.88)',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: 40, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* ── Bottom panel ── */}
          <div style={{ height: panelH, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.35)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Panel tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, height: 36 }}>
              {['output', 'testcase'].map(t => (
                <button key={t} onClick={() => setBottomTab(t)} style={{
                  padding: '0 14px', height: '100%',
                  background: 'none', border: 'none',
                  borderBottom: bottomTab === t ? '2px solid #4A90D9' : '2px solid transparent',
                  color: bottomTab === t ? '#4A90D9' : 'rgba(255,255,255,0.35)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                }}>
                  {t === 'output' ? '📤 Output' : '🧪 Test Cases'}
                </button>
              ))}

              {/* Status pill */}
              {submitResult && (
                <span style={{
                  marginLeft: 'auto', fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                  background: accepted ? 'rgba(92,200,160,0.18)' : 'rgba(240,123,106,0.18)',
                  color: accepted ? '#5CC8A0' : '#F07B6A',
                  border: `1px solid ${accepted ? 'rgba(92,200,160,0.30)' : 'rgba(240,123,106,0.30)'}`,
                }}>
                  {accepted ? `✅ Accepted +${submitResult.xp_earned} XP` : '❌ Wrong Answer'}
                </span>
              )}
            </div>

            {/* Panel content */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
              {bottomTab === 'output' && (
                <OutputPanel
                  runResult={runResult}
                  submitResult={submitResult}
                  running={running}
                  submitting={submitting}
                  lang={lang}
                />
              )}
              {bottomTab === 'testcase' && (
                <TestCasePanel title={problem.title} topic={problem.topic} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Output panel ───────────────────────────────────── */
/* ── Schema Panel ───────────────────────────────────── */
const SQL_SCHEMA = [
  { table: 'customers',   cols: 'id, name, email, city' },
  { table: 'orders',      cols: 'id, customer_id, amount, status, order_date' },
  { table: 'employees',   cols: 'id, name, department, salary, manager_id, hire_date' },
  { table: 'departments', cols: 'id, name, manager_id' },
  { table: 'products',    cols: 'id, name, category, price, stock' },
  { table: 'order_items', cols: 'id, order_id, product_id, quantity, unit_price' },
  { table: 'transactions',cols: 'id, user_id, amount, type, status, created_at' },
  { table: 'sessions',    cols: 'id, user_id, page, duration_sec, created_at' },
  { table: 'reviews',     cols: 'id, product_id, user_id, rating, comment' },
  { table: 'campaigns',   cols: 'id, name, channel, spend, conversions, revenue' },
  { table: 'inventory',   cols: 'id, product_id, warehouse, quantity, last_updated' },
  { table: 'sales',       cols: 'date, revenue' },
  { table: 'user_activity',cols:'user_id, activity_date' },
];
function SchemaPanel() {
  return (
    <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {SQL_SCHEMA.map(s => (
        <div key={s.table} style={{ background: 'rgba(20,27,56,0.90)', border: '1px solid rgba(167,139,250,0.20)', borderRadius: 8, padding: '7px 10px' }}>
          <div style={{ fontWeight: 800, color: '#a78bfa', fontSize: 12, marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>
            📋 {s.table}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 }}>
            {s.cols}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Explanation Panel (shown after Accepted) ────────── */
const SQL_EXPLANATIONS = {
  join:       { title: 'JOIN Strategy', tip: 'Always identify the relationship between tables first (1-to-many, many-to-many), then choose the right JOIN type. INNER JOIN returns only matching rows. LEFT JOIN keeps all rows from the left table.' },
  window:     { title: 'Window Functions', tip: 'Window functions (RANK, ROW_NUMBER, LAG, LEAD, SUM OVER) operate on a "window" of rows without collapsing them like GROUP BY does. Use PARTITION BY to reset the window per group, and ORDER BY to define the sequence.' },
  group:      { title: 'GROUP BY + Aggregation', tip: 'GROUP BY collapses rows into groups. Every column in SELECT must either be in GROUP BY or wrapped in an aggregate (SUM, AVG, COUNT, MAX, MIN). Use HAVING to filter groups — not WHERE.' },
  cte:        { title: 'CTEs (WITH clause)', tip: 'CTEs (Common Table Expressions) make complex queries readable. Write WITH alias AS (subquery), then reference the alias. You can chain multiple CTEs — each can reference the ones above it.' },
  subquery:   { title: 'Subqueries', tip: 'Subqueries run first and feed their result to the outer query. Use them in WHERE (filter by subquery result), FROM (treat as a virtual table), or SELECT (correlated subquery per row).' },
  default:    { title: 'Query Approach', tip: 'Great job solving this! Review your query structure: start with SELECT what you need, FROM the right table(s), JOIN as required, filter with WHERE, group with GROUP BY, and filter groups with HAVING. Clean and readable queries get noticed in interviews.' },
};
function ExplanationPanel({ lang, problemTitle = '' }) {
  const [open, setOpen] = useState(false);
  const title = problemTitle.toLowerCase();
  if (lang !== 'sql') return (
    <div style={{ padding: '10px 14px', background: 'rgba(92,200,160,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
      🎉 Well done! Review your solution for edge cases and efficiency improvements.
    </div>
  );
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', background: 'none', border: 'none', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 700, textAlign: 'left' }}>
        <span style={{ fontSize: 14 }}>📖</span>
        See explanation & key concept
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.30)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (() => {
        const keys = Object.keys(SQL_EXPLANATIONS).filter(k => k !== 'default');
        const matched = keys.find(k => title.includes(k)) || 'default';
        const exp = SQL_EXPLANATIONS[matched];
        return (
          <div style={{ padding: '0 14px 12px', background: 'rgba(92,200,160,0.04)' }}>
            <div style={{ fontWeight: 800, color: '#5CC8A0', fontSize: 12, marginBottom: 6 }}>💡 {exp.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 1.75 }}>{exp.tip}</div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(92,200,160,0.06)', border: '1px solid rgba(92,200,160,0.18)', borderRadius: 8, fontSize: 11.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              <strong style={{ color: '#5CC8A0' }}>Pro tip:</strong> In real interviews, always explain your approach before writing code. Interviewers value clear thinking over a perfect query.
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function OutputPanel({ runResult, submitResult, running, submitting, lang }) {
  if (running || submitting) {
    return (
      <div style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
        <SpinIcon /> {running ? 'Executing query…' : 'Validating solution…'}
      </div>
    );
  }

  if (!runResult && !submitResult) {
    return (
      <div style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
        Click <strong style={{ color: '#5CC8A0' }}>▶ Run Code</strong> to execute against the sample database, or <strong style={{ color: '#4A90D9' }}>✓ Submit</strong> to validate and earn XP.
      </div>
    );
  }

  return (
    <div>
      {/* Submit feedback banner */}
      {submitResult && (
        <div>
          {/* Status row */}
          <div style={{
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            background: submitResult.status === 'accepted' ? 'rgba(92,200,160,0.10)' : 'rgba(240,123,106,0.10)',
            borderBottom: `1px solid ${submitResult.status === 'accepted' ? 'rgba(92,200,160,0.20)' : 'rgba(240,123,106,0.20)'}`,
            color: submitResult.status === 'accepted' ? '#5CC8A0' : '#F07B6A',
            fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ flex: 1 }}>{submitResult.message}</span>
            {submitResult.status === 'accepted' && submitResult.xp_earned > 0 &&
              <span style={{ background: 'rgba(232,168,56,0.18)', color: '#E8A838', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                +{submitResult.xp_earned} XP
              </span>
            }
          </div>

          {/* Explanation section (shown after accepted) */}
          {submitResult.status === 'accepted' && (
            <ExplanationPanel lang={lang} problemTitle={submitResult._title || ''} />
          )}

          {/* Guidance for wrong answer */}
          {submitResult.status !== 'accepted' && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>🔍</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.60)', marginBottom: 4 }}>Common fixes to try:</div>
                {lang === 'sql'
                  ? <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: 12, color: 'rgba(255,255,255,0.40)', lineHeight: 1.8 }}>
                      <li>Check your WHERE / JOIN conditions</li>
                      <li>Verify column names match the schema (use 🗃️ Schema tab)</li>
                      <li>Are you using GROUP BY when needed?</li>
                      <li>Click <strong style={{ color: '#E8A838' }}>💡 Hint</strong> for a guided nudge</li>
                    </ul>
                  : <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: 12, color: 'rgba(255,255,255,0.40)', lineHeight: 1.8 }}>
                      <li>Check the expected output format</li>
                      <li>Verify your variable names</li>
                      <li>Check for correct aggregation method</li>
                      <li>Click <strong style={{ color: '#E8A838' }}>💡 Hint</strong> for a guided nudge</li>
                    </ul>
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* Run result */}
      {runResult && (
        <div>
          {runResult.success === false ? (
            <div style={{ padding: '1rem 1.2rem' }}>
              <div style={{ color: '#F07B6A', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginBottom: '0.5rem' }}>
                ❌ {runResult.error}
              </div>
              {runResult.hint && (
                <div style={{ color: 'rgba(232,168,56,0.80)', fontSize: 12, marginTop: 6 }}>{runResult.hint}</div>
              )}
            </div>
          ) : lang === 'sql' && runResult.columns ? (
            <div>
              <div style={{ padding: '6px 14px', fontSize: 11, color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(92,200,160,0.06)' }}>
                ✅ {runResult.rowCount} row{runResult.rowCount !== 1 ? 's' : ''} returned
              </div>
              <ResultTable columns={runResult.columns} rows={runResult.rows} />
            </div>
          ) : (
            <pre style={{ padding: '1rem 1.2rem', margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#a6e3a1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {runResult.output || 'No output.'}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Test case panel ────────────────────────────────── */
function TestCasePanel({ title, topic }) {
  const lower = title.toLowerCase();

  const cases = topic === 'SQL' ? getSqlTestCases(lower) : getPythonTestCases(lower);

  return (
    <div style={{ padding: '1rem 1.2rem' }}>
      {cases.map((tc, i) => (
        <div key={i} style={{ marginBottom: '1rem', padding: '0.8rem 1rem', background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4A90D9', marginBottom: '0.4rem' }}>Test Case {i + 1}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: '0.3rem' }}>{tc.description}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.40)', background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '6px 10px', marginTop: '0.4rem' }}>
            Expected: {tc.expected}
          </div>
        </div>
      ))}
    </div>
  );
}

function getSqlTestCases(lower) {
  if (lower.includes('top 5')) return [
    { description: 'Query should return exactly 5 rows', expected: '5 rows' },
    { description: 'Results must be sorted by total revenue descending', expected: 'Arjun Mehta → highest revenue' },
    { description: 'Must include a total revenue / SUM column', expected: 'Column: total_revenue' },
  ];
  if (lower.includes('month-over-month') || lower.includes('growth')) return [
    { description: 'Must return one row per month', expected: '12 rows for 2023' },
    { description: 'Must include a growth % column', expected: 'growth_pct column' },
    { description: 'First month growth should be NULL (no previous month)', expected: 'NULL for Jan 2023' },
  ];
  if (lower.includes('duplicate')) return [
    { description: 'Should return only emails that appear more than once', expected: 'ravi@example.com (×2), priya@example.com (×2), arjun@example.com (×2)' },
    { description: 'Must use HAVING COUNT(*) > 1', expected: '3 duplicate email groups' },
  ];
  if (lower.includes('rolling')) return [
    { description: 'Must return all 30 days', expected: '30 rows' },
    { description: 'Rolling average column required', expected: 'rolling_7d column' },
    { description: 'First 6 days use fewer preceding rows (window starts)', expected: 'Day 1 avg = day 1 revenue' },
  ];
  return [
    { description: 'Query runs without error', expected: 'No SQL error' },
    { description: 'Returns at least 1 row', expected: '≥ 1 row returned' },
  ];
}

function getPythonTestCases(lower) {
  if (lower.includes('null')) return [
    { description: 'Null counts printed before cleaning', expected: 'df.isnull().sum()' },
    { description: 'Numeric nulls filled with median', expected: 'df[col].fillna(median)' },
    { description: 'Text nulls filled with "Unknown"', expected: 'fillna("Unknown")' },
  ];
  if (lower.includes('groupby')) return [
    { description: 'Group by product_category and region', expected: 'groupby([product_category, region])' },
    { description: 'Aggregate: total_sales, avg_order, order_count', expected: '.agg(sum, mean, count)' },
    { description: 'Sort by total_sales descending', expected: 'sort_values ascending=False' },
  ];
  return [
    { description: 'IQR calculated correctly', expected: 'Q3 - Q1' },
    { description: 'Bounds: Q1 - 1.5×IQR and Q3 + 1.5×IQR', expected: 'lower/upper bound' },
    { description: 'Return cleaned DataFrame', expected: 'filtered df' },
  ];
}

/* ── Sample data preview ────────────────────────────── */
function SampleDataPreview({ topic, title }) {
  const lower = title.toLowerCase();

  if (topic === 'Python') {
    return (
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.50)', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7 }}>
        <div style={{ color: '#4A90D9', marginBottom: 4 }}>df.head(3):</div>
        {lower.includes('null') ?
          'order_id  product    region  amount\n1         Electronics  North   1200.0\n2         NaN          South   NaN\n3         Clothing     NaN     890.0' :
          lower.includes('groupby') ?
          'order_id  product_category  region  amount\n1001      Electronics       North   1845\n1002      Clothing          South   920\n1003      Electronics       East    2100' :
          'id   revenue  date\n1    45200    2024-01-05\n2    152000   2024-01-08\n3    8900     2024-01-12'
        }
      </div>
    );
  }

  if (lower.includes('top 5') || lower.includes('customers')) return (
    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.50)', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7 }}>
      <div style={{ color: '#4A90D9', marginBottom: 4 }}>customers (10 rows):</div>
      id · name · email · city<br/>
      1 · Ravi Kumar · ravi@… · Mumbai<br/>
      2 · Priya Sharma · priya@… · Delhi<br/>
      <div style={{ color: '#4A90D9', margin: '6px 0 4px' }}>orders (25 rows):</div>
      id · customer_id · amount · status · order_date
    </div>
  );

  if (lower.includes('duplicate')) return (
    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.50)', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7 }}>
      <div style={{ color: '#4A90D9', marginBottom: 4 }}>users (10 rows, with dupes):</div>
      id · name · email<br/>
      1 · Ravi Kumar · ravi@example.com<br/>
      2 · Priya Sharma · priya@example.com<br/>
      3 · Ravi Kumar · ravi@example.com ← duplicate
    </div>
  );

  if (lower.includes('month') || lower.includes('growth')) return (
    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.50)', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7 }}>
      <div style={{ color: '#4A90D9', marginBottom: 4 }}>sales (12 monthly rows):</div>
      date · revenue<br/>
      2023-01-01 · 285000<br/>
      2023-02-01 · 312000<br/>
      2023-03-01 · 298000
    </div>
  );

  if (lower.includes('rolling') || lower.includes('7-day')) return (
    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.50)', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7 }}>
      <div style={{ color: '#4A90D9', marginBottom: 4 }}>daily_sales (30 rows):</div>
      date · revenue<br/>
      2024-01-01 · 9200<br/>
      2024-01-02 · 11400<br/>
      2024-01-03 · 8700
    </div>
  );

  return (
    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.50)', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7 }}>
      <div style={{ color: '#4A90D9', marginBottom: 4 }}>Available tables:</div>
      customers · orders · users<br/>sales · daily_sales · user_activity
    </div>
  );
}

/* ── Spin icon ──────────────────────────────────────── */
function SpinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="20 15" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   Problems list page
════════════════════════════════════════════════════ */
function MobileCodingPrompt() {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: '1.2rem', lineHeight: 1 }}>💻</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '0.6rem', lineHeight: 1.25 }}>
        Coding is better<br />on a laptop
      </h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 280, lineHeight: 1.6, marginBottom: '1.8rem' }}>
        The code editor works best on a larger screen. Open Datamyze on your laptop or desktop to practise SQL & Python problems.
      </p>
      <div style={{
        background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 14, padding: '1rem 1.2rem', maxWidth: 290,
        display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>💡</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          On Safari: tap <strong style={{ color: 'rgba(255,255,255,0.7)' }}>AA → Request Desktop Website</strong>
          <br />On Chrome: tap <strong style={{ color: 'rgba(255,255,255,0.7)' }}>⋮ → Desktop site</strong>
        </span>
      </div>
    </div>
  );
}

export default function Problems() {
  const [problems, setProblems]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [topicFilter, setTopicFilter] = useState('All');
  const [diffFilter, setDiffFilter]  = useState('All');
  const [selected, setSelected]      = useState(null);
  const [isMobile, setIsMobile]      = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  function load() {
    api.get('/problems').then(r => setProblems(r.data.problems)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  const filtered = problems.filter(p =>
    (topicFilter === 'All' || p.topic === topicFilter) &&
    (diffFilter  === 'All' || p.difficulty === diffFilter)
  );
  const solved = problems.filter(p => p.solved).length;

  if (loading) return <div className="loading"><div className="spinner" />Loading problems…</div>;
  if (isMobile) return <MobileCodingPrompt />;

  return (
    <>
      {selected && (
        <ProblemIDE
          problem={selected}
          onClose={() => setSelected(null)}
          onSolved={() => { load(); setSelected(p => ({ ...p, solved: true })); }}
        />
      )}

      <div className="page">
        <div className="page-header">
          <div className="page-title">💡 Practice Problems</div>
          <div className="page-sub">{solved}/{problems.length} solved · Build SQL &amp; Python skills</div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', 'SQL', 'Python'].map(t => (
            <button key={t}
              className={topicFilter === t ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setTopicFilter(t)}>{t}</button>
          ))}
          <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.10)', margin: '0 4px' }} />
          {['All', 'Easy', 'Medium', 'Hard'].map(d => (
            <button key={d}
              className={diffFilter === d ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setDiffFilter(d)}>{d}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {filtered.length} problems
          </span>
        </div>

        {/* Problem cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtered.map((p, i) => (
            <div key={p.id}
              onClick={() => setSelected(p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                background: 'rgba(20,27,56,0.88)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12, cursor: 'pointer',
                transition: 'all 0.18s',
                animation: `fadeInUp 0.35s ease ${i * 0.04}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(74,144,217,0.30)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Solved indicator */}
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: p.solved ? 'rgba(92,200,160,0.18)' : 'rgba(255,255,255,0.07)', border: `1px solid ${p.solved ? 'rgba(92,200,160,0.35)' : 'rgba(255,255,255,0.10)'}`, color: p.solved ? '#5CC8A0' : 'rgba(255,255,255,0.25)' }}>
                {p.solved ? '✓' : i + 1}
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: p.solved ? '#5CC8A0' : '#e2e8f0', marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)' }}>
                  {p.acceptance_rate}% acceptance
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ background: p.topic === 'SQL' ? 'rgba(74,144,217,0.15)' : 'rgba(92,200,160,0.15)', color: p.topic === 'SQL' ? '#4A90D9' : '#5CC8A0', border: `1px solid ${p.topic === 'SQL' ? 'rgba(74,144,217,0.25)' : 'rgba(92,200,160,0.25)'}`, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{p.topic}</span>
                <DiffBadge d={p.difficulty} />
                <span style={{ fontSize: 12, color: '#E8A838', fontWeight: 700, minWidth: 44, textAlign: 'right' }}>+{p.xp_reward}</span>
              </div>

              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.20)', marginLeft: 4 }}>→</span>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.30)' }}>
            No problems match the current filters.
          </div>
        )}
      </div>
    </>
  );
}
