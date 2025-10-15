// 3D Carousel: cards orbit around center
const carousel = document.getElementById('carousel');
const cards = Array.from(document.querySelectorAll('.card'));
const next = document.getElementById('next');
const prev = document.getElementById('prev');

const total = cards.length;
const step = 360 / total;
const radius = 420; // distance from center
let index = 0;

// Place cards around a circle
function layoutCards() {
  cards.forEach((card, i) => {
    const angle = i * step;
    card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    card.style.backfaceVisibility = 'hidden';
    card.style.transformStyle = 'preserve-3d';
  });
}

// Rotate carousel
function rotateCarousel() {
  carousel.style.transform = `translateZ(-${radius}px) rotateY(${-index * step}deg)`;
  cards.forEach((card, i) => {
    const rel = ((i - index) * step) % 360;
    const a = ((rel + 540) % 360) - 180;
    const z = Math.round(Math.cos((a * Math.PI) / 180) * 1000);
    card.style.zIndex = z;
    const isFront = Math.abs(a) < step / 2;
    card.classList.toggle('active', isFront);
    card.style.pointerEvents = isFront ? 'auto' : 'none';
  });
}

// Controls
function nextSlide() { index = (index + 1) % total; rotateCarousel(); }
function prevSlide() { index = (index - 1 + total) % total; rotateCarousel(); }

next.addEventListener('click', nextSlide);
prev.addEventListener('click', prevSlide);

// Init
layoutCards();
rotateCarousel();

