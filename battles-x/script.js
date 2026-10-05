// Dino Battles X – egg pick → hatch → maths beat-em-up
const MAX_HP = 5;
const $ = (id) => document.getElementById(id);
const eggScreen = $('eggScreen'), hatchScreen = $('hatchScreen'), fightScreen = $('fightScreen');
const choicesEl = $('choices'), question = $('question'), feedback = $('feedback');
const dialog = $('endDialog'), arena = $('arena');
const playerFighter = $('playerFighter'), oppFighter = $('oppFighter');
const powBurst = $('powBurst'), powText = $('powText');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const dinoTemplate = $('dinoSvgTemplate');

const DINO = {
  red:    { tint: 'tint-red',    label: 'Ruby Rex' },
  yellow: { tint: 'tint-yellow', label: 'Sunny Saur' },
  blue:   { tint: 'tint-blue',   label: 'Blue Spike' },
};
const RIVAL_TINTS = ['tint-rival', 'tint-rival-alt', 'tint-rival-green'];
const cheers = ['Pow! 💥', 'Nice hit!', 'Super punch!', 'You rock! 🌟', 'Brilliant!'];
const oops = ['Ouch! 😵', 'Missed – try again!', 'Ow! Keep going 🙂'];
const POW_WORDS = ['POW!', 'BAM!', 'WHAM!', 'BOOM!', 'ZAP!'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rand = () => Math.floor(Math.random() * 10) + 1;
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

let state, round = 0;

function makeDinoSvg(tintClass) {
  const node = dinoTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(tintClass);
  return node;
}

function placeDino(container, tintClass) {
  container.innerHTML = '';
  container.append(makeDinoSvg(tintClass));
}

function show(screen) {
  eggScreen.hidden = screen !== eggScreen;
  hatchScreen.hidden = screen !== hatchScreen;
  fightScreen.hidden = screen !== fightScreen;
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, reduceMotion.matches ? Math.min(ms, 80) : ms));
}

function flash(el, cls, ms = 500) {
  el.classList.remove('punch', 'take-hit');
  void el.offsetWidth;
  if (reduceMotion.matches) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}

function showPow() {
  powText.textContent = pick(POW_WORDS);
  powBurst.classList.remove('show');
  void powBurst.offsetWidth;
  if (reduceMotion.matches) {
    powBurst.classList.add('show');
    setTimeout(() => powBurst.classList.remove('show'), 400);
    return;
  }
  powBurst.classList.add('show');
  setTimeout(() => powBurst.classList.remove('show'), 700);
}

function updateHp() {
  const pPct = (state.playerHp / MAX_HP) * 100;
  const oPct = (state.oppHp / MAX_HP) * 100;
  $('playerHpFill').style.width = pPct + '%';
  $('oppHpFill').style.width = oPct + '%';
  $('playerHpNum').textContent = state.playerHp;
  $('oppHpNum').textContent = state.oppHp;
  $('playerHpBar').setAttribute('aria-valuenow', state.playerHp);
  $('oppHpBar').setAttribute('aria-valuenow', state.oppHp);
  arena.setAttribute(
    'aria-label',
    `You have ${state.playerHp} energy. Rival has ${state.oppHp} energy.`
  );
}

function distractors(ans) {
  const set = new Set();
  for (const d of shuffle([1, -1, 2, -2, 3, -3, 4, -4, 5, 10])) {
    const v = ans + d;
    if (v >= 2 && v <= 20 && v !== ans) set.add(v);
    if (set.size === 3) break;
  }
  while (set.size < 3) {
    const v = rand() + rand();
    if (v !== ans) set.add(v);
  }
  return [...set];
}

function newQuestion() {
  state.a = rand();
  state.b = rand();
  state.busy = false;
  question.dataset.round = ++round;
  const ans = state.a + state.b;
  question.textContent = `${state.a} + ${state.b}`;
  question.setAttribute('aria-label', `What is ${state.a} plus ${state.b}?`);
  choicesEl.innerHTML = '';
  shuffle([ans, ...distractors(ans)]).forEach((v, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bubble';
    b.dataset.value = v;
    b.innerHTML = `${v}<span class="key" aria-hidden="true">${i + 1}</span>`;
    b.setAttribute('aria-label', `Answer ${v} (key ${i + 1})`);
    choicesEl.append(b);
  });
  feedback.className = 'feedback';
  feedback.textContent = 'Pop the right bubble to punch!';
}

