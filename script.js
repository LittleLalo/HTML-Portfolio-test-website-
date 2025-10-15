const carousel = document.getElementById('carousel');
const cards = document.querySelectorAll('.card');
const next = document.getElementById('next');
const prev = document.getElementById('prev');

let angle = 0;
const total = cards.length;
const step = 360 / total;

// Position each card around a circle
cards.forEach((card, i) => {
  const theta = (i * step) * (Math.PI / 180);
  const radius = 400;
  card.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
});

function rotateCarousel(direction) {
  angle += direction * step;
  carousel.style.transform = `translateZ(-400px) rotateY(${angle}deg)`;
}

next.addEventListener('click', () => rotateCarousel(-1));
prev.addEventListener('click', () => rotateCarousel(1));
