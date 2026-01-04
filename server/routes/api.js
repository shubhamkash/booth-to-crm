const express = require('express');
const LeadsController = require('../controllers/LeadsController');
const ConversationsController = require('../controllers/ConversationsController');
const EnrichmentController = require('../controllers/EnrichmentController');
const upload = require('../middleware/upload');

const router = express.Router();

// Lead routes
router.post('/leads', LeadsController.create);
router.get('/leads/:id', LeadsController.getById);
router.put('/leads/:id', LeadsController.update);
router.get('/leads/:id/export', LeadsController.export);

// Conversation routes
router.post('/conversations', upload.single('audio'), ConversationsController.create);

// Enrichment routes
router.post('/enrich', EnrichmentController.enrich);

module.exports = router;