/* =====================================================
   PART A. THE MATHS  (same idea as the Python version)
   ===================================================== */

// Turn whatever was typed into a number (blank or negative becomes 0)
function num(value) {
  const x = parseFloat(value);
  return x > 0 ? x : 0;
}

// Round to 2 decimals (paise)
function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

// Task function 1: tip amount from a percentage
function calculateTip(bill, tipPercent) {
  return bill * tipPercent / 100;
}

// Task function 2: split a total evenly
function splitBill(total, people) {
  return total / people;
}

// Equal split: also works out the leftover paise
function computeEqual(bill, tax, tipPercent, people) {
  if (bill <= 0) return null;
  people = Math.max(1, Math.floor(people) || 1);
  const tip = round2(calculateTip(bill, tipPercent));
  const total = round2(bill + tax + tip);
  const totalPaise = Math.round(total * 100);
  const basePaise = Math.floor(splitBill(totalPaise, people));
  const extraPeople = totalPaise - basePaise * people;   // these people pay 1 paisa more
  return { bill, tax, tipPercent, tip, total, people, base: basePaise / 100, high: (basePaise + 1) / 100, extraPeople };
}

// Order split: tax, tip and discount are shared in the ratio of each person's order
function computeOrder(friends, shared, taxIsListed, listedTax, discount, finalTotal, tipPercent) {
  const n = friends.length;
  // shared items are split equally and added to each person's order
  const orders = friends.map(f => f.amount + (n ? shared / n : 0));
  const subtotal = orders.reduce((a, b) => a + b, 0);
  if (subtotal <= 0) return null;

  let tax, notes = [];
  if (taxIsListed) {
    tax = listedTax;
  } else if (finalTotal <= 0) {
    tax = 0;
    notes.push({ kind: 'warn', text: 'Drop the final total from the bill and we will find the tax, bet.' });
  } else {
    tax = round2(finalTotal - subtotal);               // the "hidden" tax
    if (tax < 0) {
      notes.push({ kind: 'warn', text: 'The bill total is ' + money(-tax) + ' less than the food. Looks like a discount, so we are sharing the W fairly.' });
    } else {
      notes.push({ kind: 'ok', text: 'Tax found: ' + money(tax) + ' (about ' + (tax / subtotal * 100).toFixed(1) + '% of the food). Caught it, no cap.' });
    }
  }
  if (!taxIsListed) discount = 0;                      // discount is only used when tax is listed

  const tip = round2(calculateTip(subtotal, tipPercent));
  const extra = tax + tip - discount;                  // everything on top of the orders
  const grandTotal = round2(subtotal + extra);

  // each person's share = their order + their ratio of the extra
  let owes = orders.map(o => round2(o + extra * (o / subtotal)));

  // make sure rounded shares add up to the bill exactly
  const diff = round2(grandTotal - owes.reduce((a, b) => a + b, 0));
  if (diff !== 0) {
    let biggest = 0;
    owes.forEach((v, i) => { if (v > owes[biggest]) biggest = i; });
    owes[biggest] = round2(owes[biggest] + diff);
  }

  const people = friends.map((f, i) => ({
    name: f.name,
    order: orders[i],
    tax: tax * orders[i] / subtotal,
    tip: tip * orders[i] / subtotal,
    owes: owes[i]
  }));
  return { subtotal, tax, tip, tipPercent, discount, grandTotal, people, notes };
}

/* =====================================================
   PART B. LITTLE HELPERS
   ===================================================== */
const nf = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function money(n) { return (n < 0 ? '−₹' : '₹') + nf.format(Math.abs(n)); }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function $(id) { return document.getElementById(id); }

/* =====================================================
   PART C. CUTE FRIEND STICKERS (drawn with SVG)
   ===================================================== */
const FACE_COLORS = ['#FFD6E0', '#FFE9A8', '#C9F0DD', '#CDE6FF', '#E5D4FF', '#FFD9B8'];

function avatar(i) {
  const type = i % 6;
  const fill = FACE_COLORS[i % FACE_COLORS.length];
  const ink = '#3B2F4A';

  // 6 different "ears / hats": cat, bear, bunny, sprout, party hat, heart
  const top = [
    '<path d="M18 44 L22 8 L46 26 Z"/><path d="M82 44 L78 8 L54 26 Z"/>',
    '<circle cx="22" cy="26" r="13"/><circle cx="78" cy="26" r="13"/>',
    '<ellipse cx="34" cy="16" rx="9" ry="20"/><ellipse cx="66" cy="16" rx="9" ry="20"/>',
    '<path d="M50 26 C46 8 62 0 74 6 C70 20 60 26 50 26 Z" fill="#8BE0BE"/>',
    '<path d="M50 4 L30 32 L70 32 Z" fill="#FFD866"/><circle cx="50" cy="5" r="5" fill="#FF9DBB"/>',
    '<path d="M50 30 C40 8 20 18 32 32 L50 42 L68 32 C80 18 60 8 50 30 Z" fill="#FF9DBB"/>'
  ][type];

  const eyes = (type % 2 === 0)
    ? '<circle cx="38" cy="58" r="4" fill="' + ink + '" stroke="none"/><circle cx="62" cy="58" r="4" fill="' + ink + '" stroke="none"/>'
    : '<path d="M32 60 Q38 51 44 60" fill="none"/><path d="M56 60 Q62 51 68 60" fill="none"/>';

  const mouth = (type < 3)
    ? '<path d="M41 70 Q50 80 59 70" fill="none"/>'
    : '<path d="M41 69 Q50 86 59 69 Z" fill="#FF8FA8"/>';

  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<g stroke="' + ink + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" fill="' + fill + '">' +
      top +
      '<circle cx="50" cy="62" r="33"/>' +
      '<ellipse cx="27" cy="68" rx="6" ry="4" fill="#FF9DB5" stroke="none" opacity=".75"/>' +
      '<ellipse cx="73" cy="68" rx="6" ry="4" fill="#FF9DB5" stroke="none" opacity=".75"/>' +
      eyes + mouth +
    '</g></svg>';
}

