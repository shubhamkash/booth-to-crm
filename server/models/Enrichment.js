const pool = require('./database');

class Enrichment {
  static async create(enrichmentData) {
    const { lead_id, provider, raw_payload, status } = enrichmentData;
    
    const query = `
      INSERT INTO enrichments (lead_id, provider, raw_payload, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [lead_id, provider, raw_payload, status]);
    return result.rows[0];
  }

  static async findByLeadId(leadId) {
    const query = 'SELECT * FROM enrichments WHERE lead_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [leadId]);
    return result.rows;
  }
}

module.exports = Enrichment;