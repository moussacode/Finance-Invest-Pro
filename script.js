/* =============================================
   FINANCE INVEST PRO — JavaScript
   Fonctionnalités : navbar, scroll, stats,
   simulateur, formulaire, animations
   ============================================= */

'use strict';

/* ========================================
   1. NAVBAR — sticky + hamburger
   ======================================== */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navItems  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  toggleBackToTop();
  updateActiveNavLink();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navItems.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) {
      current = sec.getAttribute('id');
    }
  });
  navItems.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

/* ========================================
   2. BACK TO TOP
   ======================================== */
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ========================================
   3. SCROLL REVEAL ANIMATION
   ======================================== */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children in the same parent
      const delay = entry.target.closest('.avantages-grid, .services-grid, .actu-grid')
        ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100
        : 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ========================================
   4. ANIMATED COUNTERS (hero stats)
   ======================================== */
function animateCounter(el, target, duration = 1800) {
  const startTime = performance.now();
  const start = 0;

  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quad
    const eased    = 1 - (1 - progress) * (1 - progress);
    const current  = Math.floor(eased * target);
    el.textContent = current.toLocaleString('fr-FR');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEls = entry.target.querySelectorAll('.stat-num[data-target]');
      numEls.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

/* ========================================
   5. RANGE SLIDERS (simulateur)
   ======================================== */
const dureeSlider = document.getElementById('duree');
const tauxSlider  = document.getElementById('taux');
const dureeDisplay = document.getElementById('dureeDisplay');
const tauxDisplay  = document.getElementById('tauxDisplay');

function updateRangeTrack(slider) {
  const min = +slider.min, max = +slider.max, val = +slider.value;
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, #38BDF8 ${pct}%, rgba(255,255,255,0.12) ${pct}%)`;
}

if (dureeSlider && tauxSlider) {
  dureeSlider.addEventListener('input', () => {
    dureeDisplay.textContent = dureeSlider.value;
    updateRangeTrack(dureeSlider);
  });
  tauxSlider.addEventListener('input', () => {
    tauxDisplay.textContent = tauxSlider.value;
    updateRangeTrack(tauxSlider);
  });
  // Init
  updateRangeTrack(dureeSlider);
  updateRangeTrack(tauxSlider);
}

/* ========================================
   6. SIMULATEUR — calcul intérêts composés
   ======================================== */
function formatMoney(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(n);
}

function calculerInvestissement() {
  const capitalInput = document.getElementById('capital');
  const errorEl = document.getElementById('capitalError');

  const capital = parseFloat(capitalInput.value.replace(',', '.'));
  const duree = parseInt(document.getElementById('duree').value, 10);
  const taux = parseFloat(document.getElementById('taux').value) / 100;

  const freqEl = document.querySelector('input[name="freq"]:checked');

  // Validation fréquence
  if (!freqEl) return;

  const freq = parseInt(freqEl.value, 10);

  // Validation capital
  if (!capitalInput.value || isNaN(capital) || capital <= 0) {
    errorEl.textContent = 'Veuillez saisir un montant valide (> 0).';
    capitalInput.classList.add('error');
    return;
  }

  if (capital < 100000) {
    errorEl.textContent = 'Le montant minimum est de 100 000 FCFA.';
    capitalInput.classList.add('error');
    return;
  }

  errorEl.textContent = '';
  capitalInput.classList.remove('error');

  // Formule intérêt composé
  const montantFinal = capital * Math.pow(1 + taux / freq, freq * duree);
  const interets = montantFinal - capital;
  const gainPct = ((interets / capital) * 100).toFixed(1);

  // Affichage UI
  document.getElementById('simEmpty').style.display = 'none';
  document.getElementById('simData').style.display = 'block';

  animateValue('resMontantFinal', montantFinal, true);
  animateValue('resCapital', capital, true);
  animateValue('resInterets', interets, true);

  document.getElementById('resDuree').textContent =
    `${duree} an${duree > 1 ? 's' : ''}`;

  document.getElementById('resGain').textContent =
    `+${gainPct}%`;

  // Barres progression
  const capPct = (capital / montantFinal) * 100;
  const intPct = (interets / montantFinal) * 100;

  setTimeout(() => {
    document.getElementById('simBarCapital').style.width = capPct + '%';
    document.getElementById('simBarInterets').style.width = intPct + '%';
  }, 100);

  // Tableau progression
  buildProgression(capital, taux, freq, duree);

  // Animation bouton
  const btn = document.getElementById('simulerBtn');
  btn.innerHTML = 'Calculé';
  btn.style.background = '#10B981';

  setTimeout(() => {
    btn.innerHTML = 'Recalculer';
    btn.style.background = '';
  }, 1500);
}

function animateValue(id, finalVal, isCurrency, duration = 1000) {
  const el = document.getElementById(id);
  if (!el) return;

  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * finalVal;

    el.textContent = isCurrency
      ? formatMoney(current)
      : current.toFixed(1) + '%';

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function buildProgression(capital, taux, freq, duree) {
  const container = document.getElementById('simProgression');

  let html =
    '<strong style="color:rgba(255,255,255,0.5);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Progression annuelle</strong><br/>';

  let previous = capital;

  for (let y = 1; y <= duree; y++) {
    const val = capital * Math.pow(1 + taux / freq, freq * y);
    const gain = val - previous;
    previous = val;

    const sign = gain >= 0 ? '+' : '';

    html += `
      <span style="color:rgba(255,255,255,0.5)">
        Année ${String(y).padStart(2, '0')}
      </span>
      &nbsp;
      <span style="color:#38BDF8;font-weight:600">
        ${formatMoney(val)}
      </span>
      &nbsp;
      <span style="color:#10B981;font-size:0.75rem">
        ${sign}${formatMoney(gain)}
      </span><br/>
    `;
  }

  container.innerHTML = html;
}
/* ========================================
   7. FORMULAIRE DE CONTACT — validation
   ======================================== */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateContactForm()) {
      // Simulation envoi
      contactForm.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
    }
  });

  // Real-time validation
  ['nom','prenom','email','tel','message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur',  () => validateField(id));
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) validateField(id);
      });
    }
  });
}

