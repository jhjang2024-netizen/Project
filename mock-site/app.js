/* 함께 — App Interactions */

document.addEventListener('DOMContentLoaded', () => {

  // ── Nav scroll effect + back-to-top ───────────────────────────────
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── 햄버거 메뉴 ────────────────────────────────────────────────────
  const hamburger = document.getElementById('navHamburger');
  const navLinks  = document.getElementById('navLinks');
  function closeMenu() {
    hamburger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', '메뉴 열기');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ── Scroll spy — active nav highlight ─────────────────────────────
  const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');
  const spySections = Array.from(navAnchors)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const spyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('nav-active'));
        const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('nav-active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  spySections.forEach(s => spyObs.observe(s));

  // ── Destination selector + dynamic plan card ───────────────────────
  const travelPlans = {
    gangneung: {
      title: '강릉 경포대 2박 3일',
      dates: '7월 19일(토) ~ 21일(월)',
      imgClass: 'plan-dest-img--gangneung',
      total: '48만원',
      items: [
        { icon: '🚆', title: 'KTX 서울→강릉 왕복', desc: '7/19 08:00 출발 · 좌석 예약 완료' },
        { icon: '🏨', title: '씨마크호텔 2박', desc: '오션뷰 디럭스 · 작년보다 12% 저렴' },
        { icon: '🍽️', title: '경포맛집 코스 3곳', desc: '아버지 선호 한식 위주 추천' },
        { icon: '🗺️', title: '여행 일정표 자동 생성', desc: '날씨 예보 · 준비물 체크리스트 포함' },
      ],
    },
    jeju: {
      title: '제주도 3박 4일',
      dates: '8월 15일(금) ~ 18일(월)',
      imgClass: 'plan-dest-img--jeju',
      total: '92만원',
      items: [
        { icon: '✈️', title: '제주 항공 왕복', desc: '8/15 09:30 출발 · 이코노미 좌석' },
        { icon: '🏨', title: '신라호텔 제주 3박', desc: '오션뷰 슈페리어 · 조식 포함' },
        { icon: '🚗', title: '렌터카 3일', desc: '7인승 SUV · 공항 픽업' },
        { icon: '🗺️', title: '여행 일정표 자동 생성', desc: '성산일출봉 · 한라산 · 올레길 코스' },
      ],
    },
    gyeongju: {
      title: '경주 불국사 1박 2일',
      dates: '7월 26일(토) ~ 27일(일)',
      imgClass: 'plan-dest-img--gyeongju',
      total: '31만원',
      items: [
        { icon: '🚆', title: 'KTX 서울→경주 왕복', desc: '7/26 08:40 출발 · 신경주역' },
        { icon: '🏨', title: '힐튼경주 1박', desc: '불국사 전망 룸 · 조식 포함' },
        { icon: '🏛️', title: '불국사 · 석굴암 투어', desc: '문화해설사 동행 예약 완료' },
        { icon: '🍽️', title: '경주 한정식 저녁', desc: '교동법주 체험 포함' },
      ],
    },
    yeosu: {
      title: '여수 밤바다 2박 3일',
      dates: '9월 6일(토) ~ 8일(월)',
      imgClass: 'plan-dest-img--yeosu',
      total: '55만원',
      items: [
        { icon: '🚆', title: 'KTX 서울→여수 왕복', desc: '9/6 09:00 출발 · 여수엑스포역' },
        { icon: '🏨', title: '히든베이호텔 2박', desc: '오션뷰 스위트 · 조식 포함' },
        { icon: '🚢', title: '오동도 유람선 투어', desc: '석양 크루즈 예약 완료' },
        { icon: '🍽️', title: '돌산 갓김치 & 게장 코스', desc: '어머니 선호 해산물 위주' },
      ],
    },
  };

  function updatePlanCard(destKey) {
    const plan = travelPlans[destKey];
    if (!plan) return;
    document.getElementById('planDestTitle').textContent = plan.title;
    document.getElementById('planDestDates').textContent = plan.dates;
    document.getElementById('planTotal').textContent = plan.total;
    const img = document.getElementById('planDestImg');
    img.className = `plan-dest-img ${plan.imgClass}`;
    const itemsEl = document.getElementById('planItems');
    itemsEl.innerHTML = plan.items.map(it => `
      <div class="plan-item plan-item--done">
        <span class="plan-icon">${it.icon}</span>
        <div><strong>${it.title}</strong><p>${it.desc}</p></div>
        <span class="plan-check">✓</span>
      </div>`).join('');
  }

  document.querySelectorAll('.dest').forEach(dest => {
    dest.addEventListener('click', () => {
      document.querySelectorAll('.dest').forEach(d => d.classList.remove('dest--active'));
      dest.classList.add('dest--active');
      updatePlanCard(dest.dataset.dest);
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

  // ── Event filter buttons — actual card filtering ──────────────────
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      const cat = btn.textContent.trim();
      document.querySelectorAll('.event-card').forEach(card => {
        if (cat === '전체' || card.dataset.cat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── "같이 가기 제안" buttons ─────────────────────────────────────
  document.querySelectorAll('.event-card__actions .btn--dark').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '✓ 요청 전송됨';
      btn.disabled = true;
      showToast('📱 부모님 앱으로 동의 요청을 보냈어요!');
      setTimeout(() => { btn.textContent = '같이 가기 제안'; btn.disabled = false; }, 3000);
    });
  });

  // ── Bento 동의 버튼 인터랙션 ─────────────────────────────────────
  const svcYes = document.querySelector('.svc-consent-btn--yes');
  const svcAlt = document.querySelector('.svc-consent-btn--alt');
  const svcNo  = document.querySelector('.svc-consent-btn--no');
  svcYes?.addEventListener('click', () => {
    svcYes.textContent = '🎉 완료!';
    svcYes.style.background = '#10b981';
    showToast('🎉 부모님이 강릉 여행에 동의하셨어요! 예약이 시작됩니다.');
    setTimeout(() => { svcYes.textContent = '좋아요, 가자!'; svcYes.style.background = ''; }, 3500);
  });
  svcAlt?.addEventListener('click', () => showToast('📅 날짜 변경 요청을 보냈어요.'));
  svcNo?.addEventListener('click', () => showToast('다음 기회에 함께해요 😊'));

  // ── Kakao taxi demo ────────────────────────────────────────────────
  const kakaoBtn = document.getElementById('kakaoTaxiDemo');
  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', () => {
      kakaoBtn.textContent = '🚖 배차 중... (3분 예상)';
      kakaoBtn.classList.add('calling');
      kakaoBtn.disabled = true;
      showToast('🚖 어머니 위치에서 카카오택시를 호출했어요!');
      setTimeout(() => {
        kakaoBtn.textContent = '✓ 배차 완료! 기사님 출발';
        showToast('✓ 택시 배차 완료! 3분 후 도착 예정이에요.');
        setTimeout(() => {
          kakaoBtn.textContent = '어머니 택시 지금 호출하기 🚖';
          kakaoBtn.classList.remove('calling');
          kakaoBtn.disabled = false;
        }, 4000);
      }, 2500);
    });
  }

  // ── Store buttons ──────────────────────────────────────────────────
  document.querySelectorAll('.store-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      showToast('출시 준비 중이에요. 사전 등록해 주세요!');
    });
  });

  // ── 안부 전화 팝업 (자동 팝업 알림 체험) ────────────────────────────
  const callOverlay  = document.getElementById('callPopupOverlay');
  const openTriggers = [document.getElementById('openCallPopup'), document.getElementById('openCallPopupBtn')];
  const closeBtn     = document.getElementById('closeCallPopup');
  const screenAlert  = document.getElementById('screenAlert');
  const screenCalling = document.getElementById('screenCalling');
  const screenDone   = document.getElementById('screenDone');
  const btnCallNow   = document.getElementById('btnCallNow');
  const btnCallLater = document.getElementById('btnCallLater');
  const btnEndCall   = document.getElementById('btnEndCall');
  const callCta      = document.getElementById('callCta');

  let callTimers = [];
  const t = (ms, fn) => callTimers.push(setTimeout(fn, ms));

  function showScreen(screen) {
    [screenAlert, screenCalling, screenDone].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
  }

  function openCallPopup() {
    callOverlay.classList.add('is-open');
    callOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    callTimers.forEach(clearTimeout); callTimers = [];
    showScreen(screenAlert);
  }

  function closeCallPopup() {
    callOverlay.classList.remove('is-open');
    callOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    callTimers.forEach(clearTimeout); callTimers = [];
  }

  // "지금 전화하기" → 전화 연결 화면 → 2.5초 후 완료 화면
  btnCallNow.addEventListener('click', () => {
    showScreen(screenCalling);
    t(2500, () => showScreen(screenDone));
  });

  // "10분 후 다시 알림" → 알림 토스트 후 닫기
  btnCallLater.addEventListener('click', () => {
    closeCallPopup();
    showToast('10분 후에 다시 알려드릴게요 🔔');
  });

  // 전화 종료 버튼
  btnEndCall.addEventListener('click', () => showScreen(screenAlert));

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

  // ── Number counter animation ───────────────────────────────────────
  function animateCounter(el, target, suffix, duration) {
    const isFloat = target % 1 !== 0;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = isFloat ? (ease * target).toFixed(1) : Math.round(ease * target).toLocaleString('ko-KR');
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counterEls = document.querySelectorAll('.stat-item strong');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const numMatch = raw.match(/[\d,.]+/);
      if (!numMatch) return;
      const num = parseFloat(numMatch[0].replace(/,/g, ''));
      const suffix = raw.replace(/^[\d,.★]+/, '').trim();
      animateCounter(el, num, suffix, 1800);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => counterObs.observe(el));

  // ── Screenshots carousel ───────────────────────────────────────────
  const slides = document.querySelectorAll('.screenshot-slide');
  const dots = document.querySelectorAll('.ss-dot');
  let currentSlide = 0;
  let autoSlide;

  function goToSlide(idx) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('ss-dot--active');
    currentSlide = (idx + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('ss-dot--active');
  }

  if (slides.length) {
    document.getElementById('ssNext')?.addEventListener('click', () => { clearInterval(autoSlide); goToSlide(currentSlide + 1); resetAuto(); });
    document.getElementById('ssPrev')?.addEventListener('click', () => { clearInterval(autoSlide); goToSlide(currentSlide - 1); resetAuto(); });
    dots.forEach(dot => dot.addEventListener('click', () => { clearInterval(autoSlide); goToSlide(+dot.dataset.idx); resetAuto(); }));
    function resetAuto() { autoSlide = setInterval(() => goToSlide(currentSlide + 1), 4000); }
    resetAuto();
  }

  // ── Waitlist form ──────────────────────────────────────────────────
  const waitlistForm = document.getElementById('waitlistForm');
  const waitlistCountEl = document.getElementById('waitlistCount');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = waitlistForm.querySelector('input[type=email]');
      if (!input.value || !input.checkValidity()) return;
      const btn = waitlistForm.querySelector('button');
      btn.textContent = '✓ 등록 완료!';
      btn.style.background = '#10b981';
      input.disabled = true;
      btn.disabled = true;
      const count = parseInt(waitlistCountEl.textContent.replace(/,/g, '')) + 1;
      waitlistCountEl.textContent = count.toLocaleString('ko-KR') + '명';
      showToast('🎉 사전 등록 완료! 출시 시 이메일로 알려드릴게요.');
    });
  }

  // ── Scroll reveal ──────────────────────────────────────────────────
  const revealEls = document.querySelectorAll(
    '.activity-block, .dest, .event-card, .testi-card, .how__step, .stat-item, .plan-item, .sync-card, .pricing-card, .partner-item'
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
    .activity-block, .dest, .event-card, .testi-card, .how__step, .stat-item, .plan-item, .sync-card, .pricing-card, .partner-item {
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

  revealEls.forEach(el => {
    const localIndex = Array.from(el.parentElement.children).indexOf(el);
    el.style.transitionDelay = `${(localIndex % 4) * 60}ms`;
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
