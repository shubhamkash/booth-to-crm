import React, { useState, useEffect } from 'react';
import { leadAPI, enrichmentAPI } from '../services/api';
import Scanner from './Scanner';

const LeadReview = ({ leadId, leadData, onSave, onBack }) => {
  const [lead, setLead] = useState(leadData || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!leadData && leadId) {
      loadLead();
    }
  }, [leadId, leadData]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getById(leadId);
      setLead(response.data.data);
    } catch (err) {
      setError('Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // In demo mode, just call onSave directly
      onSave(lead);
    } catch (err) {
      setError('Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  const handleEnrich = async () => {
    try {
      setEnriching(true);
      setError('');
      console.log('Fetching data for:', lead.email, lead.company);
      const response = await enrichmentAPI.enrich(leadId, lead.email, lead.company);
      console.log('Enrichment response:', response.data);
      
      if (response.data.success) {
        const enrichedData = response.data.data;
        console.log('Enriched data:', enrichedData);
        setLead(prev => ({
          ...prev,
          name: enrichedData.name || prev.name,
          company: enrichedData.company || prev.company,
          industry: enrichedData.industry || prev.industry,
          company_size: enrichedData.company_size || prev.company_size,
          linkedin_url: enrichedData.linkedin_url,
          website: enrichedData.website,
          description: enrichedData.description
        }));
      } else {
        setError('No data found for this company');
      }
    } catch (err) {
      console.error('Enrichment error:', err);
      setError('Failed to fetch company data');
    } finally {
      setEnriching(false);
    }
  };

  const handleScanResult = (scanData) => {
    if (scanData.imageFile) {
      const cardImageUrl = URL.createObjectURL(scanData.imageFile);
      setLead(prev => ({
        ...prev,
        card_image: cardImageUrl,
        name: scanData.name || prev.name,
        email: scanData.email || prev.email,
        company: scanData.company || prev.company,
        role: scanData.role || prev.role
      }));
    }
    setShowScanner(false);
  };

  const handleExport = async (format) => {
    try {
      const response = await leadAPI.export(leadId, format);
      
      // Create download link
      const blob = new Blob([format === 'csv' ? response.data : JSON.stringify(response.data, null, 2)]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lead-${leadId}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export lead');
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Loading lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load lead</p>
          <button onClick={onBack} className="btn-secondary">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-primary-600 text-lg">← Back</button>
        <h1 className="text-lg font-medium">Review Lead</h1>
        <div></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Confidence Score */}
        {lead.confidence_score && (
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">AI Confidence</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(lead.confidence_score)}`}>
                {lead.confidence_score}%
              </span>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Contact Information</h2>
            {!lead.card_image && (
              <button
                onClick={() => setShowScanner(true)}
                className="btn btn-ghost text-sm"
              >
                📷 Add Card
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={lead.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="input-field"
                placeholder="Full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={lead.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="input-field"
                placeholder="email@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={lead.company || ''}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                className="input-field"
                placeholder="Company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={lead.role || ''}
                onChange={(e) => handleFieldChange('role', e.target.value)}
                className="input-field"
                placeholder="Job title"
              />
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Company Details</h2>
            <button
              onClick={handleEnrich}
              disabled={(!lead.email && !lead.company) || enriching}
              className="btn-secondary text-sm py-1 px-3"
            >
              {enriching ? 'Fetching...' : 'Fetch Data'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={lead.industry || ''}
                onChange={(e) => handleFieldChange('industry', e.target.value)}
                className="input-field"
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                value={lead.company_size || ''}
                onChange={(e) => handleFieldChange('company_size', e.target.value)}
                className="input-field"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            
            {lead.website && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                  {lead.website}
                </a>
              </div>
            )}
            
            {lead.linkedin_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                  {lead.linkedin_url}
                </a>
              </div>
            )}
            
            {lead.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                <p className="text-sm text-gray-600">{lead.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Intelligence */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Lead Intelligence</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intent Level</label>
              <select
                value={lead.intent || ''}
                onChange={(e) => handleFieldChange('intent', e.target.value)}
                className="input-field"
              >
                <option value="">Select intent</option>
                <option value="Hot">Hot - Ready to buy</option>
                <option value="Warm">Warm - Interested</option>
                <option value="Cold">Cold - Just browsing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Interest</label>
              <input
                type="text"
                value={lead.product_interest || ''}
                onChange={(e) => handleFieldChange('product_interest', e.target.value)}
                className="input-field"
                placeholder="Specific product or service"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={lead.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="input-field h-24 resize-none"
                placeholder="Key conversation points..."
              />
            </div>
          </div>
        </div>

        {/* Follow-up Message */}
        {lead.follow_up_message && (
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">AI-Generated Follow-up</h2>
            <textarea
              value={lead.follow_up_message}
              onChange={(e) => handleFieldChange('follow_up_message', e.target.value)}
              className="input-field h-32 resize-none"
              placeholder="Follow-up email draft..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Edit this AI-generated message before sending
            </p>
          </div>
        )}

        {/* Business Card Image */}
        {lead.card_image && (
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Business Card</h2>
            <img 
              src={lead.card_image} 
              alt="Business Card" 
              className="w-full max-w-sm mx-auto rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Transcript */}
        {lead.transcript && (
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Conversation Transcript</h2>
            <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
              {lead.transcript}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save Lead'}
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleExport('json')}
              className="btn-secondary flex-1"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="btn-secondary flex-1"
            >
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
      
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

export default LeadReview;