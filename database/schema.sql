-- Voice-to-CRM MVP Database Schema

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255),
    company VARCHAR(255),
    role VARCHAR(255),
    industry VARCHAR(255),
    company_size VARCHAR(100),
    intent VARCHAR(10) CHECK (intent IN ('Hot', 'Warm', 'Cold')),
    product_interest TEXT,
    notes TEXT,
    follow_up_message TEXT,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    source VARCHAR(20) CHECK (source IN ('scan', 'voice', 'both')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    audio_url VARCHAR(500),
    transcript TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrichments table
CREATE TABLE enrichments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    raw_payload JSONB,
    status VARCHAR(20) CHECK (status IN ('success', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_enrichments_lead_id ON enrichments(lead_id);