// Floating emoji stickers in the background: [emoji, left%, top%, rotation, size]
const BG = [
  ['🍕', 4, 10, -14, 46], ['🍔', 90, 7, 12, 44], ['🧋', 3, 44, 10, 50], ['🍟', 92, 38, -10, 46],
  ['🍩', 6, 78, -8, 44],  ['⭐', 88, 72, 14, 36], ['💖', 47, 2, -10, 34], ['🍜', 93, 90, 8, 46],
  ['✨', 24, 92, 12, 30], ['🎀', 68, 94, -12, 34], ['🥤', 16, 24, 8, 36], ['🍦', 80, 56, -6, 38]
];
BG.forEach(([emoji, x, y, r, s]) => {
  const el = document.createElement('span');
  el.className = 'bg-sticker';
  el.textContent = emoji;
  el.style.setProperty('--x', x + '%');
  el.style.setProperty('--y', y + '%');
  el.style.setProperty('--r', r + 'deg');
  el.style.setProperty('--s', s + 'px');
  el.style.animationDelay = (-Math.random() * 6) + 's';
  $('stickers').appendChild(el);
});

/* =====================================================
   PART D. THE LIST OF FRIENDS
   ===================================================== */
function addRow(name, amount) {
  const row = document.createElement('div');
  row.className = 'person-row';
  row.innerHTML =
    '<div class="row-av"></div>' +
    '<input type="text" class="p-name" placeholder="Bestie name" aria-label="Friend name" value="' + esc(name) + '">' +
    '<span class="with-prefix"><b>₹</b><input type="number" class="p-amount" min="0" step="any" inputmode="decimal" aria-label="Order amount" value="' + amount + '"></span>' +
    '<button class="x" type="button" aria-label="Remove friend">×</button>';
  $('rows').appendChild(row);
  refreshRows();
  return row;
}

// give every row its sticker + disable "remove" if only one row is left
function refreshRows() {
  const rows = document.querySelectorAll('.person-row');
  rows.forEach((row, i) => {
    row.querySelector('.row-av').innerHTML = avatar(i);
    row.querySelector('.x').disabled = rows.length === 1;
  });
}

function readFriends() {
  return Array.from(document.querySelectorAll('.person-row')).map((row, i) => ({
    name: row.querySelector('.p-name').value.trim() || 'Bestie ' + (i + 1),
    amount: num(row.querySelector('.p-amount').value)
  }));
}

$('rows').addEventListener('click', e => {
  const btn = e.target.closest('.x');
  if (!btn || btn.disabled) return;
  btn.closest('.person-row').remove();
  refreshRows();
  update();
});

$('add-row').addEventListener('click', () => {
  const row = addRow('', '');
  row.querySelector('.p-name').focus();
  update();
});

/* =====================================================
   PART E. SHOWING THE RESULT
   ===================================================== */
let mode = 'order';

function buildSummary(r) {
  if (mode === 'equal') {
    return 'The damage: bill ' + money(r.bill) + ' + tax ' + money(r.tax) + ' + tip ' + money(r.tip) + ' = ' + money(r.total) + '\n' +
      (r.extraPeople ? r.extraPeople + ' pay ' + money(r.high) + ', the rest pay ' + money(r.base) : 'Each of the ' + r.people + ' besties pays ' + money(r.base));
  }
  let t = 'The damage: ' + money(r.grandTotal) + ' (food ' + money(r.subtotal) + ', tax ' + money(r.tax) + ', tip ' + money(r.tip) + ')\n';
  r.people.forEach(p => { t += p.name + ': ' + money(p.owes) + '\n'; });
  return t.trim();
}

function copyText(text, statusEl) {
  function legacy() {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) {}
    ta.remove();
    statusEl.textContent = ok ? 'Copied, bet!' : 'Copy failed, that is cooked. Try again?';
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => { statusEl.textContent = 'Copied, bet!'; }, legacy);
  } else {
    legacy();
  }
}

