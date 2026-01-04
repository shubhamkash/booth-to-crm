const pool = require('./database');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo mode
let demoLeads = new Map();
let dbConnected = true;

// Test database connection
pool.connect((err) => {
  if (err) {
    console.warn('Database not available, using demo mode');
    dbConnected = false;
  }
});

class Lead {
  static async create(leadData) {
    if (!dbConnected) {
      // Demo mode - use in-memory storage
      const lead = {
        id: uuidv4(),
        ...leadData,
        created_at: new Date().toISOString()
      };
      demoLeads.set(lead.id, lead);
      return lead;
    }

    const {
      name, email, company, role, industry, company_size,
      intent, product_interest, notes, follow_up_message,
      confidence_score, source
    } = leadData;

    const query = `
      INSERT INTO leads (
        name, email, company, role, industry, company_size,
        intent, product_interest, notes, follow_up_message,
        confidence_score, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      name, email, company, role, industry, company_size,
      intent, product_interest, notes, follow_up_message,
      confidence_score, source
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    if (!dbConnected) {
      return demoLeads.get(id) || null;
    }

    const query = 'SELECT * FROM leads WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, leadData) {
    if (!dbConnected) {
      const existing = demoLeads.get(id);
      if (!existing) return null;
      
      const updated = { ...existing, ...leadData };
      demoLeads.set(id, updated);
      return updated;
    }

    const fields = Object.keys(leadData).map((key, index) => `${key} = $${index + 2}`);
    const query = `UPDATE leads SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    const values = [id, ...Object.values(leadData)];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    if (!dbConnected) {
      return Array.from(demoLeads.values()).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    }

    const query = 'SELECT * FROM leads ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Lead;