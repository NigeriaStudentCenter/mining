'use strict';
// Pages added for the hosted, paid course: My access, locked-content panels, the paid enrichment
// pages (Nigeria in focus, Career launch) and the public Simulation & VR plan.
const ACCESS = () => window.MINING_ACCESS;
const xesc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const pathName = id => (PATHS.find(p => p.id === id) || {}).name || id;

function enrolButtons() {
 return `<div class="actions"><a class="button gold" data-link="payFull" href="#account">Pay ₦60,000 in full</a><a class="button light" data-link="payInstalment" href="#account">Pay first instalment (₦20,000)</a></div>
<ol class="small"><li>Pay securely with Paystack (card, bank transfer or USSD).</li><li>Complete the short <a data-link="enrolForm" href="#account">enrolment form</a> that opens after payment.</li><li>Come back here and sign in with <strong>the email you paid with</strong> and your <strong>Paystack payment reference</strong> (it is in your Paystack receipt email).</li></ol><p class="small">See how we use your data in the <a href="privacy.html">course privacy notice</a>.</p>`;
}

function accessSummary() {
 const A = ACCESS(), t = A.tier(), s = A.spec();
 const rows = [
  ['AI Foundation in Mining (F1–F5), Nigeria in focus, Career launch, AI tutor', t >= 1],
  ['Your specialist pathway' + (s ? ': ' + pathName(s) : ''), t >= 2 && !!s],
  ['Final projects and reviewed portfolio', t >= 3]
 ];
 return `<ul class="access-list">${rows.map(([label, ok]) => `<li class="${ok ? 'ok' : 'no'}"><span aria-hidden="true">${ok ? '✓' : '○'}</span> ${label}</li>`).join('')}</ul>`;
}

function accountPage() {
 nav('account');
 const A = ACCESS();
 if (!A) return '<h1>My access</h1><p>Course sign-in is not available on this copy of the course.</p>';
 if (!A.signedIn()) {
  return `<p class="eyebrow">ENROLLED LEARNERS</p><h1>Sign in to your course.</h1><p class="intro">Use the email address you paid with and the payment reference from your Paystack receipt. Your access is checked with Paystack automatically.</p>
<div class="grid two"><form class="card" id="access-form" novalidate><h2>I have paid</h2><label for="acc-email">Email you paid with<input id="acc-email" name="email" type="email" autocomplete="email" required></label><label for="acc-ref">Paystack payment reference<input id="acc-ref" name="reference" type="text" autocomplete="off" placeholder="e.g. T123456789012345" required></label><button type="submit" class="gold">Sign in to my course →</button><p id="access-message" class="small" role="status"></p><p class="small muted">Paid in instalments? Any one of your references works; all your payments to this course are counted.</p></form>
<section class="card"><h2>Not enrolled yet?</h2><p>AI Foundation in Mining + one specialist pathway + a reviewed portfolio project: <strong>₦60,000</strong>, or 3 instalments of ₦20,000.</p>${enrolButtons()}<p class="small muted">Instalments unlock in stages: the 1st opens the Foundation, the 2nd your specialism, the 3rd the final project.</p></section></div>`;
 }
 const t = A.tier(), s = A.spec(), c = A.claims();
 const choose = t >= 2 && !s ? `<section class="card" style="margin-top:22px"><h2>Choose your specialist pathway</h2><p>Your payments include one specialism. Choose carefully: it can only be changed by contacting BSOE.</p><div class="grid two">${PATHS.slice(1).map(p => `<article class="card"><h3>${p.name}</h3><p class="small">${p.desc}</p><button data-access="spec" data-spec="${p.id}" data-name="${xesc(p.name)}">Choose ${p.short} →</button></article>`).join('')}</div></section>` : '';
 const next = t < 3 ? `<section class="card" style="margin-top:22px"><h2>Unlock the next stage</h2><p>${t === 1 ? 'Your 2nd instalment opens your specialist pathway.' : 'Your 3rd instalment opens the final projects and reviewed portfolio.'} After paying, press <em>Check for new payments</em>.</p><div class="actions"><a class="button gold" data-link="payInstalment" href="#account">Pay next instalment (₦20,000)</a><button class="light" data-access="refresh">Check for new payments</button></div></section>` : '';
 return `<p class="eyebrow">MY ACCESS</p><h1>Welcome back.</h1><p class="intro">Signed in as ${xesc(c.m || 'enrolled learner')}. ${A.loadingNow() ? 'Loading your course…' : A.lastError() ? xesc(A.lastError()) : ''}</p>
<section class="card"><h2>What you can open</h2>${accessSummary()}<div class="actions"><a class="button gold" href="#home">Go to my learning →</a><button class="light" data-access="refresh">Check for new payments</button><button class="light" data-access="signout">Sign out on this device</button></div><p id="access-message" class="small" role="status"></p><p class="small muted">Your notes and progress stay in this browser. Export your workbook before changing device.</p></section>${choose}${next}`;
}

