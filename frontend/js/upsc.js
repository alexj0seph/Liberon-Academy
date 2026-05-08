const API_BASE = "http://localhost:5000/api";
const YOUTUBE_URL = "https://youtube.com/@liberonacademy?si=1M3FApvLAsnJNAch";

const subjectsGrid = document.getElementById("subjectsGrid");
const topicsGrid = document.getElementById("topicsGrid");
const lecturesGrid = document.getElementById("lecturesGrid");
const resourcesGrid = document.getElementById("resourcesGrid");
const globalSearchInput = document.getElementById("globalSearchInput");
const courseSearchDropdown = document.getElementById("courseSearchDropdown");
const initialSearchQuery = new URLSearchParams(window.location.search).get("q") || "";

const subjectColorClasses = [
  "subject-blue",
  "subject-green",
  "subject-brown",
  "subject-cyan",
  "subject-teal",
  "subject-purple",
  "subject-red"
];

const sanitize = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const renderSubjects = (subjects) => {
  if (!subjects.length) {
    subjectsGrid.innerHTML = `<p class="empty-state">No subjects found.</p>`;
    return;
  }

  subjectsGrid.innerHTML = subjects
    .map((subject, index) => {
      const colorClass = subjectColorClasses[index % subjectColorClasses.length];
      return `
        <article class="card subject-card">
          <div class="subject-header ${colorClass}">${sanitize(subject.icon || "📘")}</div>
          <div class="subject-body">
            <h3>${sanitize(subject.subject_name)}</h3>
            <p>${sanitize(subject.description || "Description will be updated soon.")}</p>
            <a href="#topicsGrid" class="text-link">Explore Now →</a>
          </div>
        </article>
      `;
    })
    .join("");
};

const renderFallbackSubjects = () => {
  const fallbackSubjects = [
    {
      subject_name: "Indian Polity",
      description:
        "Constitution, Fundamental Rights, DPSP, Parliament, Judiciary, and more.",
      icon: "⚖"
    },
    {
      subject_name: "Indian Economy",
      description: "Economic concepts, planning, budgeting, and economic reforms.",
      icon: "📈"
    },
    {
      subject_name: "Indian History",
      description: "Ancient, Medieval, and Modern Indian History.",
      icon: "🏛"
    }
  ];
  renderSubjects(fallbackSubjects);
};