function update() {
  const out = $('result');
  let r, html;

  if (mode === 'equal') {
    r = computeEqual(num($('eq-bill').value), num($('eq-tax').value), num($('eq-tip').value), num($('eq-people').value));
    if (!r) { out.innerHTML = '<p class="empty">Drop the bill amount and let us cook 🍳</p>'; return; }

    const shown = Math.min(r.people, 10);
    let faces = '';
    for (let i = 0; i < shown; i++) {
      const pays = i < r.extraPeople ? r.high : r.base;
      faces += '<div class="person" style="--bg:' + FACE_COLORS[i % 6] + '; --tilt:' + (i % 2 ? 1.5 : -1.5) + 'deg">' +
        '<div class="av">' + avatar(i) + '</div><div class="powes">' + money(pays) + '</div></div>';
    }
    html =
      '<div class="big-total"><small>each bestie pays</small><div class="amount">' + money(r.extraPeople ? r.high : r.base) + '</div></div>' +
      '<div class="pills"><span class="pill">bill ' + money(r.bill) + '</span><span class="pill">tax ' + money(r.tax) + '</span>' +
      '<span class="pill">tip ' + money(r.tip) + '</span><span class="pill">total ' + money(r.total) + '</span></div>' +
      (r.extraPeople ? '<p class="note">Does not split perfectly in paise, so ' + r.extraPeople + ' of you pay 1 paisa extra. Still adds up to the bill, we ate.</p>' : '') +
      '<div class="people top-gap">' + faces + '</div>' +
      (r.people > shown ? '<p class="hint" style="text-align:center">...and ' + (r.people - shown) + ' more besties pay the same</p>' : '');
  } else {
    const taxIsListed = document.querySelector('input[name="taxmode"]:checked').value === 'known';
    r = computeOrder(readFriends(), num($('o-shared').value), taxIsListed, num($('o-tax').value),
                     num($('o-discount').value), num($('o-total').value), num($('o-tip').value));
    if (!r) { out.innerHTML = '<p class="empty">Add what everyone ate and let us cook 🍳</p>'; return; }

    const notes = r.notes.map(n => '<p class="note ' + (n.kind === 'ok' ? 'ok' : '') + '">' + esc(n.text) + '</p>').join('');
    const cards = r.people.map((p, i) =>
      '<div class="person" style="--bg:' + FACE_COLORS[i % 6] + '; --tilt:' + (i % 2 ? 1.5 : -1.5) + 'deg">' +
        '<div class="av">' + avatar(i) + '</div>' +
        '<div class="pname">' + esc(p.name) + '</div>' +
        '<div class="powes">' + money(p.owes) + '</div>' +
        '<div class="pbreak">plate ' + money(p.order) + '<br>+ tax ' + money(p.tax) + ' + tip ' + money(p.tip) + '</div>' +
        '<div class="pbar"><i style="width:' + (p.owes / r.grandTotal * 100).toFixed(1) + '%"></i></div>' +
      '</div>').join('');
    const sum = r.people.reduce((a, p) => a + p.owes, 0);

    html =
      '<div class="big-total"><small>the whole damage</small><div class="amount">' + money(r.grandTotal) + '</div></div>' +
      '<div class="pills"><span class="pill">food ' + money(r.subtotal) + '</span><span class="pill">tax ' + money(r.tax) + '</span>' +
      '<span class="pill">tip ' + money(r.tip) + '</span>' + (r.discount > 0 ? '<span class="pill">discount −' + money(r.discount) + '</span>' : '') + '</div>' +
      notes +
      '<div class="people top-gap">' + cards + '</div>' +
      '<hr class="dash"><p class="hint" style="text-align:center">Shares add up to ' + money(sum) + ' ✓ no cap, the maths is mathing</p>';
  }

  out.innerHTML = html +
    '<div class="actions"><button class="btn" type="button" id="copy">Copy the receipts</button><span class="status" id="status"></span></div>';
  $('copy').onclick = () => copyText(buildSummary(r), $('status'));
}

/* =====================================================
   PART F. WIRING EVERYTHING UP
   ===================================================== */
// any typing anywhere updates the result
document.addEventListener('input', update);

// tabs
function setMode(m) {
  mode = m;
  $('tab-order').setAttribute('aria-selected', m === 'order');
  $('tab-equal').setAttribute('aria-selected', m === 'equal');
  $('form-order').hidden = m !== 'order';
  $('form-equal').hidden = m !== 'equal';
  update();
}
$('tab-order').addEventListener('click', () => setMode('order'));
$('tab-equal').addEventListener('click', () => setMode('equal'));

// tax: listed or only final total
document.querySelectorAll('input[name="taxmode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const listed = document.querySelector('input[name="taxmode"]:checked').value === 'known';
    $('tax-known').hidden = !listed;
    $('tax-auto').hidden = listed;
    update();
  });
});

// tip buttons
document.querySelectorAll('.chips').forEach(group => {
  group.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $(group.dataset.tip).value = chip.dataset.v;
    update();
  });
});

// start with example friends
addRow('Asha', 200);
addRow('Ravi', 500);
addRow('Meera', 300);
$('form-equal').hidden = true;
update();

// phone: "see the damage" button scrolls down to the result, and hides once the result is on screen
(function () {
  const jump = $('jump');
  const results = $('results');
  jump.addEventListener('click', () => results.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      jump.classList.toggle('hide', entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(results);
  }
})();