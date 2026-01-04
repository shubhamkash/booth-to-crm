const Lead = require('../models/Lead');
const LeadMergeService = require('../services/LeadMergeService');

class LeadsController {
  // POST /leads - Create new lead from scan
  static async create(req, res) {
    try {
      const { name, email, company, role } = req.body;
      
      const leadData = {
        name,
        email,
        company,
        role,
        source: 'scan',
        confidence_score: 50 // Initial confidence
      };

      const lead = await Lead.create(leadData);
      
      res.status(201).json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Create lead error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to create lead'
      });
    }
  }

  // GET /leads/:id - Get lead by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const lead = await LeadMergeService.getLeadWithRelations(id);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Get lead error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get lead'
      });
    }
  }

  // PUT /leads/:id - Update lead
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const lead = await Lead.update(id, updateData);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Update lead error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update lead'
      });
    }
  }

  // GET /leads/:id/export - Export lead as CSV/JSON
  static async export(req, res) {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;
      
      const lead = await LeadMergeService.getLeadWithRelations(id);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      if (format === 'csv') {
        const csv = this.convertToCSV(lead);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=lead-${id}.csv`);
        res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=lead-${id}.json`);
        res.json(lead);
      }
    } catch (error) {
      console.error('Export lead error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to export lead'
      });
    }
  }

  static convertToCSV(lead) {
    const headers = ['Name', 'Email', 'Company', 'Role', 'Industry', 'Company Size', 'Intent', 'Product Interest', 'Notes', 'Confidence Score'];
    const values = [
      lead.name || '',
      lead.email || '',
      lead.company || '',
      lead.role || '',
      lead.industry || '',
      lead.company_size || '',
      lead.intent || '',
      lead.product_interest || '',
      lead.notes || '',
      lead.confidence_score || ''
    ];
    
    return [headers.join(','), values.map(v => `"${v}"`).join(',')].join('\n');
  }
}

module.exports = LeadsController;