function end(won) {
  state.over = true;
  state.busy = true;
  $('endEmoji').textContent = won ? '🏆' : '💚';
  $('endTitle').textContent = won ? 'You won the battle!' : 'Nice try!';
  $('endText').textContent = won
    ? `You knocked out the rival with great maths! Amazing!`
    : `Don't worry – your dino just needs a rest. Want to battle again?`;
  setTimeout(() => dialog.showModal(), reduceMotion.matches ? 100 : 650);
}

function choose(btn) {
  if (state.over || state.busy || btn.disabled) return;
  const ans = state.a + state.b;
  if (Number(btn.dataset.value) === ans) {
    state.busy = true;
    btn.classList.add('pop');
    feedback.className = 'feedback good';
    feedback.textContent = `${pick(cheers)} ${state.a} + ${state.b} = ${ans}`;
    flash(playerFighter, 'punch');
    flash(oppFighter, 'take-hit');
    showPow();
    state.oppHp = Math.max(0, state.oppHp - 1);
    updateHp();
    if (state.oppHp <= 0) return end(true);
    setTimeout(newQuestion, reduceMotion.matches ? 120 : 850);
  } else {
    state.busy = true;
    btn.disabled = true;
    btn.setAttribute('aria-label', `${btn.dataset.value} – not this one`);
    feedback.className = 'feedback bad';
    feedback.textContent = pick(oops);
    flash(oppFighter, 'punch');
    flash(playerFighter, 'take-hit');
    showPow();
    if (!reduceMotion.matches) navigator.vibrate?.([40, 40, 40]);
    state.playerHp = Math.max(0, state.playerHp - 1);
    updateHp();
    if (state.playerHp <= 0) return end(false);
    setTimeout(newQuestion, reduceMotion.matches ? 120 : 850);
  }
}

async function hatch(color) {
  show(hatchScreen);
  const tint = $('hatchTint');
  const egg = $('hatchEgg');
  const baby = $('hatchBaby');
  const crack = $('crack');
  const msg = $('hatchMsg');
  const dino = DINO[color];

  tint.className = 'egg-tint ' + color;
  egg.hidden = false;
  egg.classList.remove('shake', 'crack-open');
  baby.hidden = true;
  crack.hidden = true;
  msg.textContent = 'Your egg is hatching…';

  void egg.offsetWidth;
  egg.classList.add('shake');
  await wait(1600);

  crack.hidden = false;
  egg.classList.add('crack-open');
  msg.textContent = 'Crack!';
  await wait(450);

  egg.hidden = true;
  baby.hidden = false;
  placeDino(baby, dino.tint);
  msg.textContent = `${dino.label} hatched! Let's battle!`;
  await wait(1200);

  startFight(color);
}

function startFight(color) {
  const dino = DINO[color];
  const rivalTint = pick(RIVAL_TINTS);
  state = {
    color,
    playerHp: MAX_HP,
    oppHp: MAX_HP,
    a: 0, b: 0,
    busy: false,
    over: false,
  };
  placeDino($('playerSprite'), dino.tint);
  $('playerName').textContent = dino.label;
  placeDino($('oppSprite'), rivalTint);
  updateHp();
  show(fightScreen);
  newQuestion();
}

function resetToEggs() {
  if (dialog.open) dialog.close();
  state = null;
  show(eggScreen);
}

// Events
document.querySelectorAll('.egg-btn').forEach((btn) => {
  btn.addEventListener('click', () => hatch(btn.dataset.color));
});
choicesEl.addEventListener('click', (e) => {
  const b = e.target.closest('.bubble');
  if (b) choose(b);
});
document.addEventListener('keydown', (e) => {
  if (dialog.open || fightScreen.hidden || !/^[1-4]$/.test(e.key)) return;
  const b = choicesEl.children[Number(e.key) - 1];
  if (b) choose(b);
});
$('restartBtn').addEventListener('click', () => {
  dialog.close();
  resetToEggs();
});

show(eggScreen);
