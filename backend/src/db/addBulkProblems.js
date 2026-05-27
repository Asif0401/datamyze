require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { createClient } = require('@libsql/client');
const { v4: uuidv4 } = require('uuid');
const SQL_PROBLEMS = require('./sqlProblems');
const PYTHON_PROBLEMS = require('./pythonProblems');

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const ALL = [...SQL_PROBLEMS, ...PYTHON_PROBLEMS];
  let inserted = 0;
  let skipped = 0;

  for (const p of ALL) {
    try {
      const result = await db.execute({
        sql: `INSERT OR IGNORE INTO problems
              (id, title, description, difficulty, topic, starter_code, acceptance_rate, xp_reward)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [uuidv4(), p.title, p.description, p.difficulty, p.topic, p.starter_code, p.acceptance_rate, p.xp_reward],
      });
      if (result.rowsAffected > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch (e) {
      console.error('Error on:', p.title, '-', e.message);
      skipped++;
    }
  }

  // Final counts
  const countResult = await db.execute('SELECT topic, COUNT(*) as cnt FROM problems GROUP BY topic');
  console.log('\n📊 Problems by topic after insertion:');
  for (const row of countResult.rows) {
    console.log(`  ${row.topic}: ${row.cnt}`);
  }

  console.log(`\n✅ Done — inserted ${inserted}, skipped ${skipped} (of ${ALL.length} total)`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
