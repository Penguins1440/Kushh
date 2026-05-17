/* ============================================
   KUSH ARYAL — PORTFOLIO SCRIPTS
   ============================================ */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '9779841712132';
  const TYPING_PHRASES = [
    'Web Developer',
    'UI/UX Designer',
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

  /* ---- Contact Form → WhatsApp ---- */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      const whatsappMessage =
        `*New Portfolio Message*\n\n` +
        `*Name:* ${name}\n` +
        `*Email:* ${email}\n\n` +
        `*Message:*\n${message}`;

      const encodedText = encodeURIComponent(whatsappMessage);
      const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

      window.open(whatsappURL, '_blank');
      contactForm.reset();
    });
  }
})();
