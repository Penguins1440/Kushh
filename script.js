/* ============================================
   KUSH ARYAL — PORTFOLIO SCRIPTS
   ============================================ */

(function () {
  'use strict';

  const PORTFOLIO_CONFIG = window.PORTFOLIO_CONFIG || {};
  const N8N_WEBHOOK_URL = (PORTFOLIO_CONFIG.n8nWebhookUrl || '').trim();
  const N8N_WEBHOOK_SECRET = (PORTFOLIO_CONFIG.n8nWebhookSecret || '').trim();

  const TYPING_PHRASES = [
    'Explorer',
    'Web Developer',
    'Traveler',
    'Data Enthusiast',
    'SongWriter',
    'Creative Technologist',
    'Future Builder'
  ];

  /* ---- DOM Elements ---- */
  const loader = document.getElementById('loader');
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('navMenu');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const typingText = document.getElementById('typingText');
  const contactForm = document.getElementById('contactForm');
  const contactFormStatus = document.getElementById('contactFormStatus');
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');
  const sections = document.querySelectorAll('section[id]');

  /* ---- Loading Screen ---- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      document.body.classList.add('loaded');
    }, 2200);
  });

  /* ---- Typing Animation ---- */
  if (typingText) {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
      const current = TYPING_PHRASES[phraseIndex];

      if (isDeleting) {
        typingText.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typingText.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === current.length) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % TYPING_PHRASES.length;
        typingSpeed = 500;
      }

      setTimeout(typeEffect, typingSpeed);
    }

    setTimeout(typeEffect, 2500);
  }

  /* ---- Navbar Scroll ---- */
  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll();

  /* ---- Mobile Menu ---- */
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      const expanded = navToggle.classList.contains('active');
      navToggle.setAttribute('aria-expanded', expanded);
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Smooth Scrolling ---- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---- Active Section Highlighting ---- */
  function setActiveNav() {
    const scrollPos = window.scrollY + 150;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveNav);

  /* ---- Scroll Reveal ---- */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ---- Animated Counters ---- */
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    statNumbers.forEach((stat) => {
      const rect = stat.closest('.stats-grid')?.getBoundingClientRect();
      if (!rect) return;

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        countersAnimated = true;
        const target = parseInt(stat.getAttribute('data-target'), 10);
        const duration = 2000;
        const start = performance.now();

        function updateCounter(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          stat.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            stat.textContent = target;
          }
        }

        requestAnimationFrame(updateCounter);
      }
    });
  }

  window.addEventListener('scroll', animateCounters);
  animateCounters();

  /* ---- Skill Progress Bars ---- */
  const skillCards = document.querySelectorAll('.skill-card');
  let skillsAnimated = false;

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !skillsAnimated) {
          skillsAnimated = true;
          skillCards.forEach((card, i) => {
            const percentEl = card.querySelector('.skill-percent');
            const percent = percentEl
              ? parseInt(percentEl.textContent, 10)
              : parseInt(card.getAttribute('data-skill'), 10);
            const bar = card.querySelector('.skill-progress');
            setTimeout(() => {
              if (bar && !Number.isNaN(percent)) bar.style.width = percent + '%';
            }, i * 120);
          });
        }
      });
    },
    { threshold: 0.2 }
  );

  const skillsSection = document.getElementById('skills');
  if (skillsSection) skillObserver.observe(skillsSection);

  /* ---- Contact Form → n8n Webhook → Email ---- */
  function setContactFormStatus(text, type) {
    if (!contactFormStatus) return;
    contactFormStatus.textContent = text;
    contactFormStatus.classList.remove('success', 'error');
    if (type) contactFormStatus.classList.add(type);
  }

  function setContactFormLoading(isLoading) {
    if (contactSubmitBtn) {
      contactSubmitBtn.disabled = isLoading;
    }
    const label = contactForm?.querySelector('.contact-submit-label');
    if (label) {
      label.textContent = isLoading ? 'Sending…' : 'Send a Mail';
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        setContactFormStatus('Please fill in all fields.', 'error');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setContactFormStatus('Please enter a valid email address.', 'error');
        return;
      }

      if (!N8N_WEBHOOK_URL) {
        setContactFormStatus(
          'Contact form is not connected yet. Add your n8n webhook URL in config.js.',
          'error'
        );
        return;
      }

      setContactFormLoading(true);
      setContactFormStatus('Sending your message…', null);

      const headers = { 'Content-Type': 'application/json' };
      if (N8N_WEBHOOK_SECRET) {
        headers['X-Webhook-Secret'] = N8N_WEBHOOK_SECRET;
      }

      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ name, email, message })
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        contactForm.reset();
        setContactFormStatus('Message sent! I will get back to you soon.', 'success');
      } catch (err) {
        setContactFormStatus(
          'Could not send your message. Check your n8n workflow is active and CORS is enabled.',
          'error'
        );
      } finally {
        setContactFormLoading(false);
      }
    });
  }
})();
