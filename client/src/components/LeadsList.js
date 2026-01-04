import React, { useState, useEffect } from 'react';
import { leadAPI } from '../services/api';

const LeadsList = ({ onSelectLead, onBack }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      // Since we're in demo mode, get leads from localStorage or show empty
      const demoLeads = JSON.parse(localStorage.getItem('demoLeads') || '[]');
      setLeads(demoLeads);
    } catch (err) {
      console.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const getIntentColor = (intent) => {
    switch (intent) {
      case 'Hot': return 'bg-red-100 text-red-800';
      case 'Warm': return 'bg-yellow-100 text-yellow-800';
      case 'Cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-primary-600">← Back</button>
        <h1 className="text-lg font-medium">Leads ({leads.length})</h1>
        <div></div>
      </div>

      <div className="p-4">
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No leads captured yet</p>
            <button onClick={onBack} className="btn-primary mt-4">
              Capture First Lead
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {lead.name || 'Unnamed Lead'}
                    </h3>
                    <p className="text-sm text-gray-600">{lead.company}</p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {lead.intent && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(lead.intent)}`}>
                        {lead.intent}
                      </span>
                    )}
                    {lead.confidence_score && (
                      <span className="text-xs text-gray-500">
                        {lead.confidence_score}% confidence
                      </span>
                    )}
                  </div>
                </div>
                {lead.product_interest && (
                  <p className="text-sm text-gray-600 mt-2">
                    Interest: {lead.product_interest}
                  </p>
                )}
                {lead.transcript && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    "{lead.transcript.substring(0, 60)}..."
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsList;