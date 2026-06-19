const categories = ["Residuos", "Agua", "Aire", "Bosques", "Fauna", "Otro"];
const reports = [
  {
    id: "ECO-1024",
    category: "Agua",
    title: "Efluentes cloacales sin tratar",
    description: "Agua turbia con olor fuerte y descarga organica cerca del arroyo.",
    location: "Arroyo Nireco, Bariloche",
    date: "28 may",
    severity: "grave",
    status: "revisado",
    x: 70,
    y: 47,
  },
  {
    id: "ECO-1023",
    category: "Residuos",
    title: "Basural clandestino detras del barrio",
    description: "Plasticos, electrodomesticos y poda acumulados en zona vecinal.",
    location: "Limite sur del Barrio Frutillar",
    date: "17 may",
    severity: "grave",
    status: "recibido",
    x: 63,
    y: 67,
  },
  {
    id: "ECO-1022",
    category: "Aire",
    title: "Quema ilegal de residuos forestales",
    description: "Columna de humo constante durante la tarde, cercana a viviendas.",
    location: "Camino a Colonia Suiza",
    date: "21 may",
    severity: "media",
    status: "derivado",
    x: 24,
    y: 31,
  },
  {
    id: "ECO-1021",
    category: "Bosques",
    title: "Tala reciente en zona de ladera",
    description: "Arboles cortados y suelo removido junto a sendero vecinal.",
    location: "Ladera oeste, Melipal",
    date: "15 may",
    severity: "media",
    status: "revisado",
    x: 54,
    y: 55,
  },
  {
    id: "ECO-1020",
    category: "Fauna",
    title: "Ave herida cerca de residuos",
    description: "Vecinos reportan un ave atrapada entre bolsas y cables.",
    location: "Costa del lago, km 5",
    date: "11 may",
    severity: "baja",
    status: "resuelto",
    x: 37,
    y: 42,
  },
];

const state = {
  activeCategory: "Todos",
  selectedId: "ECO-1024",
  step: 1,
  evidenceName: "",
  mapsLink: "",
  picked: { x: 54, y: 52, label: "Ubicación inicial: Bariloche centro." },
  draft: { category: "", description: "" },
  lead: { name: "", whatsapp: "", email: "" },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {};
let caseScrollObserver;

function filteredReports() {
  if (state.activeCategory === "Todos") return reports;
  return reports.filter((report) => report.category === state.activeCategory);
}

function selectedReport() {
  return reports.find((report) => report.id === state.selectedId) || reports[0];
}

function shortReportId(report) {
  return `#${report.id.replace("ECO-", "")}`;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function bindSpotlight(element) {
  if (!element || element.dataset.spotlightReady === "true") return;
  element.dataset.spotlightReady = "true";
  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty("--spot-x", `${x}%`);
    element.style.setProperty("--spot-y", `${y}%`);
  });
}

function renderCategoryFilter() {
  els.categoryFilter.innerHTML = "";
  ["Todos", ...categories].forEach((category) => {
    const option = createElement("option", "", category);
    option.value = category;
    els.categoryFilter.appendChild(option);
  });
  els.categoryFilter.value = state.activeCategory;
}

function renderMissionList() {
  els.missionList.innerHTML = "";
  filteredReports().forEach((report) => {
    const button = createElement("button", `mission-card spotlight-surface motion-surface ${state.selectedId === report.id ? "is-active" : ""}`);
    button.type = "button";
    button.dataset.reportId = report.id;
    button.setAttribute("aria-pressed", state.selectedId === report.id ? "true" : "false");
    button.addEventListener("click", () => selectReport(report.id));

    const body = createElement("span", "min-w-0");
    const meta = createElement("span", "flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase text-eco-muted");
    meta.append(createElement("span", "", report.category), createElement("span", "", report.severity));
    body.append(
      meta,
      createElement("strong", "mt-1 block text-left text-base leading-tight", report.title),
      createElement("small", "mt-2 line-clamp-2 block text-left text-sm leading-5 text-eco-muted", report.location),
    );
    button.append(body, createElement("span", "status-mini", report.status));
    els.missionList.appendChild(button);
    bindSpotlight(button);
    if (document.documentElement.classList.contains("motion-ready")) button.classList.add("is-visible");
  });
}

