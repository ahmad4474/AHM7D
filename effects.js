(() => {
  const cards = document.querySelectorAll(
    ".skill-card, .contact-card, .ahmed-logo-box, .ahmed-info-box"
  );

  cards.forEach(card => {
    card.classList.add("interactive-card");
  });

  const mouseMode = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const glow = document.createElement("div");
  glow.className = "pointer-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.appendChild(glow);

  let mouseX = 0;
  let mouseY = 0;
  let frame = null;

  function effectsEnabled() {
    return mouseMode.matches && !reducedMotion.matches;
  }

  document.addEventListener("pointermove", event => {
    if (!effectsEnabled() || event.pointerType === "touch") return;

    mouseX = event.clientX;
    mouseY = event.clientY;

    if (frame !== null) return;

    frame = requestAnimationFrame(() => {
      glow.style.transform =
        `translate3d(${mouseX - 160}px, ${mouseY - 160}px, 0)`;

      glow.style.opacity = "1";
      frame = null;
    });
  });

  function hideGlow() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }

    glow.style.opacity = "0";
  }

  function resetCard(card) {
    card.style.removeProperty("--card-axis");
    card.style.removeProperty("--card-angle");
  }

  cards.forEach(card => {
    card.addEventListener("pointermove", event => {
      if (!effectsEnabled() || event.pointerType === "touch") return;

      const rect = card.getBoundingClientRect();

      const x = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2)
      );

      const y = Math.max(
        -1,
        Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2)
      );

      const distance = Math.hypot(x, y);

      if (distance < 0.01) {
        resetCard(card);
        return;
      }

      card.style.setProperty("--card-axis", `${-y} ${x} 0`);
      card.style.setProperty(
        "--card-angle",
        `${Math.min(distance, 1) * 5}deg`
      );
    });

    card.addEventListener("pointerleave", () => resetCard(card));
    card.addEventListener("pointercancel", () => resetCard(card));
  });

  function resetEffects() {
    hideGlow();
    cards.forEach(resetCard);
  }

  document.documentElement.addEventListener("pointerleave", hideGlow);
  window.addEventListener("blur", resetEffects);
  mouseMode.addEventListener("change", resetEffects);
  reducedMotion.addEventListener("change", resetEffects);
})();