function validateField(id) {
  const el     = document.getElementById(id);
  const errEl  = document.getElementById(id + 'Error');
  const val    = el ? el.value.trim() : '';
  let msg      = '';

  switch (id) {
    case 'nom':
    case 'prenom':
      if (!val) msg = 'Ce champ est obligatoire.';
      else if (val.length < 2) msg = 'Minimum 2 caractères.';
      else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(val)) msg = 'Caractères invalides.';
      break;
    case 'email':
      if (!val) msg = 'L\'email est obligatoire.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Adresse email invalide.';
      break;
    case 'tel':
      if (!val) msg = 'Le téléphone est obligatoire.';
      else if (!/^[\+\d][\d\s\-\.\(\)]{7,15}$/.test(val)) msg = 'Numéro de téléphone invalide.';
      break;
    case 'message':
      if (!val) msg = 'Le message est obligatoire.';
      else if (val.length < 10) msg = 'Message trop court (minimum 10 caractères).';
      break;
  }

  if (errEl) errEl.textContent = msg;
  if (el) {
    el.classList.toggle('error', !!msg);
    el.classList.toggle('valid', !msg && !!val);
  }
  return !msg;
}

function validateContactForm() {
  const fields = ['nom','prenom','email','tel','message'];
  const results = fields.map(id => validateField(id));
  return results.every(Boolean);
}

/* ========================================
   8. SMOOTH SCROLL (liens internes)
   ======================================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // hauteur navbar
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ========================================
   9. INIT au chargement
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Trigger initial scroll check
  window.dispatchEvent(new Event('scroll'));

  // Animate hero reveal on load
  const heroReveal = document.querySelectorAll('.hero .reveal');
  heroReveal.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 200 + i * 150);
  });
});
