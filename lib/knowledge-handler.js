import { neon } from '@neondatabase/serverless';

// Only generic training content. Never add client answers, auth tables or programs here.
// The endpoint has no write operation; the public demo cannot change the database.
export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.DATABASE_URL) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Vidensbanken er ikke tilgængelig lige nu.' });
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT 'exercises' AS kind, id, data FROM training_knowledge.exercises
      UNION ALL SELECT 'sources' AS kind, id, data FROM training_knowledge.sources
      UNION ALL SELECT 'questions' AS kind, id, data FROM training_knowledge.questions
      UNION ALL SELECT 'rules' AS kind, id, data FROM training_knowledge.rules
      ORDER BY kind, id
    `;
    const content = { exercises: [], sources: [], questions: [], rules: [] };
    for (const row of rows) {
      if (Object.hasOwn(content, row.kind)) content[row.kind].push(row.data);
    }
    if (Object.values(content).some(list => list.length === 0)) {
      throw new Error('KNOWLEDGE_INCOMPLETE');
    }
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    return res.status(200).json({ ...content, storage: 'neon', version: '0.2' });
  } catch {
    // Do not leak SQL, connection strings, database credentials or provider errors.
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Vidensbanken kunne ikke hentes. Prøv igen om lidt.' });
  }
}