function renderMap() {
  els.mapPins.innerHTML = "";
  filteredReports().forEach((report) => {
    const pin = createElement("button", `map-token ${state.selectedId === report.id ? "is-active" : ""}`);
    pin.type = "button";
    pin.style.left = `${report.x}%`;
    pin.style.top = `${report.y}%`;
    pin.setAttribute("aria-label", `${shortReportId(report)}. ${report.category}: ${report.title}`);
    pin.setAttribute("aria-pressed", state.selectedId === report.id ? "true" : "false");
    pin.append(createElement("span", "", shortReportId(report)));
    pin.addEventListener("click", () => selectReport(report.id));
    els.mapPins.appendChild(pin);
  });
}

function renderDetail() {
  const report = selectedReport();
  const facts = [
    { label: "zona", value: report.location },
    { label: "estado", value: report.status },
    { label: "riesgo", value: report.severity },
    { label: "fecha", value: report.date },
  ];
  els.caseDetail.innerHTML = "";

  const header = createElement("div", "flex items-start justify-between gap-4");
  const titleGroup = createElement("div");
  titleGroup.append(
    createElement("p", "eyebrow", report.id),
    createElement("h3", "mt-1 text-2xl font-black leading-tight", report.title),
  );
  header.append(titleGroup, createElement("span", "status-pill", report.status));

  const description = createElement("p", "mt-3 leading-7 text-eco-muted", report.description);
  const factsGrid = createElement("div", "mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4");

  facts.forEach((item) => {
    const fact = createElement("div", "fact-line");
    fact.append(
      createElement("span", "block text-xs font-black uppercase text-eco-muted", item.label),
      createElement("strong", "mt-1 block text-sm", item.value),
    );
    factsGrid.appendChild(fact);
  });

  els.caseDetail.append(header, description, factsGrid);
}

function renderCategoryChoices() {
  els.categoryChoices.innerHTML = "";
  categories.forEach((category) => {
    const button = createElement("button", `choice-option ${state.draft.category === category ? "is-selected" : ""}`);
    button.type = "button";
    button.setAttribute("aria-pressed", state.draft.category === category ? "true" : "false");
    button.append(createElement("strong", "", category));
    button.addEventListener("click", () => {
      state.draft.category = category;
      renderCategoryChoices();
    });
    els.categoryChoices.appendChild(button);
  });
}

function renderAll() {
  renderCategoryFilter();
  renderMissionList();
  renderMap();
  renderDetail();
  renderCategoryChoices();
  initCaseScrollSync();
}

function selectReport(id) {
  if (state.selectedId === id) return;
  state.selectedId = id;
  renderMissionList();
  renderMap();
  renderDetail();
  initCaseScrollSync();
}

function initCaseScrollSync() {
  if (caseScrollObserver) caseScrollObserver.disconnect();
  if (!("IntersectionObserver" in window)) return;
  if (!window.matchMedia("(max-width: 560px)").matches) return;

  const cards = $$(".mission-card");
  if (!cards.length) return;

  // ponytail: native observer is enough; no scroll library for one mobile sync.
  caseScrollObserver = new IntersectionObserver(
    (entries) => {
      const focused = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * 0.42) - Math.abs(b.boundingClientRect.top - window.innerHeight * 0.42))[0];
      const id = focused?.target?.dataset?.reportId;
      if (id) selectReport(id);
    },
    { rootMargin: "-32% 0px -48% 0px", threshold: 0 },
  );

  cards.forEach((card) => caseScrollObserver.observe(card));
}

function updatePickedPoint() {
  els.pickedPoint.style.left = `${state.picked.x}%`;
  els.pickedPoint.style.top = `${state.picked.y}%`;
  els.locationFeedback.textContent = state.picked.label;
}

function updateStep() {
  $$(".report-step").forEach((step) => {
    step.hidden = Number(step.dataset.step) !== state.step;
  });
  els.backStepBtn.hidden = state.step === 1;
  els.nextStepBtn.textContent = state.step === 3 ? "Enviar reporte" : "Continuar";
  els.reportProgress.style.width = `${Math.round((state.step / 3) * 100)}%`;
  els.formFeedback.textContent = "";
}

