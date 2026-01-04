const Enrichment = require('../models/Enrichment');
const EnrichmentService = require('../services/EnrichmentService');
const LeadMergeService = require('../services/LeadMergeService');

class EnrichmentController {
  // POST /enrich - Manual enrichment trigger
  static async enrich(req, res) {
    try {
      console.log('=== Enrichment Request ===');
      const { lead_id, email, company } = req.body;
      console.log('Lead ID:', lead_id, 'Email:', email, 'Company:', company);
      
      if (!lead_id) {
        return res.status(400).json({
          success: false,
          error: 'Lead ID required'
        });
      }

      // Perform enrichment using Apollo API
      const enrichmentResult = await EnrichmentService.enrichLead(email, company);
      console.log('Enrichment result:', enrichmentResult);
      
      if (enrichmentResult.success) {
        res.json({
          success: true,
          data: enrichmentResult.data
        });
      } else {
        res.json({
          success: false,
          error: enrichmentResult.error || 'No data found'
        });
      }
    } catch (error) {
      console.error('Enrichment error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to enrich lead'
      });
    }
  }
}

module.exports = EnrichmentController;