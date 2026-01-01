const express = require('express');
const { storeReport } = require('./storage');

const router = express.Router();

// Two-part names, optional hyphen or apostrophe, and require length so “The” does not match.
const FULL_NAME =
  /\b[A-Z][a-z]{2,}(?:[-'][A-Z][a-z]{2,})?\s+[A-Z][a-z]{2,}(?:[-'][A-Z][a-z]{2,})?\b/;

// Titled single name, still a strong signal.
const TITLED_NAME =
  /\b(?:Mr|Mrs|Ms|Miss|Dr|Prof)\.?\s+[A-Z][a-z]{2,}\b/;

const redactionPatterns = [
  /@\w+/, // @handles
  FULL_NAME,
  TITLED_NAME,
  /[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}/,
  /https?:\/\//i,
  /\b(harassed|abused|threatened|assaulted|retaliated|bullied|slandered)\b/i,
];

const failsRedaction = (value) => redactionPatterns.some((pattern) => pattern.test(value));

router.post('/submit-report', async (req, res) => {
  try {
    const payload = req.body || {};

    // Server-side safety: basic presence checks
    const requiredFields = [
      'communityType',
      'role',
      'entryPoint',
      'frictionEncountered',
      'sequenceOfEvents',
      'unmetExpectation',
      'impact',
      'perceivedRootCause',
      'resolutionAttempt',
      'patternRecurrence',
      'suggestedImprovement',
      'redaction',
      'permission',
    ];

    const missing = requiredFields.filter((key) => {
      const value = payload[key];
      if (Array.isArray(value)) return value.length === 0;
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', fields: missing });
    }

    const textFields = ['sequenceOfEvents', 'unmetExpectation', 'resolutionAttempt', 'positiveNotes'];
    const hasIdentifiers = textFields.some((field) => failsRedaction(String(payload[field] || '')));

    if (hasIdentifiers) {
      return res.status(400).json({
        error:
          'Please remove personal identifiers. Field Reports may only describe observable community behaviors, not individuals.',
      });
    }

    const sanitized = {
      communityType: String(payload.communityType).trim(),
      role: String(payload.role).trim(),
      entryPoint: String(payload.entryPoint).trim(),
      frictionEncountered: Array.isArray(payload.frictionEncountered)
        ? payload.frictionEncountered.map((v) => String(v).trim()).filter(Boolean)
        : [],
      sequenceOfEvents: String(payload.sequenceOfEvents || '').trim(),
      unmetExpectation: String(payload.unmetExpectation || '').trim(),
      impact: Array.isArray(payload.impact)
        ? payload.impact.map((v) => String(v).trim()).filter(Boolean)
        : [],
      perceivedRootCause: String(payload.perceivedRootCause).trim(),
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
