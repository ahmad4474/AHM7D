(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "director-launch";
  launcher.textContent = "🎬 جرّب وضع المخرج";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "director-panel");

  const panel = document.createElement("section");
  panel.id = "director-panel";
  panel.className = "director-panel";
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", "director-heading");

  panel.innerHTML = `
    <h2 id="director-heading">إنت المخرج</h2>
    <p>اسحب الشريط وشوف كيف بتتجمّع عناصر الصفحة</p>

    <input
      class="director-timeline"
      type="range"
      min="0"
      max="100"
      value="100"
      step="0.1"
      aria-label="تقدّم المشهد"
    >

    <div class="director-labels">
      <span>البداية</span>
      <span>الاسم ← الشعار ← التفاصيل</span>
      <span>النهاية</span>
    </div>

    <div class="director-actions">
      <button type="button" data-action="play">▶ تشغيل</button>
      <button type="button" data-action="exit">دخول الموقع ←</button>
    </div>
  `;

  document.body.append(launcher, panel);

  const slider = panel.querySelector("input");
  const playButton = panel.querySelector('[data-action="play"]');
  const exitButton = panel.querySelector('[data-action="exit"]');

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let animations = [];
  let frame = null;
  let previousTime = null;

  function stopPlayback() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
    }

    frame = null;
    previousTime = null;
    playButton.textContent = "▶ تشغيل";
  }

  function updateScene(value) {
    slider.value = value;

    animations.forEach(item => {
      const progress = Math.max(
        0,
        Math.min(1, (value - item.start) / (item.end - item.start))
      );

      item.animation.currentTime = progress * 1000;
    });
  }

  function addTrack(selector, start, end, movement) {
    const element = hero.querySelector(selector);
    if (!element) return;

    const appearance = getComputedStyle(element);
    const finalTransform =
      appearance.transform === "none" ? "" : appearance.transform;

    const firstFrame = reducedMotion.matches
      ? { opacity: 0 }
      : {
          opacity: 0,
          transform: `${finalTransform} ${movement}`.trim()
        };

    const lastFrame = reducedMotion.matches
      ? { opacity: appearance.opacity }
      : {
          opacity: appearance.opacity,
          transform: finalTransform || "none"
        };

    const animation = element.animate(
      [firstFrame, lastFrame],
      {
        duration: 1000,
        easing: "ease-out",
        fill: "both"
      }
    );

    animation.pause();
    animations.push({ animation, start, end });
  }

  launcher.addEventListener("click", () => {
    if (document.body.classList.contains("logo-assembling")) return;

    animations = [];

    addTrack(
      ".background-name",
      0, 45,
      "translateY(35px) scale(0.85)"
    );

    addTrack(
      ".hero-logo",
      20, 75,
      "translateY(60px) scale(0.55) rotate(-12deg)"
    );

    addTrack(
      ".hero-content h1",
      45, 85,
      "translateY(-30px)"
    );

    addTrack(
      ".small-line",
      55, 90,
      "scaleX(0.1)"
    );

    addTrack(
      ".about-button",
      70, 100,
      "translateY(30px)"
    );

    launcher.hidden = true;
    launcher.setAttribute("aria-expanded", "true");
    panel.hidden = false;

    /* يبدأ المشهد كاملًا؛ اسحب للخلف لتفكيكه */
    updateScene(100);
    slider.focus();
  });

  slider.addEventListener("input", () => {
    stopPlayback();
    updateScene(Number(slider.value));
  });

  function playScene(time) {
    if (previousTime === null) previousTime = time;

    const elapsed = time - previousTime;
    previousTime = time;

    /* المشهد الكامل مدته 4 ثوانٍ */
    const nextValue = Math.min(
      100,
      Number(slider.value) + elapsed / 40
    );

    updateScene(nextValue);

    if (nextValue < 100) {
      frame = requestAnimationFrame(playScene);
    } else {
      stopPlayback();
    }
  }

  playButton.addEventListener("click", () => {
    if (frame !== null) {
      stopPlayback();
      return;
    }

    if (Number(slider.value) >= 100) {
      updateScene(0);
    }

    playButton.textContent = "❚❚ إيقاف";
    frame = requestAnimationFrame(playScene);
  });

  function exitDirector() {
    stopPlayback();

    animations.forEach(item => item.animation.cancel());
    animations = [];

    panel.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  exitButton.addEventListener("click", exitDirector);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      exitDirector();
    }
  });
})();