function openReport() {
  state.step = 1;
  state.evidenceName = "";
  state.mapsLink = "";
  state.picked = { x: 54, y: 52, label: "Ubicación inicial: Bariloche centro." };
  state.draft = { category: "", description: "" };
  els.reportForm.reset();
  els.evidenceFeedback.textContent = "Todavía no agregaste evidencia.";
  els.mapsLinkInput.value = "";
  els.descriptionInput.value = "";
  renderCategoryChoices();
  updatePickedPoint();
  updateStep();
  els.reportDialog.showModal();
  window.requestAnimationFrame(() => els.closeReportBtn.focus());
}

function closeReport() {
  els.reportDialog.close();
}

function validateStep() {
  if (state.step === 1 && !state.evidenceName) {
    els.formFeedback.textContent = "Subí una foto o video para continuar.";
    return false;
  }
  if (state.step === 3) {
    state.draft.description = els.descriptionInput.value.trim();
    if (!state.draft.category) {
      els.formFeedback.textContent = "Elegí una categoría.";
      return false;
    }
    if (state.draft.description.length < 8) {
      els.formFeedback.textContent = "Agregá una descripción corta para que el caso sea revisable.";
      return false;
    }
  }
  return true;
}

function nextStep() {
  if (!validateStep()) return;
  if (state.step < 3) {
    state.step += 1;
    updateStep();
    return;
  }
  submitMockReport();
}

function submitMockReport() {
  const id = `ECO-${Math.floor(1100 + Math.random() * 800)}`;
  reports.unshift({
    id,
    category: state.draft.category,
    title: `${state.draft.category}: reporte ciudadano recibido`,
    description: state.draft.description,
    location: state.mapsLink ? "Link de Google Maps adjunto" : state.picked.label,
    date: "hoy",
    severity: "media",
    status: "recibido",
    x: state.picked.x,
    y: state.picked.y,
  });
  state.activeCategory = "Todos";
  state.selectedId = id;
  closeReport();
  renderAll();
  resetLeadForm();
  els.followDialog.showModal();
  window.requestAnimationFrame(() => els.leadNameInput.focus());
}

function resetLeadForm() {
  state.lead = { name: "", whatsapp: "", email: "" };
  els.leadNameInput.value = "";
  els.leadWhatsappInput.value = "";
  els.leadEmailInput.value = "";
  els.leadFeedback.textContent = "";
  els.leadFeedback.classList.remove("is-success");
}

function normalizeLead() {
  return {
    name: els.leadNameInput.value.trim().split(/\s+/)[0] || "",
    whatsapp: els.leadWhatsappInput.value.trim(),
    email: els.leadEmailInput.value.trim(),
  };
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
  return value.replace(/\D/g, "").length >= 8;
}

function saveLead() {
  const lead = normalizeLead();
  els.leadFeedback.classList.remove("is-success");

  if (lead.name.length < 2) {
    els.leadFeedback.textContent = "Escribí tu nombre, sin apellido.";
    els.leadNameInput.focus();
    return;
  }

  if (!lead.whatsapp && !lead.email) {
    els.leadFeedback.textContent = "Dejá WhatsApp o email para activar seguimiento.";
    els.leadWhatsappInput.focus();
    return;
  }

  if (lead.whatsapp && !validPhone(lead.whatsapp)) {
    els.leadFeedback.textContent = "Revisá el WhatsApp: faltan números.";
    els.leadWhatsappInput.focus();
    return;
  }

  if (lead.email && !validEmail(lead.email)) {
    els.leadFeedback.textContent = "Revisá el email: formato inválido.";
    els.leadEmailInput.focus();
    return;
  }

  state.lead = lead;
  els.leadFeedback.classList.add("is-success");
  els.leadFeedback.textContent = `Seguimiento activado para ${state.selectedId}.`;
  window.setTimeout(() => els.followDialog.close(), 760);
}

