(function () {
const SITE_SEARCH_API_BASE = "http://localhost:5000/api";

const homeSearchInput = document.getElementById("homeSearchInput");
const homeSearchDropdown = document.getElementById("homeSearchDropdown");
const upscHeaderSearchInput = document.getElementById("upscHeaderSearchInput");
const upscHeaderSearchDropdown = document.getElementById("upscHeaderSearchDropdown");

const sanitize = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

let searchItems = [
  { type: "Subject", title: "Indian Polity", meta: "Constitution, Fundamental Rights, DPSP, Parliament, Judiciary" },
  { type: "Subject", title: "Indian History", meta: "Ancient, medieval, and modern Indian history" },
  { type: "Subject", title: "Indian Economy", meta: "Budget, planning, and economic reforms" },
  { type: "Subject", title: "Geography", meta: "Indian and world geography" },
  { type: "Subject", title: "Current Affairs", meta: "Daily and monthly current affairs" }
];

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

const loadSearchItems = async () => {
  try {
    const [subjects, topics, pdfs, lectures] = await Promise.all([
      fetchJson(`${SITE_SEARCH_API_BASE}/subjects`),
      fetchJson(`${SITE_SEARCH_API_BASE}/topics`),
      fetchJson(`${SITE_SEARCH_API_BASE}/pdfs`),
      fetchJson(`${SITE_SEARCH_API_BASE}/lectures`)
    ]);

    searchItems = [
      ...subjects.map((subject) => ({
        type: "Subject",
        title: subject.title || subject.subject_name,
        meta: subject.description || "Course subject"
      })),
      ...topics.map((topic) => ({
        type: "Topic",
        title: topic.title || topic.topic_name,
        meta: topic.subject_title || topic.subject_name || "Course topic"
      })),
      ...pdfs.map((pdf) => ({
        type: "PDF",
        title: pdf.title,
        meta: pdf.subject_title || pdf.subject_name || pdf.category || "PDF resource"
      })),
      ...lectures.map((lecture) => ({
        type: "Lecture",
        title: lecture.title,
        meta: lecture.topic_title || lecture.topic_name || lecture.subject_name || "YouTube lecture"
      }))
    ];
  } catch (error) {}
};

const getMatches = (query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  return searchItems
    .filter((item) => `${item.title} ${item.meta} ${item.type}`.toLowerCase().includes(normalizedQuery))
    .slice(0, 8);
};

const openCoursePage = (query) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;
  document.querySelectorAll(".course-search-dropdown").forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.innerHTML = "";
  });
  window.location.href = `./upsc.html?q=${encodeURIComponent(trimmedQuery)}`;
};

const renderDropdown = (query, dropdown) => {
  const matches = getMatches(query);

  if (!query.trim()) {
    dropdown.classList.remove("is-open");
    dropdown.innerHTML = "";
    return;
  }

  dropdown.classList.add("is-open");
  dropdown.innerHTML = matches.length
    ? matches
        .map(
          (item) => `
            <button class="course-search-option" type="button" data-title="${sanitize(item.title)}">
              <strong>${sanitize(item.title)}</strong>
              <span>${sanitize(item.type)} · ${sanitize(item.meta)}</span>
            </button>
          `
        )
        .join("")
    : `<div class="course-search-empty">No matching courses found. Press Enter to search UPSC.</div>`;
};

const bindSiteSearch = (input, dropdown) => {
  if (!input || !dropdown) return;

  input.addEventListener("input", () => {
    renderDropdown(input.value, dropdown);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const firstMatch = getMatches(input.value)[0];
    openCoursePage(firstMatch?.title || input.value);
  });

  dropdown.addEventListener("click", (event) => {
    const option = event.target.closest(".course-search-option");
    if (!option) return;
    openCoursePage(option.dataset.title);
  });
};

bindSiteSearch(homeSearchInput, homeSearchDropdown);
bindSiteSearch(upscHeaderSearchInput, upscHeaderSearchDropdown);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-search-panel")) {
    document.querySelectorAll(".site-search-panel .course-search-dropdown").forEach((dropdown) => dropdown.classList.remove("is-open"));
  }
});

loadSearchItems();
})();
