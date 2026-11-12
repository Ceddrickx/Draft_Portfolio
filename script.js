const menuToggle = document.querySelector('#menuToggle');
const primaryNav = document.querySelector('#primaryNav');
const navLinks = primaryNav ? [...primaryNav.querySelectorAll('a[data-section]')] : [];

const setActiveSection = (sectionId) => {
  navLinks.forEach((link) => {
    const isActive = link.dataset.section === sectionId;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};

const closeMenu = () => {
  if (!menuToggle || !primaryNav) return;
  primaryNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
};

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 680) closeMenu();
  });
}

const sections = navLinks
  .map((link) => document.getElementById(link.dataset.section))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visibleSection) setActiveSection(visibleSection.target.id);
  }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .25, .6] });

  sections.forEach((section) => sectionObserver.observe(section));
}

setActiveSection(window.location.hash ? window.location.hash.slice(1) : 'about');

const revealTargets = [
  ...document.querySelectorAll('#about .section-heading, #about .section-content'),
  ...document.querySelectorAll('#skills .section-intro, #skills .skill-index, #skills .interest-strip'),
  ...document.querySelectorAll('#education .section-heading, #education .section-content'),
  ...document.querySelectorAll('#projects .project-intro, #projects .project-card'),
  ...document.querySelectorAll('#goals .section-heading, #goals .section-content'),
  ...document.querySelectorAll('#contact .contact-copy, #contact .contact-form')
];

if (revealTargets.length) {
  revealTargets.forEach((target, index) => {
    target.classList.add('reveal');
    target.style.setProperty('--reveal-delay', `${target.matches('.project-card') ? (index % 2) * 100 : 0}ms`);
  });
  document.documentElement.classList.add('reveal-enabled');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.18 });
    revealTargets.forEach((target) => revealObserver.observe(target));
  }
}

const contactForm = document.querySelector('#contactForm');
const formStatus = document.querySelector('#formStatus');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = [...contactForm.querySelectorAll('input, textarea')];
    const nameField = document.querySelector('#name');
    const emailField = document.querySelector('#email');
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = document.querySelector('#message').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    fields.forEach((field) => field.removeAttribute('aria-invalid'));
    formStatus.textContent = '';

    if (!name || !email || !message) {
      fields.filter((field) => !field.value.trim()).forEach((field) => field.setAttribute('aria-invalid', 'true'));
      formStatus.textContent = 'Please complete your name, email, and message.';
      formStatus.style.color = '#ff927f';
      return;
    }

    if (!emailPattern.test(email)) {
      emailField.setAttribute('aria-invalid', 'true');
      formStatus.textContent = 'Please enter a valid email address.';
      formStatus.style.color = '#ff927f';
      emailField.focus();
      return;
    }

    formStatus.textContent = `Thanks, ${name}. This prototype is ready, but it does not send messages yet.`;
    formStatus.style.color = '#d8ff3f';
    contactForm.reset();
  });
}