function lockedPage(kind, id) {
 const A = ACCESS();
 const path = kind === 'lesson' ? id[0] : id;
 const what = kind === 'lesson' ? `${id} · ${(BASE.modules.find(m => m.id === id) || {}).title || ''}` : kind === 'lab' ? (PATHS.find(p => p.id === path) || {}).lab : kind === 'project' ? pathName(path) + ': final project' : 'this page';
 let reason, actions;
 if (!A || !A.signedIn()) {
  reason = 'This is part of the paid course. Enrol, or sign in if you have already paid.';
  actions = `<div class="actions"><a class="button gold" href="#account">Sign in →</a><a class="button light" href="#fees" onclick="location.hash='#landing';setTimeout(()=>document.getElementById('fees')?.scrollIntoView(),60);return false;">See the course fee</a></div>`;
 } else if (A.loadingNow() || (!A.loaded() && !A.lastError())) {
  reason = 'Loading your course content…'; actions = '';
 } else if (path !== 'F' && A.tier() >= 2 && !A.spec()) {
  reason = 'Choose your specialist pathway first.'; actions = '<a class="button gold" href="#account">Choose my specialism →</a>';
 } else if (kind === 'project' && A.tier() < 3) {
  reason = 'Final projects open with your 3rd instalment (or full payment).'; actions = '<a class="button gold" href="#account">Unlock the next stage →</a>';
 } else if (path !== 'F' && A.tier() < 2) {
  reason = 'Specialist pathways open with your 2nd instalment.'; actions = '<a class="button gold" href="#account">Unlock the next stage →</a>';
 } else if (path !== 'F' && A.spec() && path !== A.spec()) {
  reason = `Your package includes ${pathName(A.spec())}. You can preview this pathway’s module titles; contact BSOE to add a second specialism.`; actions = `<a class="button gold" href="#path/${A.spec()}">Open my pathway →</a>`;
 } else {
  reason = A.lastError() || 'This content could not be loaded. Check your connection and try again.'; actions = '<button class="gold" onclick="location.reload()">Try again</button>';
 }
 return `<div id="locked" class="locked card"><p class="eyebrow">ENROLLED LEARNERS</p><h1 class="lesson-title">${xesc(what)}</h1><p class="intro">${reason}</p>${actions}</div>`;
}

function extraPage(key) {
 nav(key);
 const A = ACCESS(), x = window.EXTRAS && window.EXTRAS[key];
 if (!x) return lockedPage('extra', 'F');
 const block = s => {
  if (s.type === 'table') return `<section class="card"><h2>${s.h}</h2><div class="table-wrap"><table><thead><tr>${s.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${s.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${s.note ? `<p class="small muted">${s.note}</p>` : ''}</section>`;
  if (s.type === 'list') return `<section class="card"><h2>${s.h}</h2><ul>${s.items.map(i => `<li>${i}</li>`).join('')}</ul></section>`;
  if (s.type === 'case') return `<section class="card case"><h2>${s.h}</h2>${s.body.map(b => `<p>${b}</p>`).join('')}${s.questions.map(([q, a]) => `<details><summary>${q}</summary><div><p>${a}</p></div></details>`).join('')}<label for="note-${key}">Your response (saved in your workbook)<textarea id="note-${key}" rows="5" data-extra-note="${key}">${xesc((state.notes['X-' + key]) || '')}</textarea></label></section>`;
  return `<section class="card"><h2>${s.h}</h2>${s.body.map(b => `<p>${b}</p>`).join('')}</section>`;
 };
 setTimeout(() => document.querySelectorAll('[data-extra-note]').forEach(t => t.oninput = () => { state.notes['X-' + t.dataset.extraNote] = t.value; save(); }), 0);
 return `<p class="eyebrow">${x.eyebrow}</p><h1>${x.title}.</h1><p class="intro">${x.intro}</p><div class="extra-stack">${x.sections.map(block).join('')}</div>`;
}

