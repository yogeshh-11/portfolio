/**
 * Yogesh Honamore — Digital Marketing Portfolio JavaScript
 * Pure Vanilla JavaScript (ES6+)
 * Hand-made, calm, professional. Single easing: cubic-bezier(.2,.7,.2,1)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- (b) INTERACTIVE BACKGROUND CANVAS ---
  const canvas = document.getElementById('bgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animId = null;
    let isPaused = false;

    // Smoothed mouse coordinates
    const targetMouse = { x: -1000, y: -1000 };
    const currentMouse = { x: -1000, y: -1000 };

    // Dark mode detector
    const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let isDarkMode = darkSchemeQuery.matches;

    darkSchemeQuery.addEventListener('change', (e) => {
      isDarkMode = e.matches;
      if (prefersReducedMotion) {
        drawStillPattern();
      }
    });

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (prefersReducedMotion) {
        drawStillPattern();
      }
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      targetMouse.x = -1000;
      targetMouse.y = -1000;
    });

    // Draw still pattern for reduced motion
    function drawStillPattern() {
      ctx.clearRect(0, 0, width, height);
      const isMobile = width <= 640;
      const spacing = isMobile ? 34 : 40;
      const baseLen = 6;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = isDarkMode ? 'rgba(243, 241, 234, 0.13)' : 'rgba(19, 18, 26, 0.13)';

      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x - baseLen / 2, y);
          ctx.lineTo(x + baseLen / 2, y);
          ctx.stroke();
        }
      }
    }

    if (!prefersReducedMotion) {
      let startTime = performance.now();

      function render(now) {
        if (isPaused) return;

        const time = now - startTime;
        ctx.clearRect(0, 0, width, height);

        // Smooth cursor movement (ease ~8% per frame)
        currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08;
        currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08;

        const isMobile = width <= 640;
        const spacing = isMobile ? 34 : 40;
        const baseLen = 6;
        const maxRadius = 200;
        const baseColor = isDarkMode ? '243, 241, 234' : '19, 18, 26';

        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';

        let colIdx = 0;
        for (let x = spacing / 2; x < width; x += spacing, colIdx++) {
          let rowIdx = 0;
          for (let y = spacing / 2; y < height; y += spacing, rowIdx++) {
            // Idle gentle wave (smooth sine motion)
            let angle = Math.sin(time * 0.0014 + colIdx * 0.18 + rowIdx * 0.18) * 0.35;
            let len = baseLen;
            let strokeStyle = `rgba(${baseColor}, 0.13)`;

            // Distance to smoothed mouse cursor
            const dx = x - currentMouse.x;
            const dy = y - currentMouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxRadius) {
              const factor = 1 - (dist / maxRadius); // 0 at edge, 1 at center
              
              // Grow to about 15px
              len = baseLen + 9 * factor;

              // Swing to circle around pointer (tangential angle)
              const tangentAngle = Math.atan2(dy, dx) + Math.PI / 2;
              
              // Interpolate smoothly between idle wave and circle tangent
              angle = angle * (1 - factor) + tangentAngle * factor;

              // Turn accent red (#ff4b2b) and increase prominence
              const redAlpha = 0.13 + 0.87 * factor;
              strokeStyle = `rgba(255, 75, 43, ${redAlpha})`;
            }

            // Draw dash centered at (x, y)
            const half = len / 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(x - cos * half, y - sin * half);
            ctx.lineTo(x + cos * half, y + sin * half);
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
          }
        }

        animId = requestAnimationFrame(render);
      }

      animId = requestAnimationFrame(render);

      // Pause drawing when tab is hidden to save power
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          isPaused = true;
          if (animId) cancelAnimationFrame(animId);
        } else {
          isPaused = false;
          startTime = performance.now();
          animId = requestAnimationFrame(render);
        }
      });
    } else {
      drawStillPattern();
    }
  }

  // --- (c) SCROLL-PROGRESS LINE AT VERY TOP ---
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress && !prefersReducedMotion) {
    function updateScrollProgress() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(Math.max((scrollY / totalHeight) * 100, 0), 100);
        scrollProgress.style.width = progress + '%';
      }
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  // --- (d) & (j) SECTION OBSERVER (Lines, Labels, Footer Underline) ---
  const observedSections = document.querySelectorAll('.content-row, .site-footer');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Trigger number counter if section is #work
          if (entry.target.id === 'work' && !entry.target.dataset.counted) {
            entry.target.dataset.counted = 'true';
            startNumberCounters();
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    observedSections.forEach(sec => sectionObserver.observe(sec));
  } else {
    // Fallback if IntersectionObserver not available
    observedSections.forEach(sec => sec.classList.add('is-visible'));
    startNumberCounters();
  }

  // --- (e) RESULT NUMBERS COUNT-UP FROM 0 ---
  function startNumberCounters() {
    const numberEls = document.querySelectorAll('.result-number');
    numberEls.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target')) || 0;
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';

      if (prefersReducedMotion) {
        el.textContent = `${prefix}${target}${suffix}`;
        return;
      }

      const duration = 850; // ms
      const startTime = performance.now();

      function updateNumber(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Single universal easing: cubic-bezier(.2,.7,.2,1) approximation
        // f(t) = t * (2 - t) or standard ease-out
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(target * ease);

        el.textContent = `${prefix}${currentVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          el.textContent = `${prefix}${target}${suffix}`;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  // --- COPY EMAIL BUTTON (with 1.8s "Copied ✓" state) ---
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const userEmail = 'yogeshhonamore24@gmail.com';

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(userEmail);
        const prevText = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'Copied ✓';
        copyEmailBtn.style.color = '#ff4b2b';
        copyEmailBtn.style.borderColor = '#ff4b2b';

        setTimeout(() => {
          copyEmailBtn.textContent = prevText;
          copyEmailBtn.style.color = '';
          copyEmailBtn.style.borderColor = '';
        }, 1800);
      } catch (err) {
        window.location.href = `mailto:${userEmail}`;
      }
    });
  }

  // --- LIVE LOCAL TIME UPDATING EVERY 30 SECONDS ---
  const liveStatusText = document.getElementById('liveStatusText');
  function updateLiveTime() {
    if (!liveStatusText) return;
    try {
      const now = new Date();
      // Sangli is in IST (UTC+5:30)
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const timeStr = formatter.format(now);
      liveStatusText.textContent = `Open to work \u00B7 Sangli, India \u00B7 ${timeStr} IST`;
    } catch (e) {
      liveStatusText.textContent = `Open to work \u00B7 Sangli, India \u00B7 live local time`;
    }
  }

  updateLiveTime();
  setInterval(updateLiveTime, 30000);

  // --- COPYRIGHT YEAR AUTO-UPDATE ---
  const copyrightYear = document.getElementById('copyrightYear');
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  // --- BACK TO TOP BUTTON ---
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }
});
