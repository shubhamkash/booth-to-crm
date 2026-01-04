# Voice-to-CRM Event Intelligence MVP

Convert booth conversations into structured, enriched leads within 2 minutes.

## Architecture

```
Frontend (React + Tailwind)
├── Mobile-first scanner (QR + OCR)
├── Voice recording interface
└── Lead review & edit

Backend (Node.js + Express)
├── Lead management APIs
├── Audio transcription service
├── AI context extraction
└── Company enrichment

Database (PostgreSQL)
├── Leads, Conversations, Enrichments
└── Structured data model
```

## Setup

### 1. Database Setup
```bash
# Install PostgreSQL and create database
createdb voice_crm_mvp

# Run schema
psql voice_crm_mvp < database/schema.sql
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start server
npm run server
```

### 3. Frontend Setup
```bash
cd client
npm install
npm start
```

## API Examples

### Create Lead from Scan
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@company.com",
    "company": "Tech Corp",
    "role": "CTO"
  }'
```

### Process Voice Recording
```bash
curl -X POST http://localhost:3001/api/conversations \
  -F "lead_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "audio=@recording.webm"
```

### Update Lead
```bash
curl -X PUT http://localhost:3001/api/leads/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "Hot",
    "product_interest": "Enterprise CRM",
    "notes": "500+ employees, Q1 timeline"
  }'
```

### Export Lead
```bash
# JSON export
curl http://localhost:3001/api/leads/123e4567-e89b-12d3-a456-426614174000/export

# CSV export
curl http://localhost:3001/api/leads/123e4567-e89b-12d3-a456-426614174000/export?format=csv
```

## Data Flow

1. **Scan** → QR/OCR → Draft Lead Creation
2. **Voice** → Audio Upload → Transcription → AI Extraction
3. **Enrich** → Company Lookup → Data Merge
4. **Review** → User Edit → Final Save
5. **Export** → CSV/JSON Download

## Mobile Features

- **Camera Access**: QR scanning + business card OCR
- **Audio Recording**: Web Audio API with compression
- **Touch Optimized**: Large buttons, gesture-friendly
- **PWA Ready**: Installable, offline-capable
- **Responsive**: Works on all screen sizes

## AI Services

### Transcription
- Input: Audio file (webm/mp3/wav)
- Output: Raw transcript text
- Provider: OpenAI Whisper API

### Context Extraction
- Input: Transcript + scan data
- Output: Intent, product interest, notes, follow-up message
- Provider: OpenAI GPT-3.5

### Enrichment
- Input: Email domain or company name
- Output: Industry, company size, LinkedIn
- Provider: Clearbit API

## Error Handling

- **Scanner fails** → Manual entry fallback
- **Transcription fails** → Retry mechanism
- **AI extraction fails** → Manual edit mode
- **Enrichment fails** → Continue without enrichment

## Performance

- **<2s perceived response** for all operations
- **Async processing** for AI services
- **Progressive enhancement** for features
- **Graceful degradation** on failures

## Security

- **No persistent audio storage** (processed and deleted)
- **API key protection** via environment variables
- **Input validation** on all endpoints
- **CORS configuration** for frontend access