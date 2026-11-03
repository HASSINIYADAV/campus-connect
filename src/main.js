import { categories, demoEvents, mapDatabaseEvent } from "./data.js";
import { supabase, supabaseConfigured } from "./supabase.js";
import "./styles.css";

const state = {
  view: "auth",
  authMode: "signin",
  session: null,
  events: demoEvents,
  liveEvents: false,
  selectedEvent: demoEvents[0],
  category: "All",
  search: "",
  busy: false,
  notice: "",
  noticeKind: "info",
  pendingConfirmationEmail: "",
};

const app = document.querySelector("#app");
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

function initials(name = "CampusConnect") {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function brand(compact = false) {
  return `<a class="brand ${compact ? "brand-compact" : ""}" href="#" data-action="home" aria-label="CampusConnect home"><span class="brand-mark">◆</span><span>CampusConnect</span></a>`;
}

function campusIllustration() {
  const windows = Array.from({ length: 15 }, (_, i) => `<i style="--i:${i}"></i>`).join("");
  return `<div class="campus-illustration" aria-hidden="true"><div class="clouds"><b></b><b></b><b></b><b></b><b></b></div><div class="campus-buildings"><div class="building building-left">${windows.slice(0, 0)}</div><div class="building building-center">${Array.from({ length: 8 }, () => "<i></i>").join("")}</div><div class="building building-right">${Array.from({ length: 10 }, () => "<i></i>").join("")}</div></div></div>`;
}

function authView() {
  const signingUp = state.authMode === "signup";
  return `<main class="auth-page">
    <section class="auth-layout">
      <div class="auth-intro">
        ${brand()}
        <div class="intro-copy"><h1>Your campus life<br>starts here</h1><p>Discover events, meet new people, build your skills and make the most of your college journey.</p><span class="topic-pill">TECH&nbsp; • &nbsp;CULTURE&nbsp; • &nbsp;SPORTS</span></div>
        ${campusIllustration()}
      </div>
      <section class="auth-card" aria-labelledby="auth-title">
        <header><h2 id="auth-title">${signingUp ? "Create your account" : "Welcome back!"}</h2><p>${signingUp ? "Join CampusConnect and find your people." : "Sign in to your CampusConnect account."}</p></header>
        ${state.notice ? `<div class="notice ${state.noticeKind}" role="status">${escapeHtml(state.notice)}</div>` : ""}
        ${state.pendingConfirmationEmail ? `<button class="text-button confirmation-resend" type="button" data-action="resend" ${state.busy ? "disabled" : ""}>Resend confirmation email</button>` : ""}
        <form id="auth-form" class="auth-form">
          ${signingUp ? `<label>Full name<input name="fullName" autocomplete="name" placeholder="Enter your name" required></label>` : ""}
          <label>Email address<input name="email" type="email" autocomplete="email" placeholder="you@college.edu" required></label>
          <label>Password<input name="password" type="password" autocomplete="${signingUp ? "new-password" : "current-password"}" placeholder="${signingUp ? "Create a password" : "Enter your password"}" minlength="6" required></label>
          ${!signingUp ? `<div class="forgot-row"><button class="text-button" type="button" data-action="forgot">Forgot password?</button></div>` : ""}
          <button class="primary-button full-width" type="submit" ${state.busy ? "disabled" : ""}>${state.busy ? "Please wait…" : signingUp ? "Create account" : "Sign in"}</button>
        </form>
        <div class="divider"><span>or</span></div>
        <button class="google-button" type="button" data-action="google"><span class="google-g">G</span>Continue with Google</button>
        <p class="auth-switch">${signingUp ? "Already have an account?" : "New to CampusConnect?"} <button class="text-button" type="button" data-action="toggle-auth">${signingUp ? "Sign in" : "Create account"}</button></p>
        <p class="auth-terms">Your campus. Your people. Your next big thing.</p>
      </section>
    </section>
  </main>`;
}

function topbar() {
  const userName = state.session?.user?.user_metadata?.full_name || state.session?.user?.user_metadata?.name || state.session?.user?.email || "Campus user";
  return `<header class="topbar">${brand(true)}<label class="global-search"><span aria-hidden="true">⌕</span><input id="global-search" type="search" value="${escapeHtml(state.search)}" placeholder="Search events, categories, or keywords…" aria-label="Search events"></label><div class="top-actions"><button class="icon-button" aria-label="Notifications" title="Notifications">♧</button><span class="avatar">${escapeHtml(initials(userName))}</span><button class="profile-button" data-action="profile" aria-label="Profile menu">⌄</button></div></header>`;
}

function banner() {
  if (state.liveEvents && supabaseConfigured) return "";
  return `<div class="preview-banner"><span class="preview-dot"></span>Showing sample events while live event access is being configured.</div>`;
}

function categoryChips() {
  return categories.map((item) => `<button class="chip ${state.category === item ? "selected" : ""}" data-category="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");
}

function artwork(event, large = false) {
  return `<div class="event-art art-${escapeHtml(event.art || "navy")} ${large ? "art-large" : ""}" aria-label="${escapeHtml(event.short || event.title)} artwork"><div class="art-lines">${Array.from({ length: large ? 20 : 7 }, () => "<i></i>").join("")}</div><span class="art-category">${escapeHtml(event.category || "TECHNICAL")}</span><strong>${escapeHtml(event.short || event.title.toUpperCase())}</strong><small>STUDENT IDEAS · CAMPUS COMMUNITY</small></div>`;
}

function eventCard(event) {
  const price = event.price == null ? "Price to be announced" : `₹${Number(event.price)}`;
  return `<article class="event-card">${artwork(event)}<div class="event-card-body"><h3>${escapeHtml(event.title)}</h3><p class="event-meta"><span>◷</span>${escapeHtml(event.date)}</p><p class="event-meta"><span>⌖</span>${escapeHtml(event.venue)}</p><p class="event-price">${price}${event.price == null ? "" : " <small>per participant</small>"}</p><button class="outline-button" data-event="${escapeHtml(event.id)}">View details <span>→</span></button></div></article>`;
}

function filteredEvents() {
  const query = state.search.trim().toLowerCase();
  return state.events.filter((event) => (state.category === "All" || event.category === state.category)
    && (!query || `${event.title} ${event.category} ${event.venue}`.toLowerCase().includes(query)));
}

function exploreView() {
  const events = filteredEvents();
  return `<main class="app-shell">${topbar()}<section class="content explore-content">${banner()}${state.notice ? `<div class="notice ${state.noticeKind}" role="status">${escapeHtml(state.notice)}</div>` : ""}<div class="page-heading"><div><h1>Discover events</h1><p>Find your next campus experience.</p></div><span class="result-count">${events.length} upcoming events</span></div><div class="filter-row">${categoryChips()}</div>${events.length ? `<div class="event-grid">${events.map(eventCard).join("")}</div>` : `<div class="empty-state"><div>⌕</div><h2>No events found</h2><p>Try another search or category.</p><button class="outline-button" data-action="clear-search">Clear filters</button></div>`}</section></main>`;
}

function detailsView() {
  const event = state.selectedEvent;
  const price = event.price == null ? "Price to be announced" : `₹${Number(event.price)}`;
  return `<main class="app-shell">${topbar()}<section class="content details-content">${state.notice ? `<div class="notice ${state.noticeKind}" role="status">${escapeHtml(state.notice)}</div>` : ""}<button class="back-link" data-action="back">← Back to events</button><div class="details-grid"><div class="details-main">${artwork(event, true)}<h1>${escapeHtml(event.title)}</h1><span class="category-label">${escapeHtml(event.category)}</span><p class="detail-meta">◷ &nbsp;${escapeHtml(event.date)}</p><p class="detail-meta">⌖ &nbsp;${escapeHtml(event.venue)}</p><section class="about-section"><h2>About the event</h2><p>${escapeHtml(event.description)}</p></section><div class="detail-panels"><section><h3>Highlights</h3><ul>${event.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section><section><h3>Agenda</h3><ul>${event.agenda.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section></div></div><aside class="details-aside"><section class="price-card"><strong>${price}</strong><span>${event.price == null ? "Set by the organizer" : "Per participant"}</span><button class="primary-button full-width" data-action="register">Register for event</button></section><section class="organizer-card"><p class="eyebrow">ORGANIZED BY</p><div class="organizer"><span class="organizer-avatar">CC</span><div><b>${escapeHtml(event.organizer || "CampusConnect Club")}</b><small>Student community</small></div></div><p>Bringing students together through experiences that make campus life memorable.</p></section></aside></div></section></main>`;
}

function qrPlaceholder() {
  const cells = Array.from({ length: 81 }, (_, index) => {
    const x = index % 9; const y = Math.floor(index / 9);
    const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
    const filled = finder ? (x % 2 === 0 || y % 2 === 0) : ((index * 17 + x * 5 + y * 3) % 7 < 3);
    return `<i class="${filled ? "on" : ""}"></i>`;
  }).join("");
  return `<div class="qr-code" aria-hidden="true">${cells}</div>`;
}

function registrationView() {
  const event = state.selectedEvent;
  const user = state.session?.user;
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const email = user?.email || "";
  const amount = event.price == null ? "To be announced" : `₹${Number(event.price)}`;
  return `<main class="app-shell">${topbar()}<section class="content registration-content">${state.notice ? `<div class="notice ${state.noticeKind}" role="status">${escapeHtml(state.notice)}</div>` : ""}<div class="registration-heading"><h1>Complete your registration</h1><p>You're one step closer to your next campus experience.</p></div><div class="stepper"><div class="step active"><span>1</span><small>Event details</small></div><i></i><div class="step active"><span>2</span><small>Registration</small></div><i></i><div class="step"><span>3</span><small>Payment</small></div></div><div class="registration-grid"><form id="registration-form" class="attendee-card"><h2>Attendee information</h2><p class="subtle">Fields marked * are required.</p><label>Full name *<input name="fullName" autocomplete="name" value="${escapeHtml(name)}" placeholder="Enter your full name" required></label><label>Email address *<input name="email" type="email" autocomplete="email" value="${escapeHtml(email)}" placeholder="you@college.edu" required></label><label>College / department<input name="college" placeholder="Enter your college or department"></label><div class="info-box"><span>ⓘ</span><p>Use the email address linked to your CampusConnect account. Your registration is saved as pending until payment instructions are confirmed.</p></div><button class="primary-button full-width mobile-submit" type="submit" ${state.busy ? "disabled" : ""}>${state.busy ? "Saving…" : "Confirm registration"}</button></form><aside class="payment-card"><h2>Event summary</h2><div class="summary-event">${artwork(event)}<div><b>${escapeHtml(event.title)}</b><span class="category-label">${escapeHtml(event.category)}</span><small>◷ &nbsp;${escapeHtml(event.date)}</small><small>⌖ &nbsp;${escapeHtml(event.venue)}</small></div></div><section class="payment-box"><h3>Payment details</h3><div class="payment-layout">${qrPlaceholder()}<div><b>Payment QR setup pending</b><p>The organizer’s verified payment details will appear here.</p><span class="amount-label">Amount</span><strong class="amount">${amount}</strong></div></div></section><p class="payment-note">Your registration will remain pending until payment is confirmed.</p><button class="primary-button full-width desktop-submit" type="submit" form="registration-form" ${state.busy ? "disabled" : ""}>${state.busy ? "Saving…" : "Confirm registration"}</button></aside></div></section></main>`;
}

function render() {
  if (state.view === "auth") app.innerHTML = authView();
  else if (state.view === "details") app.innerHTML = detailsView();
  else if (state.view === "register") app.innerHTML = registrationView();
  else app.innerHTML = exploreView();
  bindEvents();
}

function setNotice(message, kind = "info") {
  state.notice = message;
  state.noticeKind = kind;
  render();
}

async function loadEvents() {
  if (!supabaseConfigured) return;
  const { data, error } = await supabase.from("events")
    .select("id,title,capacity,timestamp,status,organiser_id")
    .order("timestamp", { ascending: true, nullsFirst: false });
  if (!error && data?.length) {
    state.events = data.map(mapDatabaseEvent);
    state.liveEvents = true;
  } else {
    state.events = demoEvents;
    state.liveEvents = false;
  }
}

async function handleAuthSubmit(form) {
  const values = new FormData(form);
  const email = String(values.get("email") || "").trim();
  const password = String(values.get("password") || "");
  state.busy = true; state.notice = ""; render();
  try {
    if (!supabase) throw new Error("Supabase is not configured yet. Add the project URL and publishable key to .env.local.");
    if (state.authMode === "signup") {
      const fullName = String(values.get("fullName") || "").trim();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
      if (!data.session) {
        state.busy = false;
        state.pendingConfirmationEmail = email;
        setNotice("Check your email to confirm your account, then sign in.", "success");
        return;
      }
      state.pendingConfirmationEmail = "";
      state.session = data.session; state.view = "explore";
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      state.pendingConfirmationEmail = "";
      state.session = data.session; state.view = "explore";
    }
    state.busy = false; state.notice = "";
    await loadEvents(); render();
  } catch (error) {
    state.busy = false;
    if (error?.code === "email_not_confirmed" || /email not confirmed/i.test(error?.message || "")) {
      state.pendingConfirmationEmail = email;
      setNotice("Confirm your email before signing in. Open the confirmation email or resend it below.", "error");
      return;
    }
    setNotice(error instanceof Error ? error.message : "Unable to sign in right now.", "error");
  }
}

async function handleRegistration(form) {
  const event = state.selectedEvent;
  if (!state.session) { state.view = "auth"; state.authMode = "signin"; setNotice("Sign in before registering for an event."); return; }
  if (!event.live) { setNotice("This is a sample event. Connect a live event before submitting a registration.", "error"); return; }
  const values = new FormData(form);
  state.busy = true; render();
  try {
    const { error } = await supabase.from("event_registrations").insert({
      user_id: state.session.user.id,
      event_id: event.id,
      attendee_name: String(values.get("fullName") || "").trim(),
      attendee_email: String(values.get("email") || "").trim(),
      college: String(values.get("college") || "").trim() || null,
      payment_status: "pending",
    });
    if (error) throw error;
    state.busy = false; state.view = "explore";
    state.notice = "Registration saved as pending. The organizer will share verified payment instructions.";
    state.noticeKind = "success";
    render();
  } catch (error) {
    state.busy = false;
    state.notice = error instanceof Error ? `Registration is not ready yet: ${error.message}` : "Registration could not be completed.";
    state.noticeKind = "error";
    render();
  }
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", async (event) => {
    const action = button.dataset.action;
    if (action === "toggle-auth") { state.authMode = state.authMode === "signin" ? "signup" : "signin"; state.notice = ""; render(); }
    if (action === "resend") {
      const email = state.pendingConfirmationEmail || document.querySelector('[name="email"]')?.value.trim();
      if (!email) return setNotice("Enter your email address first.", "error");
      if (!supabase) return setNotice("Supabase is not configured yet.", "error");
      state.busy = true; state.notice = ""; render();
      try {
        const { error } = await supabase.auth.resend({ type: "signup", email });
        if (error) throw error;
        state.busy = false; state.pendingConfirmationEmail = email;
        setNotice("If this account needs confirmation, a new email is on its way. Check your inbox and spam folder.", "success");
      } catch (error) {
        state.busy = false;
        setNotice(error instanceof Error ? error.message : "Could not resend the confirmation email.", "error");
      }
    }
    if (action === "google") {
      if (!supabase) return setNotice("Supabase is not configured yet.", "error");
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
      if (error) setNotice(/provider is not enabled/i.test(error.message)
        ? "Google sign-in is not enabled in Supabase yet. Use email and password, or configure Google under Supabase Authentication → Providers."
        : error.message, "error");
    }
    if (action === "forgot") {
      const email = document.querySelector('[name="email"]')?.value.trim();
      if (!email) return setNotice("Enter your email address first.", "error");
      if (!supabase) return setNotice("Supabase is not configured yet.", "error");
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      setNotice(error ? error.message : "If an account exists for that email, a reset link is on its way.", error ? "error" : "success");
    }
    if (action === "home") { event.preventDefault(); state.view = state.session ? "explore" : "auth"; state.notice = ""; render(); }
    if (action === "profile") {
      if (!state.session) return;
      const { error } = await supabase.auth.signOut();
      state.session = null; state.view = "auth"; state.authMode = "signin";
      state.notice = error ? error.message : "You have been signed out."; state.noticeKind = error ? "error" : "info"; render();
    }
    if (action === "back") { state.view = "explore"; state.notice = ""; render(); }
    if (action === "register") {
      if (!state.session) { state.view = "auth"; state.authMode = "signin"; state.notice = "Sign in to continue with your registration."; render(); }
      else { state.view = "register"; state.notice = ""; render(); }
    }
    if (action === "clear-search") { state.search = ""; state.category = "All"; render(); }
  }));

  document.querySelectorAll("[data-event]").forEach((button) => button.addEventListener("click", () => {
    state.selectedEvent = state.events.find((event) => event.id === button.dataset.event) || demoEvents[0];
    state.view = "details"; state.notice = ""; render();
  }));
  document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => { state.category = button.dataset.category; render(); }));
  document.querySelector("#global-search")?.addEventListener("input", (event) => {
    state.search = event.target.value;
    const position = event.target.selectionStart;
    render();
    const input = document.querySelector("#global-search"); input?.focus(); input?.setSelectionRange(position, position);
  });
  document.querySelector("#auth-form")?.addEventListener("submit", (event) => { event.preventDefault(); handleAuthSubmit(event.currentTarget); });
  document.querySelector("#registration-form")?.addEventListener("submit", (event) => { event.preventDefault(); handleRegistration(event.currentTarget); });
}

async function start() {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    state.session = data.session;
    if (state.session) state.view = "explore";
    supabase.auth.onAuthStateChange((_event, session) => {
      state.session = session;
      if (session && state.view === "auth") state.view = "explore";
      if (!session && state.view !== "auth") state.view = "auth";
      loadEvents().finally(render);
    });
    await loadEvents();
  }
  render();
}

start();
