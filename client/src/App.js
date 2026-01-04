import React, { useState } from 'react';
import Scanner from './components/Scanner';
import VoiceRecorder from './components/VoiceRecorder';
import LeadReview from './components/LeadReview';
import LeadsList from './components/LeadsList';
import { leadAPI, conversationAPI } from './services/api';

const App = () => {
  const [currentStep, setCurrentStep] = useState('scan'); // 'scan', 'record', 'processing', 'review', 'leads'
  const [leadId, setLeadId] = useState(null);
  const [leadData, setLeadData] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleScanResult = async (scanData) => {
    try {
      setProcessing(true);
      setError('');
      setShowScanner(false);

      // Store card image if available
      let cardImageUrl = null;
      if (scanData.imageFile) {
        cardImageUrl = URL.createObjectURL(scanData.imageFile);
      }

      // Create draft lead immediately
      const response = await leadAPI.create({
        name: scanData.name,
        email: scanData.email,
        company: scanData.company,
        role: scanData.role,
        card_image: cardImageUrl
      });

      const leadWithImage = {
        ...response.data.data,
        card_image: cardImageUrl
      };

      setLeadId(leadWithImage.id);
      setLeadData(leadWithImage);
      setCurrentStep('record');
    } catch (err) {
      setError('Failed to create lead from scan');
    } finally {
      setProcessing(false);
    }
  };

  const handleRecordingComplete = async (audioBlob, transcript) => {
    if (!leadId) return;

    try {
      setProcessing(true);
      setCurrentStep('processing');

      // Convert blob to file
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      // Send to backend for processing with transcript
      console.log('=== SENDING TO BACKEND ===');
      console.log('Transcript being sent:', transcript);
      console.log('Transcript length:', transcript?.length);
      console.log('========================');
      const response = await conversationAPI.create(leadId, audioFile, transcript);
      
      // Include transcript in lead data
      const updatedLeadData = {
        ...response.data.data.lead,
        transcript: transcript || response.data.data.conversation.transcript,
        card_image: leadData.card_image // Preserve card image
      };
      
      setLeadData(updatedLeadData);
      setCurrentStep('review');
    } catch (err) {
      setError('Failed to process voice recording');
      setCurrentStep('record');
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipRecording = () => {
    setCurrentStep('review');
  };

  const handleSkipScan = async () => {
    try {
      setProcessing(true);
      setError('');

      // Create empty lead for manual entry
      const response = await leadAPI.create({
        name: '',
        email: '',
        company: '',
        role: ''
      });

      setLeadId(response.data.data.id);
      setLeadData(response.data.data);
      setCurrentStep('record');
    } catch (err) {
      setError('Failed to create lead');
    } finally {
      setProcessing(false);
    }
  };

  const handleLeadSave = (savedLead) => {
    setLeadData(savedLead);
    
    // Save to localStorage for demo mode
    const existingLeads = JSON.parse(localStorage.getItem('demoLeads') || '[]');
    const leadIndex = existingLeads.findIndex(l => l.id === savedLead.id);
    
    if (leadIndex >= 0) {
      existingLeads[leadIndex] = savedLead;
    } else {
      existingLeads.push(savedLead);
    }
    
    localStorage.setItem('demoLeads', JSON.stringify(existingLeads));
    
    // Navigate to leads list
    setCurrentStep('leads');
  };

  const handleReset = () => {
    setCurrentStep('scan');
    setLeadId(null);
    setLeadData({});
    setError('');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'scan':
        return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm px-4 py-6">
              <h1 className="text-2xl font-bold text-center text-gray-900">
                Voice CRM
              </h1>
              <p className="text-center text-gray-600 mt-2">
                Capture leads instantly
              </p>
            </div>

            {/* Main Actions */}
            <div className="flex-1 flex flex-col justify-center p-6 space-y-6">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📱</span>
                </div>
                <h2 className="text-xl font-medium mb-2">Start with a scan</h2>
                <p className="text-gray-600">
                  Scan a QR code or business card to create a new lead
                </p>
              </div>

              <button
                onClick={() => setShowScanner(true)}
                className="btn-primary"
                disabled={processing}
              >
                {processing ? 'Creating Lead...' : 'Scan Badge or Card'}
              </button>

              <button
                onClick={handleSkipScan}
                className="btn-secondary"
              >
                Skip Scan (Manual Entry)
              </button>

              <button
                onClick={() => setCurrentStep('leads')}
                className="btn-outline"
              >
                View Captured Leads
              </button>
            </div>

            {error && (
              <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'record':
        return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
              <button onClick={handleReset} className="text-primary-600">← Back</button>
              <h1 className="text-lg font-medium">Add Voice Note</h1>
              <div></div>
            </div>

            {/* Lead Preview */}
            {leadData.name && (
              <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {leadData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{leadData.name}</p>
                    <p className="text-sm text-gray-600">{leadData.company}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Recorder */}
            <div className="flex-1 flex items-center justify-center p-6">
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                disabled={processing}
              />
            </div>

            {/* Actions */}
            <div className="p-4 space-y-3">
              <button
                onClick={handleSkipRecording}
                className="btn-secondary w-full"
                disabled={processing}
              >
                Skip Voice Note
              </button>
            </div>

            {error && (
              <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'processing':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
              <h2 className="text-xl font-medium mb-2">Processing Lead</h2>
              <div className="space-y-2 text-gray-600">
                <p>🎤 Transcribing audio...</p>
                <p>🤖 Extracting insights...</p>
                <p>🔍 Enriching company data...</p>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <LeadReview
            leadId={leadId}
            leadData={leadData}
            onSave={handleLeadSave}
            onBack={() => setCurrentStep('record')}
          />
        );

      case 'leads':
        return (
          <LeadsList
            onSelectLead={(lead) => {
              setLeadId(lead.id);
              setLeadData(lead);
              setCurrentStep('review');
            }}
            onBack={() => setCurrentStep('scan')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="App">
      {renderCurrentStep()}
      
      {/* Scanner Modal */}
      {showScanner && (
        <Scanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default App;