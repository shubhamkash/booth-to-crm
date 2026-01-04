const Conversation = require('../models/Conversation');
const Enrichment = require('../models/Enrichment');
const TranscriptionService = require('../services/TranscriptionService');
const AIContextService = require('../services/AIContextService');

class ConversationsController {
  // POST /conversations - Process voice recording
  static async create(req, res) {
    try {
      console.log('Processing voice recording...');
      console.log('Request body keys:', Object.keys(req.body));
      console.log('lead_id:', req.body.lead_id);
      console.log('transcript value:', JSON.stringify(req.body.transcript));
      console.log('transcript length:', req.body.transcript?.length);
      console.log('File:', req.file?.filename);
      
      const { lead_id, transcript } = req.body;
      const audioFile = req.file;
      
      if (!audioFile) {
        console.log('No audio file received');
        return res.status(400).json({
          success: false,
          error: 'Audio file required'
        });
      }

      if (!lead_id) {
        console.log('No lead_id received');
        return res.status(400).json({
          success: false,
          error: 'Lead ID required'
        });
      }

      // Use real transcript if provided, otherwise use demo
      const finalTranscript = (transcript && transcript.trim() && transcript.length > 10) 
        ? transcript.trim() 
        : "Customer expressed strong interest in our enterprise CRM solution. They mentioned having 500+ employees and are looking to implement by Q1. Budget approved, decision maker identified.";
      
      console.log('=== TRANSCRIPT DECISION ===');
      console.log('Original transcript:', transcript);
      console.log('Transcript length:', transcript?.length);
      console.log('Using transcript:', finalTranscript.substring(0, 100) + '...');
      console.log('========================');
      
      // Use Gemini AI to extract context
      console.log('Calling Gemini AI for context extraction...');
      console.log('Transcript:', finalTranscript);
      const contextData = await AIContextService.extractContext(finalTranscript);
      console.log('Gemini response:', contextData);

      // Save conversation record
      const conversation = {
        id: require('uuid').v4(),
        lead_id,
        audio_url: audioFile.path,
        transcript: finalTranscript,
        created_at: new Date().toISOString()
      };

      // Update lead with AI-extracted context
      const Lead = require('../models/Lead');
      const updatedLead = await Lead.update(lead_id, contextData);
      console.log('Updated lead:', updatedLead);

      res.status(201).json({
        success: true,
        data: {
          conversation,
          lead: updatedLead,
          ai_analysis: contextData
        }
      });
    } catch (error) {
      console.error('Create conversation error:', error.message);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to process voice recording: ' + error.message
      });
    }
  }

  // Basic transcription method (placeholder)
  static async transcribeAudio(audioBlob) {
    // In a real implementation, you would:
    // 1. Send audio to Google Speech-to-Text API
    // 2. Or use OpenAI Whisper API
    // 3. Or use Web Speech API on frontend
    
    // For now, return demo text
    return "Customer expressed strong interest in our enterprise CRM solution. They mentioned having 500+ employees and are looking to implement by Q1. Budget approved, decision maker identified.";
  }
}

module.exports = ConversationsController;