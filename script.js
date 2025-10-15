// 3D Carousel with front "pop" so the active card sits clearly in front
const carousel = document.getElementById('carousel');
const cards = Array.from(document.querySelectorAll('.card'));
const next = document.getElementById('next');
const prev = document.getElementById('prev');

const total = cards.length;
const step = 360 / total;

// Base distance from center to ring; frontBoost brings the active card closer to the viewer
const radius = 360;
const frontBoost = 90; // how much the active card pops forward (px)

let index = 0;

// Place cards around a circle, using a CSS var to allow a per-card Z boost
function layoutCards() {
  cards.forEach((card, i) => {
    const angle = i * step;
    // Important: we apply two translateZs so we can boost the active card without
    // rewriting the rotation math each time.
    card.style.transform =
      `rotateY(${angle}deg) translateZ(${radius}px) translateZ(var(--zboost, 0px))`;
    card.style.backfaceVisibility = 'hidden';
    card.style.transformStyle = 'preserve-3d';
    card.style.setProperty('--zboost', '0px');
  });
}

// Rotate the ring and pop the active card forward
function rotateCarousel() {
  // Pull the ring slightly back so non-active cards sit behind center,
  // while the active one (with zboost) comes to the front.
  carousel.style.transform =
    `translateZ(-${radius - Math.min(frontBoost * 0.7, radius - 60)}px) rotateY(${-index * step}deg)`;

  cards.forEach((card, i) => {
    // Angle of this card relative to the front
    const rel = ((i - index) * step) % 360;
    const a = ((rel + 540) % 360) - 180; // [-180, 180]

    // Depth layering via zIndex
    const z = Math.round(Math.cos((a * Math.PI) / 180) * 1000);
    card.style.zIndex = z;

    // Active state
    const isFront = Math.abs(a) < step / 2;
    card.classList.toggle('active', isFront);

    // Only front card clickable
    card.style.pointerEvents = isFront ? 'auto' : 'none';

    // Pop the active card forward (adds to the existing translateZ via CSS var)
    card.style.setProperty('--zboost', isFront ? `${frontBoost}px` : '0px');
  });
}

function nextSlide() {
  index = (index + 1) % total;
  rotateCarousel();
}
function prevSlide() {
  index = (index - 1 + total) % total;
  rotateCarousel();
}

next.addEventListener('click', nextSlide);
prev.addEventListener('click', prevSlide);

// Init
layoutCards();
rotateCarousel();


