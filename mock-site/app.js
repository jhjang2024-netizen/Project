/* 함께 — App Interactions */

document.addEventListener('DOMContentLoaded', () => {

  // ── Nav scroll effect ──────────────────────────────────────────────
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Destination selector ───────────────────────────────────────────
  document.querySelectorAll('.dest').forEach(dest => {
    dest.addEventListener('click', () => {
      document.querySelectorAll('.dest').forEach(d => d.classList.remove('dest--active'));
      dest.classList.add('dest--active');
    });
  });

  // ── Travel consent button ──────────────────────────────────────────
  const consentTrigger = document.querySelector('.consent-trigger');
  if (consentTrigger) {
    consentTrigger.addEventListener('click', () => {
      consentTrigger.textContent = '🎉 예약이 완료됐어요!';
      consentTrigger.style.background = '#10b981';
      consentTrigger.disabled = true;
      showToast('🎉 모든 예약이 자동으로 완료됐어요!');
      setTimeout(() => {
        consentTrigger.textContent = '좋아요, 가자! 🎉';
        consentTrigger.style.background = '';
        consentTrigger.disabled = false;
      }, 3000);
    });
  }

  // ── Event filter buttons ───────────────────────────────────────────
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
    });
  });

  // ── "같이 가기 제안" buttons ─────────────────────────────────────
  document.querySelectorAll('.event-card__actions .btn--dark').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('📱 부모님 앱으로 동의 요청을 보냈어요!');
    });
  });

  // ── Store buttons ──────────────────────────────────────────────────
  document.querySelectorAll('.store-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      showToast('출시 준비 중이에요. 사전 등록해 주세요!');
    });
  });

  // ── 안부 전화 팝업 ──────────────────────────────────────────────────
  const callOverlay  = document.getElementById('callPopupOverlay');
  const openTriggers = [document.getElementById('openCallPopup'), document.getElementById('openCallPopupBtn')];
  const closeBtn     = document.getElementById('closeCallPopup');
  const callStatus   = document.getElementById('callStatus');
  const callWaves    = document.getElementById('callWaves');
  const messages     = ['msg1','msg2','msg3','msg4'].map(id => document.getElementById(id));
  const callReport   = document.getElementById('callReport');
  const callCta      = document.getElementById('callCta');

  let callTimers = [];

  function openCallPopup() {
    callOverlay.classList.add('is-open');
    callOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    resetCall();
    runCallSequence();
  }

  function closeCallPopup() {
    callOverlay.classList.remove('is-open');
    callOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    callTimers.forEach(clearTimeout);
    callTimers = [];
  }

  function resetCall() {
    callStatus.textContent = 'AI 안부 전화 연결 중...';
    callWaves.classList.remove('paused');
    messages.forEach(m => m.classList.add('hidden'));
    callReport.classList.add('hidden');
    callCta.classList.add('hidden');
  }

  function runCallSequence() {
    const t = (ms, fn) => { callTimers.push(setTimeout(fn, ms)); };
    t(800,  () => { callStatus.textContent = '통화 중 · 00:01'; });
    t(1400, () => messages[0].classList.remove('hidden'));
    t(2800, () => messages[1].classList.remove('hidden'));
    t(4200, () => messages[2].classList.remove('hidden'));
    t(5600, () => messages[3].classList.remove('hidden'));
    t(7000, () => {
      callStatus.textContent = '통화 종료 · 00:42';
      callWaves.classList.add('paused');
    });
    t(7600, () => {
      callReport.classList.remove('hidden');
      callCta.classList.remove('hidden');
    });
  }

  openTriggers.forEach(el => el && el.addEventListener('click', openCallPopup));
  closeBtn.addEventListener('click', closeCallPopup);
  callOverlay.addEventListener('click', e => { if (e.target === callOverlay) closeCallPopup(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCallPopup(); });

  callCta.addEventListener('click', () => {
    closeCallPopup();
    document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ── Schedule sync demo buttons ─────────────────────────────────────
  document.querySelectorAll('.sync-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.cal;
      btn.textContent = '✓ 연동됨';
      btn.classList.add('synced');
      showToast(`${label} 캘린더가 연동됐어요!`);
    });
  });

  // ── Scroll reveal ──────────────────────────────────────────────────
  const revealEls = document.querySelectorAll(
    '.activity-block, .dest, .event-card, .testi-card, .how__step, .stat-item, .plan-item, .sync-card'
  );
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  const style = document.createElement('style');
  style.textContent = `
    .activity-block, .dest, .event-card, .testi-card, .how__step, .stat-item, .plan-item, .sync-card {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .activity-block { transform: none; }
    .revealed {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    .sync-btn.synced {
      background: #10b981 !important;
      color: white !important;
      border-color: #10b981 !important;
    }
  `;
  document.head.appendChild(style);

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
    revealObs.observe(el);
  });

  // ── Toast ──────────────────────────────────────────────────────────
  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.showToast = showToast;
});
