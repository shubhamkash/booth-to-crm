const pool = require('./database');

class Conversation {
  static async create(conversationData) {
    const { lead_id, audio_url, transcript } = conversationData;
    
    const query = `
      INSERT INTO conversations (lead_id, audio_url, transcript)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [lead_id, audio_url, transcript]);
    return result.rows[0];
  }

  static async findByLeadId(leadId) {
    const query = 'SELECT * FROM conversations WHERE lead_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [leadId]);
    return result.rows;
  }
}

module.exports = Conversation;