(function () {
  const ready = (fn) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  ready(() => {
    // Smooth scroll for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        const target = targetId && document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Scroll spy for navigation links
    const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('id');
          const link = navLinks.find((a) => a.getAttribute('href') === `#${id}`);
          if (!link) return;
          if (entry.isIntersecting) {
            link.classList.add('is-active');
          } else {
            link.classList.remove('is-active');
          }
        });
      },
      { threshold: 0.4 }
    );

    document.querySelectorAll('section[id]').forEach((section) => observer.observe(section));

    // Header shadow on scroll
    const header = document.querySelector('.site-header');
    const toggleHeaderState = () => {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    toggleHeaderState();
    window.addEventListener('scroll', toggleHeaderState, { passive: true });

    // Template gate on sample-report page
    const gate = document.querySelector('#template-gate');
    if (gate) {
      const input = gate.querySelector('#template-code');
      const unlockBtn = gate.querySelector('[data-template-action="unlock"]');
      const errorMsg = gate.querySelector('[data-template-error]');
      const result = gate.querySelector('[data-template-result]');
      const ACCESS_CODE = 'Code33';

      const unlock = () => {
        if (!input) return;
        const value = (input.value || '').trim();
        if (value === ACCESS_CODE) {
          errorMsg && errorMsg.setAttribute('hidden', 'hidden');
          result && result.removeAttribute('hidden');
          unlockBtn && unlockBtn.setAttribute('aria-live', 'polite');
          unlockBtn && (unlockBtn.textContent = 'Unlocked');
          unlockBtn && unlockBtn.setAttribute('disabled', 'true');
          input.setAttribute('disabled', 'true');
        } else {
          errorMsg && errorMsg.removeAttribute('hidden');
          result && result.setAttribute('hidden', 'hidden');
        }
      };

      unlockBtn && unlockBtn.addEventListener('click', unlock);
      input && input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          unlock();
        }
      });
    }
  });
})();
