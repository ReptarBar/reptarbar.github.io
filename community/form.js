(function () {
  const ready = (fn) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
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
      if (status) showStatus(status, 'Submitting report...');

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
        showStatus(status, 'Submission failed. Please try again.', 'error');
      }
    });
  });
})();
