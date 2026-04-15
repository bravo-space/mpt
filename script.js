const BASEDBOT_REFERRAL_URL = "https://t.me/based_eth_bot?start=r_bonustraders";

document.documentElement.classList.add("js");

document.querySelectorAll("[data-ref-link]").forEach((link) => {
  link.href = BASEDBOT_REFERRAL_URL;
  link.rel = "sponsored noopener";
  link.target = "_blank";
});

const revealElements = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const setScrollProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll <= 0 ? 0 : (window.scrollY / maxScroll) * 100;
  document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
};

window.addEventListener("scroll", setScrollProgress, { passive: true });
setScrollProgress();

const canvas = document.getElementById("heroCanvas");
const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let particles = [];
let animationFrame = 0;

const colors = ["#7dff68", "#46f4d5", "#ff6f61", "#ff5ea8", "#ffe04f"];

function resizeCanvas() {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
  canvas.height = Math.max(1, Math.floor(rect.height * pixelRatio));
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = Math.max(28, Math.min(72, Math.floor(rect.width / 18)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: Math.random() * 1.8 + 0.8,
    color: colors[index % colors.length],
  }));
}

function drawChartLine(width, height, time) {
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.globalAlpha = 0.46;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#7dff68";
  ctx.beginPath();

  const baseline = height * 0.6;
  for (let x = 0; x <= width; x += 18) {
    const wave = Math.sin(x * 0.025 + time * 0.015) * 26;
    const pulse = Math.cos(x * 0.052 + time * 0.01) * 12;
    const y = baseline + wave + pulse - x * 0.07;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.restore();
}

function render(time = 0) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);
  drawChartLine(width, height, time);

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 120) {
        ctx.globalAlpha = (1 - distance / 120) * 0.22;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 0.88;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;

  if (!mediaQuery.matches) {
    animationFrame = requestAnimationFrame(render);
  }
}

if (canvas) {
  resizeCanvas();
  render();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    render();
  });
}
