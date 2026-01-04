const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIContextService {
  static async extractContext(transcript, scanData = {}) {
    console.log('=== AI Context Extraction ===');
    console.log('Transcript received:', transcript);
    console.log('API Key available:', !!process.env.GEMINI_API_KEY);
    
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('No Gemini API key, using intelligent fallback');
        return this.intelligentFallback(transcript);
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analyze this conversation transcript and extract lead intelligence. Be specific and accurate based on what was actually said.

Conversation transcript: "${transcript}"
Scanned contact info: ${JSON.stringify(scanData)}

Extract the following information and return ONLY a valid JSON object:
{
  "intent": "Hot|Warm|Cold",
  "product_interest": "specific product/service mentioned or inferred",
  "notes": "key conversation points, company size, timeline, budget status, decision makers",
  "follow_up_message": "personalized follow-up email based on the conversation",
  "confidence_score": 1-100
}

Rules:
- Hot: Ready to buy, budget confirmed, timeline set, decision maker present
- Warm: Interested, exploring options, some qualification
- Cold: Just browsing, no immediate need, early stage
- Be specific in notes - extract actual details mentioned
- Only include information that was actually discussed
- If transcript is empty or unclear, set confidence_score to 20-40
- Make follow_up_message personal and relevant to what was discussed

Return only the JSON object, no other text.`;

      console.log('Sending to Gemini...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let content = response.text().trim();
      
      console.log('Raw Gemini response:', content);
      
      // Clean up response - remove markdown formatting if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(content);
      console.log('Parsed Gemini response:', parsed);
      
      return parsed;
    } catch (error) {
      console.error('AI extraction failed:', error.message);
      console.error('Full error:', error);
      return this.intelligentFallback(transcript);
    }
  }

  // Intelligent fallback based on transcript content
  static intelligentFallback(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    
    // Analyze transcript for keywords
    let intent = "Cold";
    let confidence = 30;
    
    if (lowerTranscript.includes('budget') || lowerTranscript.includes('buy') || lowerTranscript.includes('purchase')) {
      intent = "Hot";
      confidence = 70;
    } else if (lowerTranscript.includes('interested') || lowerTranscript.includes('demo') || lowerTranscript.includes('more info')) {
      intent = "Warm";
      confidence = 50;
    }
    
    return {
      intent,
      product_interest: this.extractProductInterest(transcript),
      notes: transcript.length > 10 ? transcript.substring(0, 100) + '...' : 'Brief conversation recorded',
      follow_up_message: `Thank you for the conversation. Based on our discussion, I'll follow up with more information.`,
      confidence_score: confidence
    };
  }
  
  static extractProductInterest(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes('crm')) return 'CRM solution';
    if (lowerTranscript.includes('software')) return 'Software solution';
    if (lowerTranscript.includes('service')) return 'Service offering';
    return 'General inquiry';
  }

  // Fallback mock for development
  static mockExtraction() {
    return {
      intent: "Hot",
      product_interest: "Enterprise CRM solution",
      notes: "500+ employees, Q1 implementation timeline, budget approved, decision maker present",
      follow_up_message: "Hi [Name], Great meeting you at the trade show! Based on our conversation about your Q1 CRM implementation for your 500+ person team, I'd love to schedule a demo of our enterprise solution. When would be a good time this week?",
      confidence_score: 85
    };
  }
}

module.exports = AIContextService;