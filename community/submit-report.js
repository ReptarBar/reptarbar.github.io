const express = require('express');
const { storeReport } = require('./storage');

const router = express.Router();

router.post('/submit-report', async (req, res) => {
  try {
    const payload = req.body || {};

    const sanitized = {
      communityType: String(payload.communityType || '').trim(),
      role: String(payload.role || '').trim(),
      entryPoint: String(payload.entryPoint || '').trim(),
      frictionEncountered: Array.isArray(payload.frictionEncountered)
        ? payload.frictionEncountered.map((v) => String(v).trim()).filter(Boolean)
        : [],
      sequenceOfEvents: String(payload.sequenceOfEvents || '').trim(),
      unmetExpectation: String(payload.unmetExpectation || '').trim(),
      impact: Array.isArray(payload.impact)
        ? payload.impact.map((v) => String(v).trim()).filter(Boolean)
        : [],
      perceivedRootCause: String(payload.perceivedRootCause || '').trim(),
      resolutionAttempt: String(payload.resolutionAttempt || '').trim(),
      patternRecurrence: String(payload.patternRecurrence || '').trim(),
      suggestedImprovement: String(payload.suggestedImprovement || '').trim(),
      positiveNotes: String(payload.positiveNotes || '').trim(),
      redaction: Array.isArray(payload.redaction)
        ? payload.redaction.map((v) => String(v).trim()).filter(Boolean)
        : [],
      permission: String(payload.permission || '').trim(),
      createdAt: new Date().toISOString(),
    };

    await storeReport(sanitized);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('submit-report error', error.message);
    res.status(500).json({ error: 'Unable to store report' });
  }
});

module.exports = router;