function pickLocation(event) {
  const rect = els.locationPicker.getBoundingClientRect();
  const x = Math.max(7, Math.min(93, ((event.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(12, Math.min(92, ((event.clientY - rect.top) / rect.height) * 100));
  state.picked = {
    x: Math.round(x),
    y: Math.round(y),
    label: `Punto corregido manualmente (${Math.round(x)}, ${Math.round(y)}).`,
  };
  updatePickedPoint();
}

function bindEvents() {
  $$("[data-open-report]").forEach((button) => button.addEventListener("click", openReport));
  els.closeReportBtn.addEventListener("click", closeReport);
  els.closeFollowBtn.addEventListener("click", () => els.followDialog.close());
  els.saveLeadBtn.addEventListener("click", saveLead);
  els.nextStepBtn.addEventListener("click", nextStep);
  els.backStepBtn.addEventListener("click", () => {
    state.step = Math.max(1, state.step - 1);
    updateStep();
  });
  els.evidenceInput.addEventListener("change", () => {
    const file = els.evidenceInput.files && els.evidenceInput.files[0];
    state.evidenceName = file ? `${file.name} agregado` : "";
    els.evidenceFeedback.textContent = state.evidenceName || "Todavía no agregaste evidencia.";
    els.formFeedback.textContent = "";
  });
  els.useLocationBtn.addEventListener("click", () => {
    state.picked = { x: 58, y: 49, label: "Ubicación detectada. En V1 se pide permiso real de GPS." };
    updatePickedPoint();
  });
  els.mapsLinkInput.addEventListener("input", () => {
    state.mapsLink = els.mapsLinkInput.value.trim();
  });
  els.locationPicker.addEventListener("click", pickLocation);
  els.categoryFilter.addEventListener("change", () => {
    state.activeCategory = els.categoryFilter.value;
    const visible = filteredReports();
    if (!visible.some((report) => report.id === state.selectedId) && visible[0]) state.selectedId = visible[0].id;
    renderMissionList();
    renderMap();
    renderDetail();
  });
  els.reportForm.addEventListener("submit", (event) => event.preventDefault());
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

function initCultMotion() {
  document.documentElement.classList.add("motion-ready");
  [
    ".hero-copy",
    ".hero-shot",
    ".cases-panel",
    ".map-panel",
    ".case-sheet",
    ".upload-line",
    ".hero-map-stage",
  ].forEach((selector) => {
    $$(selector).forEach((element) => {
      element.classList.add("motion-surface");
      if (element.matches(".upload-line, .hero-map-stage")) {
        element.classList.add("spotlight-surface");
        bindSpotlight(element);
      }
    });
  });

  const targets = $$(".motion-surface");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  targets.forEach((element) => observer.observe(element));
}

function initHeroVideo() {
  const video = $(".hero-video");
  if (!video) return;

  const tryPlay = () => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  tryPlay();
  ["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, tryPlay, { once: true, passive: true });
  });
}

function cacheElements() {
  [
    "categoryFilter",
    "missionList",
    "mapPins",
    "caseDetail",
    "reportDialog",
    "reportForm",
    "closeReportBtn",
    "reportProgress",
    "evidenceInput",
    "evidenceFeedback",
    "useLocationBtn",
    "mapsLinkInput",
    "locationPicker",
    "pickedPoint",
    "locationFeedback",
    "categoryChoices",
    "descriptionInput",
    "formFeedback",
    "backStepBtn",
    "nextStepBtn",
    "followDialog",
    "leadNameInput",
    "leadWhatsappInput",
    "leadEmailInput",
    "leadFeedback",
    "saveLeadBtn",
    "closeFollowBtn",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  renderAll();
  updatePickedPoint();
  updateStep();
  bindEvents();
  initCultMotion();
  initHeroVideo();
  const mobileCases = window.matchMedia("(max-width: 560px)");
  if (mobileCases.addEventListener) {
    mobileCases.addEventListener("change", initCaseScrollSync);
  } else if (mobileCases.addListener) {
    mobileCases.addListener(initCaseScrollSync);
  }
  registerServiceWorker();
  if (new URLSearchParams(window.location.search).get("report") === "1") {
    window.setTimeout(openReport, 150);
  }
});
