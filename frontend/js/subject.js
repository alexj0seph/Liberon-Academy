const API_BASE = "https://liberon-academy-production.up.railway.app/api";
const FILE_BASE = "https://liberon-academy-production.up.railway.app";

const params = new URLSearchParams(window.location.search);
const subjectId = params.get("id");
const subjectTitle = document.getElementById("subjectTitle");
const subjectDescription = document.getElementById("subjectDescription");
const subjectPdfsGrid = document.getElementById("subjectPdfsGrid");
const subjectTopicsGrid = document.getElementById("subjectTopicsGrid");
const subjectLecturesGrid = document.getElementById("subjectLecturesGrid");

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

const toFileUrl = (filePath = "") => {
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `${FILE_BASE}${filePath}`;
};

const toEmbedUrl = (url) => {
  if (!url) return "";
  const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  if (idMatch && idMatch[1]) return `https://www.youtube.com/embed/${idMatch[1]}`;
  return "";
};

const renderEmpty = (element, message) => {
  element.innerHTML = `<p class="empty-state">${sanitize(message)}</p>`;
};

const renderPdfs = (pdfs) => {
  const uploadedPdfs = pdfs.filter((pdf) => pdf.file_path);

  if (!uploadedPdfs.length) {
    renderEmpty(subjectPdfsGrid, "No uploaded PDFs found for this subject yet.");
    return;
  }

  subjectPdfsGrid.innerHTML = uploadedPdfs
    .map(
      (pdf) => `
        <article class="card subject-card">
          <div class="subject-header subject-blue">📄</div>
          <div class="subject-body">
            <h3>${sanitize(pdf.title)}</h3>
            <p>${sanitize(pdf.topic_name || pdf.subject_name || "Subject PDF")}</p>
            <div class="topic-actions">
              <a class="topic-action" href="${sanitize(toFileUrl(pdf.file_path))}" target="_blank" rel="noopener noreferrer">Open PDF</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");
};

const renderTopics = (topics) => {
  if (!topics.length) {
    renderEmpty(subjectTopicsGrid, "No topics found for this subject yet.");
    return;
  }

  subjectTopicsGrid.innerHTML = topics
    .map(
      (topic) => `
        <article class="card subject-card">
          <div class="subject-header subject-green">📚</div>
          <div class="subject-body">
            <h3>${sanitize(topic.topic_name)}</h3>
            <p>${sanitize(topic.description || "Topic details will be updated soon.")}</p>
            ${topic.youtube_link ? `<div class="topic-actions"><a class="topic-action" href="${sanitize(topic.youtube_link)}" target="_blank" rel="noopener noreferrer">Watch Topic Video</a></div>` : ""}
          </div>
        </article>
      `
    )
    .join("");
};

const renderLectures = (lectures) => {
  if (!lectures.length) {
    renderEmpty(subjectLecturesGrid, "No YouTube lectures found for this subject yet.");
    return;
  }

  subjectLecturesGrid.innerHTML = lectures
    .map((lecture) => {
      const embedUrl = toEmbedUrl(lecture.youtube_url);
      return `
        <article class="card subject-card lecture-card">
          ${embedUrl ? `<iframe src="${sanitize(embedUrl)}" title="${sanitize(lecture.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : ""}
          <div class="subject-body">
            <h3>${sanitize(lecture.title)}</h3>
            <p>${sanitize(lecture.topic_name || lecture.subject_name || "YouTube Lecture")}</p>
            <div class="topic-actions">
              <a class="topic-action" href="${sanitize(lecture.youtube_url)}" target="_blank" rel="noopener noreferrer">Open YouTube</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

const loadSubject = async () => {
  if (!subjectId) {
    subjectTitle.textContent = "Subject not found";
    subjectDescription.textContent = "Please choose a subject from the UPSC page.";
    renderEmpty(subjectPdfsGrid, "No subject selected.");
    renderEmpty(subjectTopicsGrid, "No subject selected.");
    renderEmpty(subjectLecturesGrid, "No subject selected.");
    return;
  }

  try {
    const [subjects, topics, pdfs, lectures] = await Promise.all([
      fetchJson(`${API_BASE}/subjects`),
      fetchJson(`${API_BASE}/topics?subject_id=${encodeURIComponent(subjectId)}`),
      fetchJson(`${API_BASE}/pdfs?subject_id=${encodeURIComponent(subjectId)}`),
      fetchJson(`${API_BASE}/lectures`)
    ]);

    const subject = subjects.find((item) => String(item.id) === String(subjectId));
    const topicIds = new Set(topics.map((topic) => String(topic.id)));
    const subjectLectures = lectures.filter((lecture) => topicIds.has(String(lecture.topic_id)));

    subjectTitle.textContent = subject?.subject_name || "Subject Resources";
    subjectDescription.textContent = subject?.description || "Browse PDFs, topics, and lectures for this subject.";

    renderPdfs(pdfs);
    renderTopics(topics);
    renderLectures(subjectLectures);
  } catch (error) {
    console.error("[Frontend] Failed to load subject resources:", error);
    subjectDescription.textContent = "Unable to load subject resources right now.";
    renderEmpty(subjectPdfsGrid, "Unable to load PDFs.");
    renderEmpty(subjectTopicsGrid, "Unable to load topics.");
    renderEmpty(subjectLecturesGrid, "Unable to load lectures.");
  }
};

loadSubject();
