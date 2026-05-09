// ParentCare AI — Mock Site Interactions

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky nav active link highlighting ──────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));

  // ── Animate vital bars on scroll ─────────────────────────────────
  const vitalBars = document.querySelectorAll('.vital-bar__fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.getAttribute('style').match(/width:(\S+)/)?.[1] || '50%';
      }
    });
  }, { threshold: 0.5 });
  vitalBars.forEach(bar => {
    const originalWidth = bar.style.width;
    bar.style.width = '0%';
    bar.dataset.width = originalWidth;
    barObserver.observe(bar);
  });

  // Fix: restore widths on intersection
  const barObserver2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width;
      }
    });
  }, { threshold: 0.3 });
  vitalBars.forEach(bar => barObserver2.observe(bar));

  // ── Consent demo interactivity ────────────────────────────────────
  const consentYes = document.querySelector('.c-yes');
  const consentNo = document.querySelector('.c-no');
  const consentAlt = document.querySelector('.c-alt');

  if (consentYes) {
    consentYes.addEventListener('click', () => {
      showToast('✅ 동의가 완료됐어요! 예약을 자동으로 진행합니다.');
    });
    consentNo.addEventListener('click', () => {
      showToast('자녀에게 "부모님이 이번엔 괜찮다고 하셨어요" 알림이 전송됩니다.');
    });
    consentAlt.addEventListener('click', () => {
      showToast('📅 다른 날짜 3개를 제안해 드릴게요.');
    });
  }

  // ── SOS button animation ──────────────────────────────────────────
  const sosBtn = document.querySelector('.sos-btn');
  if (sosBtn) {
    let holdTimer = null;
    sosBtn.addEventListener('mousedown', () => {
      holdTimer = setTimeout(() => {
        showToast('🚨 SOS 긴급 도움 요청이 발송됩니다!');
      }, 3000);
    });
    sosBtn.addEventListener('mouseup', () => clearTimeout(holdTimer));
    sosBtn.addEventListener('mouseleave', () => clearTimeout(holdTimer));
  }

  // ── Scroll-reveal animation ───────────────────────────────────────
  const revealItems = document.querySelectorAll(
    '.feature-card, .care-card, .privacy-card, .dispatch-step, .value-item, .plan'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, (entry.target.dataset.delay || 0));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealItems.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    el.dataset.delay = (i % 4) * 80;
    revealObserver.observe(el);
  });

  // ── Toast notification helper ─────────────────────────────────────
  function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #1a1a2e;
      color: white;
      padding: 12px 24px;
      border-radius: 99px;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      opacity: 0;
      transition: all 0.3s ease;
      max-width: 90vw;
      text-align: center;
      white-space: nowrap;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ── Download buttons mock ─────────────────────────────────────────
  document.querySelectorAll('.store-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('📱 출시 준비 중입니다. 사전 등록해 주세요!');
    });
  });

  // ── "무료로 시작하기" smooth interaction ─────────────────────────
  document.querySelectorAll('a[href="#download"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ── Nav active style injection ────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `.nav__links a.active { color: var(--primary); font-weight: 700; }`;
  document.head.appendChild(style);

});
