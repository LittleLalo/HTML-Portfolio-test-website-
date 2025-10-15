// Coverflow carousel (like the video): center card front, sides angled back.
// Controls: arrows, keyboard, click side to focus, drag/swipe.

const stage = document.getElementById('stage');
const cards = Array.from(stage.querySelectorAll('.card'));
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');

let index = 0;               // active index
const gap = 220;             // horizontal spacing between slots (px)
const tilt = 45;             // side tilt (deg)
const depth = 140;           // how far back side cards go (px)
const scaleStep = 0.1;       // scale reduction per step away from center
const opacityStep = 0.18;    // opacity reduction per step away from center
const maxVisible = 3;        // how many steps to layout (each side)

// Layout at start
layout();
updateActive();

function layout(){
  // Center reference of the stage
  const rect = stage.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  cards.forEach((card, i) => {
    // relative position from active
    let d = i - index;
    // wrap shortest direction
    if (d > cards.length/2) d -= cards.length;
    if (d < -cards.length/2) d += cards.length;

    const ad = Math.abs(d);

    if (ad > maxVisible){
      // Park very far & hide (still slightly visible behind if needed)
      card.style.transform = `translate3d(${cx}px, ${cy}px, -800px)`;
      card.style.opacity = 0;
      card.style.pointerEvents = 'none';
      card.classList.remove('is-active');
      return;
    }

    const x = cx + d * gap;
    const z = -ad * depth + (ad === 0 ? 120 : 0); // center pops forward
    const ry = d === 0 ? 0 : (-Math.sign(d) * tilt);

    const s = 1 - ad * scaleStep;
    const op = Math.max(0.15, 1 - ad * opacityStep);

    card.style.transform =
      `translate3d(${x}px, ${cy}px, ${z}px) rotateY(${ry}deg) scale(${s})`;

    card.style.opacity = op;
    card.style.zIndex = 1000 - ad; // front layered

    const isActive = (ad === 0);
    card.classList.toggle('is-active', isActive);
    card.style.pointerEvents = isActive ? 'auto' : 'none';
  });
}

// Helpers
function mod(n, m){ return ((n % m) + m) % m; }
function next(){ index = mod(index + 1, cards.length); layout(); updateActive(); }
function prev(){ index = mod(index - 1, cards.length); layout(); updateActive(); }

function updateActive(){
  // update aria-labels if you want; visual state already handled by classes
}

// Click: side card brings itself to center
cards.forEach((card, i) => {
  card.addEventListener('click', (e) => {
    if (i === index) return; // already active; allow normal navigation
    e.preventDefault();      // prevent navigating when not active
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
  if (Math.abs(deltaX) > 40){
    if (deltaX < 0) next(); else prev();
  }
};

stage.addEventListener('mousedown', (e)=>dragStart(e.clientX));
window.addEventListener('mousemove', (e)=>dragMove(e.clientX));
window.addEventListener('mouseup', dragEnd);

stage.addEventListener('touchstart', (e)=>dragStart(e.touches[0].clientX), {passive:true});
stage.addEventListener('touchmove',  (e)=>dragMove(e.touches[0].clientX),  {passive:true});
stage.addEventListener('touchend', dragEnd);

// Re-center on resize
window.addEventListener('resize', layout);
