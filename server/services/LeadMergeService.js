const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const Enrichment = require('../models/Enrichment');

class LeadMergeService {
  static async mergeLead(leadId, scanData, voiceData, enrichmentData) {
    try {
      const existingLead = await Lead.findById(leadId);
      
      // Merge logic: Scan = identity, Voice = intent, Enrichment = background, User = final authority
      const mergedData = {
        // Identity from scan (highest priority)
        name: scanData?.name || existingLead?.name,
        email: scanData?.email || existingLead?.email,
        company: scanData?.company || existingLead?.company,
        role: scanData?.role || existingLead?.role,
        
        // Intent from voice analysis
        intent: voiceData?.intent || existingLead?.intent,
        product_interest: voiceData?.product_interest || existingLead?.product_interest,
        notes: voiceData?.notes || existingLead?.notes,
        follow_up_message: voiceData?.follow_up_message || existingLead?.follow_up_message,
        confidence_score: voiceData?.confidence_score || existingLead?.confidence_score,
        
        // Background from enrichment
        industry: enrichmentData?.industry || existingLead?.industry,
        company_size: enrichmentData?.company_size || existingLead?.company_size,
        
        // Source tracking
        source: this.determineSource(scanData, voiceData)
      };

      // Remove undefined values
      Object.keys(mergedData).forEach(key => {
        if (mergedData[key] === undefined) {
          delete mergedData[key];
        }
      });

      const updatedLead = await Lead.update(leadId, mergedData);
      return updatedLead;
    } catch (error) {
      console.error('Lead merge failed:', error.message);
      throw error;
    }
  }

  static determineSource(scanData, voiceData) {
    const hasScan = scanData && (scanData.name || scanData.email);
    const hasVoice = voiceData && voiceData.transcript;
    
    if (hasScan && hasVoice) return 'both';
    if (hasScan) return 'scan';
    if (hasVoice) return 'voice';
    return 'scan'; // default
  }

  static async getLeadWithRelations(leadId) {
    try {
      const lead = await Lead.findById(leadId);
      const conversations = await Conversation.findByLeadId(leadId);
      const enrichments = await Enrichment.findByLeadId(leadId);
      
      return {
        ...lead,
        conversations,
        enrichments
      };
    } catch (error) {
      console.error('Failed to get lead with relations:', error.message);
      throw error;
    }
  }
}

module.exports = LeadMergeService;