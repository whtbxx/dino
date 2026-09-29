// Dino Dash Bubbles – side-view race (A) + multiple-choice bubbles (C).
const FINISH = 12;         // steps to the finish line
const PLAYER_START = 4;    // head start: 4 misses needed to be caught, but a question only has 3 wrong bubbles
const MAX_GAP = 6;         // dino keeps pace – you can't get more than 6 steps ahead
const STREAK_FOR_BOOST = 3;
const $ = (id) => document.getElementById(id);
const app = $('app'), track = $('track'), choicesEl = $('choices'), question = $('question'),
  feedback = $('feedback'), gapEl = $('gapReadout'), dialog = $('endDialog');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const cheers = ['Awesome!', 'Zoom! 💨', 'Super speedy!', 'You rock! 🌟', 'Brilliant!'];
const oops = ['Stomp! Try another bubble 🦖', 'Oops! Pick again 🙂', 'Not that one – have another go!'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rand = () => Math.floor(Math.random() * 10) + 1;
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

let state, round = 0;

function newGame() {
  state = { player: PLAYER_START, dino: 0, streak: 0, correct: 0, incorrect: 0, a: 0, b: 0, busy: false, over: false };
  render(); newQuestion();
}

function distractors(ans) {
  const set = new Set();
  for (const d of shuffle([1, -1, 2, -2, 3, -3, 10, -10])) {
    const v = ans + d;
    if (v >= 2 && v <= 20) set.add(v);
    if (set.size === 3) break;
  }
  return [...set];
}

function newQuestion() {
  state.a = rand(); state.b = rand(); state.busy = false;
  question.dataset.round = ++round; // lets tests detect a fresh question
  const ans = state.a + state.b;
  question.textContent = `${state.a} + ${state.b}`;
  question.setAttribute('aria-label', `What is ${state.a} plus ${state.b}?`);
  choicesEl.innerHTML = '';
  shuffle([ans, ...distractors(ans)]).forEach((v, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'bubble'; b.dataset.value = v;
    b.innerHTML = `${v}<span class="key" aria-hidden="true">${i + 1}</span>`;
    b.setAttribute('aria-label', `Answer ${v} (key ${i + 1})`);
    choicesEl.append(b);
  });
  feedback.className = 'feedback'; feedback.textContent = 'Pop the right bubble!';
}

function render() {
  track.style.setProperty('--pos-player', Math.min(state.player, FINISH) / FINISH);
  track.style.setProperty('--pos-dino', state.dino / FINISH);
  track.dataset.player = state.player; track.dataset.dino = state.dino;
  const gap = state.player - state.dino, toGo = Math.max(FINISH - state.player, 0);
  gapEl.textContent = gap <= 1 ? '⚠️ The dino is right behind you!' : `Dino is ${gap} steps behind · ${toGo} to the finish`;
  gapEl.classList.toggle('danger', gap <= 1);
  track.setAttribute('aria-label', `You are ${toGo} steps from the finish. The dino is ${gap} step${gap === 1 ? '' : 's'} behind you.`);
  $('correctCount').textContent = state.correct; $('incorrectCount').textContent = state.incorrect;
  const hot = state.streak >= STREAK_FOR_BOOST;
  $('flames').textContent = '🔥'.repeat(Math.min(state.streak, 5));
  $('streakText').textContent = hot ? 'Turbo! +2 steps' : state.streak > 0 ? `${STREAK_FOR_BOOST - state.streak} more for turbo` : '3 in a row = turbo!';
  $('streak').classList.toggle('hot', hot);
}

function flash(el, cls) {
  if (reduceMotion.matches) return;
  el.classList.remove('boost', 'turbo', 'stomp'); void el.offsetWidth; el.classList.add(cls);
}

function choose(btn) {
  if (state.over || state.busy || btn.disabled) return;
  const ans = state.a + state.b;
  if (Number(btn.dataset.value) === ans) {
    state.busy = true; state.correct++; state.streak++;
    const turbo = state.streak >= STREAK_FOR_BOOST;
    const gain = turbo ? 2 : 1;
    state.player += gain;
    state.dino = Math.max(state.dino, state.player - MAX_GAP);
    btn.classList.add('pop');
    feedback.className = 'feedback good';
    feedback.textContent = `${pick(cheers)} ${state.a} + ${state.b} = ${ans}${turbo ? ' 🔥 Turbo +2!' : ''}`;
    flash(track, turbo ? 'turbo' : 'boost'); render();
    if (state.player >= FINISH) return end(true);
    setTimeout(newQuestion, 850);
  } else {
    state.incorrect++; state.streak = 0; state.dino++;
    btn.disabled = true;
    btn.setAttribute('aria-label', `${btn.dataset.value} – not this one`);
    feedback.className = 'feedback bad'; feedback.textContent = pick(oops);
    flash(track, 'stomp'); render();
    if (!reduceMotion.matches) navigator.vibrate?.([40, 40, 40]);
    if (state.dino >= state.player) return end(false);
  }
}

function end(won) {
  state.over = true;
  $('endEmoji').textContent = won ? '🏆' : '🦖💚';
  $('endTitle').textContent = won ? 'You won the race!' : 'The dino caught you!';
  $('endText').textContent = won
    ? `You beat the dino with ${state.correct} correct answers. Amazing maths!`
    : `Don't worry – he just wanted a hug! You got ${state.correct} right. Want to race again?`;
  setTimeout(() => dialog.showModal(), 650);
}

choicesEl.addEventListener('click', (e) => { const b = e.target.closest('.bubble'); if (b) choose(b); });
document.addEventListener('keydown', (e) => {   // keys 1–4 pick bubbles on desktop
  if (dialog.open || !/^[1-4]$/.test(e.key)) return;
  const b = choicesEl.children[Number(e.key) - 1]; if (b) choose(b);
});
$('restartBtn').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { if (state.over) newGame(); });

newGame();
