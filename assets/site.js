(function () {
  const ready = (fn) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const normalizeBody = (value) => {
    if (!value) return '';
    return value.replace(/\\n/g, '\n');
  };

  const buildMailto = (el) => {
    const { user, domain, tld, subject, body, display } = el.dataset;
    if (!user || !domain || !tld) return;
    const email = `${user}@${domain}.${tld}`;
    const params = new URLSearchParams();
    if (subject) {
      params.set('subject', subject);
    }
    if (body) {
      params.set('body', normalizeBody(body));
    }
    const query = params.toString();
    const mailto = query ? `mailto:${email}?${query}` : `mailto:${email}`;
    el.setAttribute('href', mailto);
    el.setAttribute('aria-label', email);
    el.setAttribute('title', email);
    if (display) {
      el.textContent = display;
    }
  };

  const hydrateEmails = () => {
    document.querySelectorAll('[data-obf-email]').forEach((el) => buildMailto(el));
  };

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
          });
        }
      });
    });
  };

  const initScrollSpy = () => {
    const navLinks = Array.from(
      document.querySelectorAll('.site-nav a[href^="#"], .mobile-nav a[href^="#"]')
    );
    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (!navLinks.length || !sections.length || !('IntersectionObserver' in window)) return;

    let activeId = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;
        const nextId = visible[0].target.id;
        if (nextId === activeId) return;
        activeId = nextId;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${nextId}`);
        });
      },
      { threshold: [0.3, 0.6], rootMargin: '0px 0px -35% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const initHeaderScroll = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const toggleHeaderState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    toggleHeaderState();
    window.addEventListener('scroll', toggleHeaderState, { passive: true });
  };

  const initMobileNav = () => {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    if (!navToggle || !mobileNav) return;

    let isOpen = false;
    let lastFocus = null;

    const setOpen = (open) => {
      isOpen = open;
      navToggle.setAttribute('aria-expanded', String(open));
      mobileNav.hidden = !open;
      mobileNav.classList.toggle('is-open', open);

      if (open) {
        lastFocus = document.activeElement;
        const firstLink = mobileNav.querySelector('a');
        if (firstLink) {
          setTimeout(() => firstLink.focus(), 0);
        }
      } else if (lastFocus && lastFocus.focus) {
        lastFocus.focus();
      }
    };

    navToggle.addEventListener('click', () => setOpen(!isOpen));

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (event) => {
      if (!isOpen) return;
      if (mobileNav.contains(event.target) || navToggle.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 720 && isOpen) {
        setOpen(false);
      }
    });
  };

  const initTemplateGate = () => {
    const gate = document.querySelector('#template-gate');
    if (!gate) return;
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
  };

  ready(() => {
    hydrateEmails();
    initSmoothScroll();
    initScrollSpy();
    initHeaderScroll();
    initMobileNav();
    initTemplateGate();
  });
})();
