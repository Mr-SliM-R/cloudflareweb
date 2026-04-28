/* Mobile navigation */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("show");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("show");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* Active navigation link while scrolling */
const sections = document.querySelectorAll("main section[id]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navItems.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);

sections.forEach((section) => observer.observe(section));

/* Contact form validation and demo submission */
const contactForm = document.querySelector("#contactForm");
const formSuccess = document.querySelector("#formSuccess");

function showError(field, message) {
  const row = field.closest(".form-row");
  const error = row.querySelector(".error-message");

  row.classList.add("error");
  error.textContent = message;
}

function clearError(field) {
  const row = field.closest(".form-row");
  const error = row.querySelector(".error-message");

  row.classList.remove("error");
  error.textContent = "";
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formSuccess.textContent = "";

  const fields = [...contactForm.querySelectorAll("input, select, textarea")];
  let isValid = true;

  fields.forEach((field) => {
    const value = field.value.trim();
    clearError(field);

    if (!value) {
      showError(field, "This field is required.");
      isValid = false;
      return;
    }

    if (field.type === "email" && !validateEmail(value)) {
      showError(field, "Enter a valid email address.");
      isValid = false;
    }
  });

  if (!isValid) {
    return;
  }

  formSuccess.textContent = "Thanks. Your demo request is ready to be connected to a backend later.";
  contactForm.reset();
});

contactForm.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => clearError(field));
});

/* Animated cybersecurity canvas used as a local visual asset */
const canvas = document.querySelector("#securityCanvas");
const context = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let nodes = [];
let animationFrameId;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createNodes() {
  const rect = canvas.getBoundingClientRect();
  const count = rect.width < 500 ? 18 : 28;

  nodes = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    radius: index % 5 === 0 ? 5 : 3,
    speedX: (Math.random() - 0.5) * 0.45,
    speedY: (Math.random() - 0.5) * 0.45
  }));
}

function drawShield(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const shieldWidth = Math.min(width, height) * 0.28;
  const shieldHeight = shieldWidth * 1.2;

  context.save();
  context.beginPath();
  context.moveTo(centerX, centerY - shieldHeight / 2);
  context.lineTo(centerX + shieldWidth / 2, centerY - shieldHeight / 3);
  context.lineTo(centerX + shieldWidth / 2.4, centerY + shieldHeight / 5);
  context.quadraticCurveTo(centerX, centerY + shieldHeight / 2, centerX - shieldWidth / 2.4, centerY + shieldHeight / 5);
  context.lineTo(centerX - shieldWidth / 2, centerY - shieldHeight / 3);
  context.closePath();
  context.fillStyle = "rgba(15, 118, 110, 0.12)";
  context.strokeStyle = "rgba(15, 118, 110, 0.75)";
  context.lineWidth = 2;
  context.fill();
  context.stroke();

  context.beginPath();
  context.arc(centerX, centerY - 6, shieldWidth * 0.16, 0, Math.PI * 2);
  context.strokeStyle = "rgba(245, 158, 11, 0.86)";
  context.stroke();

  context.beginPath();
  context.moveTo(centerX, centerY + shieldWidth * 0.08);
  context.lineTo(centerX, centerY + shieldWidth * 0.24);
  context.stroke();
  context.restore();
}

function drawNetwork() {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(15, 118, 110, 0.08)");
  gradient.addColorStop(1, "rgba(245, 158, 11, 0.08)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  drawShield(width, height);

  nodes.forEach((node, index) => {
    if (!reduceMotion) {
      node.x += node.speedX;
      node.y += node.speedY;
    }

    if (node.x < 0 || node.x > width) {
      node.speedX *= -1;
    }

    if (node.y < 0 || node.y > height) {
      node.speedY *= -1;
    }

    for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
      const nextNode = nodes[nextIndex];
      const distance = Math.hypot(node.x - nextNode.x, node.y - nextNode.y);

      if (distance < 140) {
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(nextNode.x, nextNode.y);
        context.strokeStyle = `rgba(15, 118, 110, ${1 - distance / 140})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }

    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    context.fillStyle = index % 5 === 0 ? "#f59e0b" : "#0f766e";
    context.fill();
  });

  if (!reduceMotion) {
    animationFrameId = requestAnimationFrame(drawNetwork);
  }
}

function startCanvas() {
  resizeCanvas();
  createNodes();
  drawNetwork();
}

window.addEventListener("resize", () => {
  cancelAnimationFrame(animationFrameId);
  resizeCanvas();
  createNodes();
  drawNetwork();
});

startCanvas();
