(function () {
  const ready = (fn) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  // Two-part names with optional hyphen or apostrophe; avoids single-word false positives.
  const FULL_NAME = /\b[A-Z][a-z]{2,}(?:[-'][A-Z][a-z]{2,})?\s+[A-Z][a-z]{2,}(?:[-'][A-Z][a-z]{2,})?\b/;
  // Titled single names (e.g., Dr Smith) that still imply identity.
  const TITLED_NAME = /\b(?:Mr|Mrs|Ms|Miss|Dr|Prof)\.?\s+[A-Z][a-z]{2,}\b/;

  const redactionPatterns = [
    /@\w+/, // @handles
    FULL_NAME,
    TITLED_NAME,
    /[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}/, // Emails
    /https?:\/\//i, // URLs
    /\b(harassed|abused|threatened|assaulted|retaliated|bullied|slandered)\b/i, // accusatory terms
  ];

  const validateRedaction = (formData) => {
    const textFields = [
      'sequenceOfEvents',
      'unmetExpectation',
      'resolutionAttempt',
      'positiveNotes',
    ];
    return textFields.every((field) => {
      const value = (formData.get(field) || '').trim();
      if (!value) return field === 'positiveNotes';
      return !redactionPatterns.some((pattern) => pattern.test(value));
    });
  };

  const serializeForm = (form) => {
    const data = new FormData(form);
    const checkedValues = (name) => data.getAll(name);
    return {
      communityType: data.get('communityType') || '',
      role: data.get('role') || '',
      entryPoint: data.get('entryPoint') || '',
      frictionEncountered: checkedValues('frictionEncountered'),
      sequenceOfEvents: (data.get('sequenceOfEvents') || '').trim(),
      unmetExpectation: (data.get('unmetExpectation') || '').trim(),
      impact: checkedValues('impact'),
      perceivedRootCause: data.get('perceivedRootCause') || '',
      resolutionAttempt: (data.get('resolutionAttempt') || '').trim(),
      patternRecurrence: data.get('patternRecurrence') || '',
      suggestedImprovement: data.get('suggestedImprovement') || '',
      positiveNotes: (data.get('positiveNotes') || '').trim(),
      redaction: checkedValues('redaction'),
      permission: data.get('permission') || '',
    };
  };

  const showStatus = (el, message, type = 'info') => {
    el.textContent = message;
    el.classList.remove('success', 'error');
    if (type === 'success') el.classList.add('success');
    if (type === 'error') el.classList.add('error');
  };

  const toggleAccordion = (item) => {
    const isOpen = item.classList.contains('is-open');
    item.classList.toggle('is-open');
    const title = item.querySelector('.accordion-title');
    const content = item.querySelector('.accordion-content');
    if (title) title.setAttribute('aria-expanded', String(!isOpen));
    if (content) content.style.display = isOpen ? 'none' : 'block';
  };

  ready(() => {
    const form = document.getElementById('field-report-form');
    const warning = document.getElementById('redaction-warning');
    const status = document.querySelector('.submission-status');
    const confirmation = document.getElementById('report-confirmation');
    const accordionItems = document.querySelectorAll('[data-accordion] .accordion-item');

    accordionItems.forEach((item) => {
      const trigger = item.querySelector('.accordion-title');
      trigger?.addEventListener('click', () => toggleAccordion(item));
    });

    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      warning?.setAttribute('style', 'display:none');
      if (status) showStatus(status, 'Validating report...');

      if (!form.checkValidity()) {
        form.reportValidity();
        showStatus(status, 'Please complete all required fields.', 'error');
        return;
      }

      const formData = new FormData(form);
      const passesRedaction = validateRedaction(formData);
      if (!passesRedaction) {
        warning?.setAttribute('style', 'display:block');
        showStatus(
          status,
          'Redaction required. Remove personal names, @handles, emails, URLs, or accusations.',
          'error'
        );
        return;
      }

      const payload = serializeForm(form);
      try {
        const response = await fetch('/community/submit-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        showStatus(status, 'Submitted securely.', 'success');
        form.setAttribute('hidden', 'hidden');
        confirmation?.removeAttribute('hidden');
      } catch (error) {
        showStatus(status, 'Submission blocked. Please try again without identifiers.', 'error');
      }
    });
  });
})();
