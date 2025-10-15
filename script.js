// Coverflow carousel: center card front, sides angled back & behind.
// Fix: precise centering using stage size and card size (no CSS 50/50).
// Includes arrows, keyboard, click-to-focus, and swipe/drag.

const stage = document.getElementById('stage');
const cards = Array.from(stage.querySelectorAll('.card'));
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');

let index = 0;               // active index

// Tunables
let gap = 220;               // horizontal spacing between slots (px)
let tilt = 45;               // side tilt (deg)
let depth = 140;             // Z depth for side cards (px)
let scaleStep = 0.1;         // scale reduction per step away
let opacityStep = 0.18;      // opacity reduction per step away
const maxVisible = 3;        // steps laid out per side

layout();

// Main layout pass
function layout(){
  const sw = stage.clientWidth;
  const sh = stage.clientHeight;

  cards.forEach((card, i) => {
    // Use actual card dimensions for accurate centering
    const cw = card.offsetWidth || 320;
    const ch = card.offsetHeight || 260;

    // Center (top-left) anchor for this card
    const centerX = (sw - cw) / 2;
    const centerY = (sh - ch) / 2;

    // relative index from active, wrapped shortest-path
    let d = i - index;
    if (d > cards.length/2) d -= cards.length;
    if (d < -cards.length/2) d += cards.length;

    const ad = Math.abs(d);

    if (ad > maxVisible){
      // park far back & hide
      card.style.transform = `translate3d(${centerX}px, ${centerY}px, -800px)`;
      card.style.opacity = 0;
      card.style.pointerEvents = 'none';
      card.classList.remove('is-active');
      return;
    }

    // position across X, centered vertically, with Z & rotation for coverflow
    const x  = centerX + d * gap;
    const z  = -ad * depth + (ad === 0 ? 140 : 0); // pop center forward
    const ry = d === 0 ? 0 : (-Math.sign(d) * tilt);
    const s  = 1 - ad * scaleStep;
    const op = Math.max(0.15, 1 - ad * opacityStep);

    card.style.transform = `translate3d(${x}px, ${centerY}px, ${z}px) rotateY(${ry}deg) scale(${s})`;
    card.style.opacity   = op;
    card.style.zIndex    = 1000 - ad;

    const isActive = (ad === 0);
    card.classList.toggle('is-active', isActive);
    card.style.pointerEvents = isActive ? 'auto' : 'none';
  });
}

function mod(n, m){ return ((n % m) + m) % m; }
function next(){ index = mod(index + 1, cards.length); layout(); }
function prev(){ index = mod(index - 1, cards.length); layout(); }

// Click side to focus (don’t navigate if not active)
cards.forEach((card, i) => {
  card.addEventListener('click', (e) => {
    if (i === index) return; // center card—follow link normally
    e.preventDefault();
    index = i;
    layout();
  });
});

// Buttons
btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

// Keyboard
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') next();
  else if (e.key === 'ArrowLeft') prev();
});

// Drag / swipe
let dragging = false, startX = 0, deltaX = 0;
const dragStart = (x) => { dragging = true; startX = x; deltaX = 0; };
const dragMove  = (x) => { if (!dragging) return; deltaX = x - startX; };
const dragEnd   = () => {
  if (!dragging) return;
  dragging = false;
  if (Math.abs(deltaX) > 40){ (deltaX < 0) ? next() : prev(); }
};

stage.addEventListener('mousedown', (e)=>dragStart(e.clientX));
window.addEventListener('mousemove', (e)=>dragMove(e.clientX));
window.addEventListener('mouseup', dragEnd);

stage.addEventListener('touchstart', (e)=>dragStart(e.touches[0].clientX), {passive:true});
stage.addEventListener('touchmove',  (e)=>dragMove(e.touches[0].clientX),  {passive:true});
stage.addEventListener('touchend', dragEnd);

// Responsive tweaks & re-center on resize
window.addEventListener('resize', () => {
  const small = stage.clientWidth < 640;
  gap   = small ? 180 : 220;
  depth = small ? 120 : 140;
  layout();
});
