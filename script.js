// 3D Carousel: cards orbit around center
const carousel = document.getElementById('carousel');
const cards = Array.from(document.querySelectorAll('.card'));
const next = document.getElementById('next');
const prev = document.getElementById('prev');

const total = cards.length;
const step = 360 / total;
const radius = 420; // distance from center

let index = 0; // which face is front

// Place cards around a circle in 3D
function layoutCards() {
  cards.forEach((card, i) => {
    const angle = i * step;
    card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    card.style.backfaceVisibility = 'hidden';
    card.style.transformStyle = 'preserve-3d';
  });
}

// Rotate the whole ring and set front/behind states
function rotateCarousel() {
  carousel.style.transform = `translateZ(-${radius}px) rotateY(${-index * step}deg)`;

  // Depth layering + active card
  cards.forEach((card, i) => {
    // relative angle of this card to the front face
    const rel = ((i - index) * step) % 360;
    const a = ((rel + 540) % 360) - 180; // map to [-180,180]

    // Front-most gets highest zIndex
    const z = Math.round(Math.cos((a * Math.PI) / 180) * 1000);
    card.style.zIndex = z;

    const isFront = Math.abs(a) < step / 2;
    card.classList.toggle('active', isFront);

    // Optional: only the front is clickable
    card.style.pointerEvents = isFront ? 'auto' : 'none';
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
