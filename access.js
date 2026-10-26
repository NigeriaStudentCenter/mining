'use strict';
// Paid-access client. The public site ships only course titles and teasers. After a learner signs in
// with the email they paid with and their Paystack reference, the course API returns a signed access
// token and the lesson content they are entitled to. Nothing secret is stored here: the token only
// proves entitlement to this course and can be revoked by signing out or by the provider.
(() => {
 const KEY = 'mining-access-v1';
 const cfg = () => window.COURSE_CONFIG || {};
 const api = () => (cfg().api || '').replace(/\/$/, '');
 let token = null, claims = null, loading = null, loaded = false, lastError = '';
 try { token = localStorage.getItem(KEY); } catch { token = null; }

 function decode(t) {
  try {
   const part = t.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
   const c = JSON.parse(decodeURIComponent(escape(atob(part))));
   return c && c.exp * 1000 > Date.now() ? c : null;
  } catch { return null; }
 }
 claims = token ? decode(token) : null;
 if (token && !claims) { token = null; try { localStorage.removeItem(KEY); } catch {} }

 function store(t) { token = t; claims = t ? decode(t) : null; try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch {} }

 function merge(content) {
  const byId = Object.fromEntries(BASE.modules.map(m => [m.id, m]));
  for (const [id, fields] of Object.entries(content.modules || {})) if (byId[id]) Object.assign(byId[id], fields);
  for (const [id, lesson] of Object.entries(content.lessons || {})) window.LESSONS[id] = lesson;
  for (const s of content.sections || []) {
   const i = BASE.sections.findIndex(x => x.title === s.title);
   if (i >= 0) BASE.sections[i] = s; else BASE.sections.push(s);
  }
  if (content.extras) window.EXTRAS = content.extras;
 }

 async function call(path, opts = {}) {
  if (!api()) throw Error('Course sign-in is not connected yet. Please contact BSOE.');
  const res = await fetch(api() + path, {
   method: opts.body ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
   headers: Object.assign({'Content-Type': 'application/json'}, token ? {Authorization: 'Bearer ' + token} : {}),
   body: opts.body ? JSON.stringify(opts.body) : undefined, signal: AbortSignal.timeout(30000)
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (res.status === 401) { store(null); }
  if (!res.ok) throw Object.assign(Error(data.message || 'The course service could not complete that request. Please try again.'), {code: data.code, status: res.status});
  return data;
 }

 async function loadContent() {
  if (!token) return;
  if (loading) return loading;
  loading = (async () => {
   try { merge(await call('/content')); loaded = true; lastError = ''; }
   catch (e) { lastError = e.message; }
   finally { loading = null; if (typeof window.render === 'function') window.render(); }
  })();
  return loading;
 }

 const A = window.MINING_ACCESS = {
  signedIn: () => !!claims,
  claims: () => claims,
  loaded: () => loaded,
  loadingNow: () => !!loading,
  lastError: () => lastError,
  tier: () => (claims ? claims.t : 0),
  spec: () => (claims ? claims.s || null : null),
  can(path) { if (!claims) return false; if (path === 'F') return claims.t >= 1; return claims.t >= 2 && claims.s === path; },
  canProject(path) { return !!claims && claims.t >= 3 && (path === 'F' || path === claims.s); },
  authHeader: () => (token ? {Authorization: 'Bearer ' + token} : {}),
  async signIn(email, reference) {
   const data = await call('/access/login', {body: {email, reference}});
   store(data.token); loaded = false; await loadContent(); return data;
  },
  async refresh() { const data = await call('/access/refresh', {body: {}}); store(data.token); loaded = false; await loadContent(); return data; },
  async chooseSpec(spec) { const data = await call('/access/specialism', {body: {spec}}); store(data.token); loaded = false; await loadContent(); return data; },
  signOut() { store(null); loaded = false; location.hash = '#account'; location.reload(); },
  link: name => (cfg().links || {})[name] || ''
 };

 // Fill payment/enrolment links wherever the page asks for them.
 const fillLinks = () => document.querySelectorAll('[data-link]').forEach(a => {
  const url = A.link(a.dataset.link);
  if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; } else if (!a.getAttribute('href')) { a.href = '#account'; }
 });
 new MutationObserver(fillLinks).observe(document.documentElement, {childList: true, subtree: true});

 document.addEventListener('submit', async e => {
  if (e.target.id !== 'access-form') return;
  e.preventDefault();
  const f = e.target, msg = document.getElementById('access-message'), btn = f.querySelector('button[type=submit]');
  const email = f.email.value.trim(), reference = f.reference.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || reference.length < 6) { msg.textContent = 'Enter the email you paid with and your Paystack payment reference.'; return; }
  btn.disabled = true; btn.textContent = 'Checking your payment…'; msg.textContent = '';
  try { await A.signIn(email, reference); location.hash = A.tier() >= 2 && !A.spec() ? '#account' : '#home'; if (typeof window.render === 'function') window.render(); }
  catch (err) { msg.textContent = err.message; }
  finally { btn.disabled = false; btn.textContent = 'Sign in to my course →'; }
 });
 document.addEventListener('click', async e => {
  const b = e.target.closest('[data-access]');
  if (!b) return;
  e.preventDefault();
  const action = b.dataset.access, msg = document.getElementById('access-message');
  try {
   if (action === 'signout') return A.signOut();
   b.disabled = true;
   if (action === 'refresh') { await A.refresh(); if (msg) msg.textContent = 'Access updated.'; }
   if (action === 'spec') { if (!confirm('Choose ' + b.dataset.name + ' as your specialism? This cannot be changed without contacting BSOE.')) return; await A.chooseSpec(b.dataset.spec); location.hash = '#path/' + b.dataset.spec; }
   if (typeof window.render === 'function') window.render();
  } catch (err) { if (msg) msg.textContent = err.message; } finally { b.disabled = false; }
 });

 if (token) loadContent();
})();