const renderTopics = (topics) => {
  if (!topics.length) {
    topicsGrid.innerHTML = `<p class="empty-state">No topics found.</p>`;
    return;
  }

  topicsGrid.innerHTML = topics
    .map((topic, index) => {
      const colorClass = subjectColorClasses[index % subjectColorClasses.length];
      const youtubeLink = topic.youtube_link || YOUTUBE_URL;
      const pdfButton = topic.pdf_file
        ? `<a class="topic-action" href="http://localhost:5000${topic.pdf_file}" target="_blank" rel="noopener noreferrer">Open PDF</a>`
        : `<span class="soon">PDF Coming Soon</span>`;

      return `
        <article class="card subject-card">
          <div class="subject-header ${colorClass}">📚</div>
          <div class="subject-body">
            <h3>${sanitize(topic.topic_name)}</h3>
            <p>${sanitize(topic.description || "")}</p>
            <p class="topic-subject">Subject: ${sanitize(topic.subject_name || "UPSC")}</p>
            <div class="topic-actions">
              <a class="topic-action" href="${sanitize(youtubeLink)}" target="_blank" rel="noopener noreferrer">Watch Lecture</a>
              ${pdfButton}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

const renderResources = (resources) => {
  if (!resources.length) {
    resourcesGrid.innerHTML = `<p class="empty-state">No resources found.</p>`;
    return;
  }

  resourcesGrid.innerHTML = resources
    .map((resource, index) => {
      const colorClass = subjectColorClasses[index % subjectColorClasses.length];
      const pdfButton = resource.file_path
        ? `<a class="topic-action" href="http://localhost:5000${resource.file_path}" target="_blank" rel="noopener noreferrer">Open PDF</a>`
        : `<span class="soon">PDF Coming Soon</span>`;

      return `
        <article class="card subject-card">
          <div class="subject-header ${colorClass}">📄</div>
          <div class="subject-body">
            <h3>${sanitize(resource.title)}</h3>
            <p>Category: ${sanitize(resource.category)}</p>
            <div class="topic-actions">
              ${pdfButton}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

const toEmbedUrl = (url) => {
  if (!url) return "";
  const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  if (idMatch && idMatch[1]) return `https://www.youtube.com/embed/${idMatch[1]}`;
  return "https://www.youtube.com/embed?listType=user_uploads&list=liberonacademy";
};

const renderLectures = (lectures) => {
  if (!lectures.length) {
    lecturesGrid.innerHTML = `<p class="empty-state">No lectures found.</p>`;
    return;
  }

  lecturesGrid.innerHTML = lectures
    .map(
      (lecture) => `
        <article class="card subject-card lecture-card">
          <iframe
            src="${toEmbedUrl(lecture.youtube_url)}"
            title="${sanitize(lecture.title)}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
          <div class="subject-body">
            <h3>${sanitize(lecture.title)}</h3>
            <p>${sanitize(lecture.subject_name || "UPSC")}</p>
          </div>
        </article>
      `
    )
    .join("");
};

const dashboardState = {
  subjects: [],
  topics: [],
  resources: [],
  lectures: []
};

const getSearchItems = () => [
  ...dashboardState.subjects.map((subject) => ({
    type: "Subject",
    title: subject.subject_name,
    meta: subject.description || "Course subject",
    target: "subjectsGrid"
  })),
  ...dashboardState.topics.map((topic) => ({
    type: "Topic",
    title: topic.topic_name,
    meta: topic.subject_name || "Course topic",
    target: "topicsGrid"
  })),
  ...dashboardState.resources.map((resource) => ({
    type: "PDF",
    title: resource.title,
    meta: resource.subject_name || resource.category || "PDF resource",
    target: "resourcesGrid"
  })),
  ...dashboardState.lectures.map((lecture) => ({
    type: "Lecture",
    title: lecture.title,
    meta: lecture.topic_name || lecture.subject_name || "YouTube lecture",
    target: "lecturesGrid"
  }))
];

const renderSearchDropdown = (query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    courseSearchDropdown.classList.remove("is-open");
    courseSearchDropdown.innerHTML = "";
    return;
  }

  const matches = getSearchItems()
    .filter((item) => `${item.title} ${item.meta} ${item.type}`.toLowerCase().includes(normalizedQuery))
    .slice(0, 8);

  courseSearchDropdown.classList.add("is-open");
  courseSearchDropdown.innerHTML = matches.length
    ? matches
        .map(
          (item) => `
            <button class="course-search-option" type="button" data-target="${item.target}">
              <strong>${sanitize(item.title)}</strong>
              <span>${sanitize(item.type)} · ${sanitize(item.meta)}</span>
            </button>
          `
        )
        .join("")
    : `<div class="course-search-empty">No matching courses found.</div>`;
};

const openFirstSearchMatch = (query) => {
  const normalizedQuery = query.trim().toLowerCase();
  const firstMatch = getSearchItems().find((item) =>
    `${item.title} ${item.meta} ${item.type}`.toLowerCase().includes(normalizedQuery)
  );

  if (firstMatch) {
    document.getElementById(firstMatch.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const loadData = async (query = "") => {
  const search = query ? `?q=${encodeURIComponent(query)}` : "";
  try {
    const [subjects, topics, resources, lectures] = await Promise.all([
      fetchJson(`${API_BASE}/subjects${search}`),
      fetchJson(`${API_BASE}/topics${search}`),
      fetchJson(`${API_BASE}/pdfs${search}`),
      fetchJson(`${API_BASE}/lectures${search}`)
    ]);

    dashboardState.subjects = subjects;
    dashboardState.topics = topics;
    dashboardState.resources = resources;
    dashboardState.lectures = lectures;

    renderSubjects(subjects);
    renderTopics(topics);
    renderResources(resources);
    renderLectures(lectures);
    renderSearchDropdown(query);
  } catch (error) {
    console.error("[Frontend] Failed to load UPSC data:", error);
    renderFallbackSubjects();
    topicsGrid.innerHTML = "";
    lecturesGrid.innerHTML = "";
    resourcesGrid.innerHTML = "";
  }
};

globalSearchInput.addEventListener("input", (event) => {
  const query = event.target.value.trim();
  loadData(query);
});

globalSearchInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  openFirstSearchMatch(globalSearchInput.value);
  courseSearchDropdown.classList.remove("is-open");
});

courseSearchDropdown.addEventListener("click", (event) => {
  const option = event.target.closest(".course-search-option");
  if (!option) return;
  document.getElementById(option.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  courseSearchDropdown.classList.remove("is-open");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-panel")) {
    courseSearchDropdown.classList.remove("is-open");
  }
});

globalSearchInput.value = initialSearchQuery;
loadData(initialSearchQuery);