// ---------- Simulation & VR plan (public) ----------
const SIM_TIERS = [
 {tier: 'Free · runs now', cost: '₦0 beyond a laptop/phone and data', items: [
  ['Built-in course labs (6)', 'All pathways', 'Browser, any device', 'Free, included'],
  ['PhET interactive simulations', 'F, P (science foundations)', 'Browser', 'Free'],
  ['QGIS + its training manual; Google Earth Pro', 'G, E (maps, sampling, monitoring)', 'Windows/macOS/Linux desktop', 'Free'],
  ['AnyLogic Personal Learning Edition', 'L (fleet, dispatch, warehousing)', 'Desktop', 'Free for learning; model-size limits'],
  ['DJI Flight Simulator (free version)', 'G3 (drone survey)', 'Windows PC + DJI account; controller recommended', 'Free tier; paid editions add training modules'],
  ['NIOSH EXAMiner hazard recognition', 'F1, M1 (workplace examination)', 'Windows PC', 'US government tool; check current download']
 ]},
 {tier: 'Low-cost VR starter', cost: 'About US$350–450 per headset (one headset can serve 6–8 learners in rotation)', items: [
  ['Gillette College mining safety VR (Blind Spot, Light Duty Vehicle Inspection, Working at Heights)', 'M1–M3, L4', 'Meta Quest 2/3S class headset', 'Free programs; US$10 shipping; ask about orders from Nigeria'],
  ['Meta Quest 3S headset (hardware)', 'VR delivery', 'Standalone headset', 'US$349.99 (128 GB) / US$449.99 (256 GB), Meta US prices from April 2026'],
  ['Interplay Learning (skilled trades: electrical, welding, mechanical)', 'M3, L3, L4', 'Browser + optional VR', 'From about US$49 per user per month (Basic, up to 10 users)']
 ]},
 {tier: 'Mid-range · institutional', cost: 'Quote-based; budget thousands of US dollars per seat or per year', items: [
  ['Industrial Sims VR (forklift, MEWP, crane)', 'L2 warehousing, L4 site services', 'Motion-based VR', 'Quote; book a demo (info@industrialsims.com)'],
  ['Simlog personal simulators (haul truck, loader, excavator)', 'M2 mobile equipment', 'Windows PC + joysticks/pedals', 'Quote; one trade report cited about US$6,000 per licence plus controls'],
  ['Caspeo USIM PAC (process simulation)', 'P1–P2 mass balance, flowsheets', 'Windows', 'Listed from about €1,950; academic terms on request'],
  ['RPMGlobal HAULSIM', 'L1, M5 haulage planning', 'Desktop', 'Quote']
 ]},
 {tier: 'High-fidelity · partner sites', cost: 'Major capital purchase; use through mining-company or training-centre partnerships', items: [
  ['ThoroughTec CYBERMINE', 'M2 surface and underground equipment', 'Full-cab and motion simulators', 'Quote'],
  ['Immersive Technologies (WorksiteVR, Virtual Machine, PRO simulators)', 'M1–M4', 'VR, desktop and full simulators', 'Quote'],
  ['Metso operator training simulators; ANDRITZ IDEAS/OTS', 'P3–P5 control room', 'Desktop / hosted', 'Quote']
 ]}
];
const SIM_PATHS = [
 ['F', 'Course AI evidence lab + PhET + EXAMiner', 'Add VR hazard awareness (Gillette programs) on a shared headset'],
 ['G', 'Exploration lab + QGIS + Google Earth Pro + DJI simulator (free)', 'Paid DJI simulator edition for flight-skills modules'],
 ['M', 'Safe-shift lab + Gillette VR (Blind Spot, vehicle inspection)', 'Simlog PC simulators, then partner access to CYBERMINE/Immersive Technologies'],
 ['P', 'Processing & tank lab + PhET + spreadsheet mass balances', 'USIM PAC academic licence; Metso/ANDRITZ OTS through a partner'],
 ['L', 'Dispatch lab + AnyLogic PLE', 'Industrial Sims forklift/MEWP/crane VR; Interplay Learning for welding and electrical'],
 ['E', 'Rain-event lab + QGIS monitoring maps', 'Field instrument days with a partner laboratory (no simulator needed)']
];

function simPlanPage() {
 nav('simplan');
 return `<p class="eyebrow">PRACTICE BEYOND THE PAGE</p><h1>Simulation & VR plan.</h1><p class="intro">Every learner can practise with the free options today. VR and commercial simulators add realism for those who can access them; none is required to complete this course.</p>
<div class="notice"><strong>Prices are indicative</strong>, gathered from public vendor pages and listings in October 2026, in the vendor’s currency. Most institutional products are quote-based: ask for education pricing, a trial and written confirmation of devices, licence length and support in Nigeria before paying.</div>
<section class="card"><h2>Cheapest route by pathway</h2><div class="table-wrap"><table><thead><tr><th>Pathway</th><th>Free, start now</th><th>Upgrade when budget allows</th></tr></thead><tbody>${SIM_PATHS.map(([p, a, b]) => `<tr><td><strong>${p}</strong> · ${PATHS.find(x => x.id === p).short}</td><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody></table></div></section>
${SIM_TIERS.map(t => `<section class="card" style="margin-top:22px"><h2>${t.tier}</h2><p class="small muted">${t.cost}</p><div class="table-wrap"><table><thead><tr><th>Option</th><th>Course fit</th><th>Platform</th><th>Cost</th></tr></thead><tbody>${t.items.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`).join('')}
<section class="card" style="margin-top:22px"><h2>A practical budget for a 20-learner cohort</h2><ul><li><strong>Baseline (₦0 extra):</strong> course labs + free desktop tools on learners’ own laptops or a shared lab.</li><li><strong>VR starter:</strong> 3 headsets (about US$1,050–1,350) + free Gillette VR programs, rotated in small groups during practical days.</li><li><strong>Trades add-on:</strong> Interplay Learning for the learners on M or L pathways only (about US$49 per learner per month while they need it).</li><li><strong>Equipment realism:</strong> request a demo and education quote from Industrial Sims or Simlog for one shared station, or arrange partner-site sessions on high-fidelity simulators.</li></ul><p class="small muted">Keep a desktop or tabletop alternative for anyone who cannot use VR (motion sickness, eyesight, accessibility). Simulator practice is training, not an operator licence.</p><a class="button light" href="#resources">See the provider directory →</a></section>`;
}
