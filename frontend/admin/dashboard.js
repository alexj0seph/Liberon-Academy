const API_BASE = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "/admin/login";
}

const authHeaders = { Authorization: `Bearer ${token}` };

const subjectForm = document.getElementById("subjectForm");
const topicForm = document.getElementById("topicForm");
const pdfForm = document.getElementById("pdfForm");
const lectureForm = document.getElementById("lectureForm");
const logoutBtn = document.getElementById("logoutBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileBackdrop = document.getElementById("mobileBackdrop");
const adminSearch = document.getElementById("adminSearch");
const adminSearchDropdown = document.getElementById("adminSearchDropdown");
const toastRoot = document.getElementById("toastRoot");

const subjectList = document.getElementById("subjectList");
const topicList = document.getElementById("topicList");
const pdfList = document.getElementById("pdfList");
const lectureList = document.getElementById("lectureList");
const topicSubjectSelect = document.getElementById("topicSubjectSelect");
const pdfSubjectSelect = document.getElementById("pdfSubjectSelect");
const pdfTopicSelect = document.getElementById("pdfTopicSelect");
const lectureTopicSelect = document.getElementById("lectureTopicSelect");

const subjectCount = document.getElementById("subjectCount");
const topicCount = document.getElementById("topicCount");
const pdfCount = document.getElementById("pdfCount");
const lectureCount = document.getElementById("lectureCount");
const messageMap = {
  subject: document.getElementById("subjectMessage"),
  topic: document.getElementById("topicMessage"),
  pdf: document.getElementById("pdfMessage"),
  lecture: document.getElementById("lectureMessage")
};

let dashboardState = {
  subjects: [],
  topics: [],
  pdfs: [],
  lectures: []
};

const logout = () => {
  localStorage.removeItem("adminToken");
  window.location.href = "/admin/login";
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) logout();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const youtubeId = (url = "") => {
  const match = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/i);
  return match ? match[1] : "";
};

const showToast = (message, type = "success") => {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastRoot.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
};

const setFormState = (form, key, isLoading, message = "") => {
  const submitBtn = form.querySelector('button[type="submit"]');
  form.classList.toggle("is-loading", isLoading);
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Saving..." : submitBtn.dataset.label;
  if (messageMap[key]) messageMap[key].textContent = message;
};

const setLoadingLists = () => {
  const skeleton = Array.from({ length: 3 }, () => '<div class="skeleton-row"></div>').join("");
  subjectList.innerHTML = skeleton;
  topicList.innerHTML = skeleton;
  pdfList.innerHTML = skeleton;
  lectureList.innerHTML = skeleton;
};

const emptyState = (title, text) => `
  <div class="empty-state">
    <strong>${title}</strong>
    <span>${text}</span>
  </div>
`;

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("adminTheme", theme);
  themeToggleBtn.textContent = theme === "light" ? "☾" : "☀";
};

const loadTheme = () => applyTheme(localStorage.getItem("adminTheme") || "light");

themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current === "light" ? "dark" : "light");
});

document.querySelectorAll(".admin-form button[type='submit']").forEach((button) => {
  button.dataset.label = button.textContent;
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    document.body.classList.remove("sidebar-open");
  });
});

mobileMenuBtn.addEventListener("click", () => document.body.classList.add("sidebar-open"));
mobileBackdrop.addEventListener("click", () => document.body.classList.remove("sidebar-open"));

const updateSelects = () => {
  const { subjects, topics } = dashboardState;
  const subjectOptions = subjects.map((subject) => `<option value="${subject.id}">${escapeHtml(subject.title || subject.subject_name)}</option>`).join("");
  const topicOptions = topics.map((topic) => `<option value="${topic.id}">${escapeHtml(topic.title || topic.topic_name)} — ${escapeHtml(topic.subject_title || topic.subject_name || "")}</option>`).join("");

  topicSubjectSelect.innerHTML = subjectOptions || '<option value="">Create a subject first</option>';
  pdfSubjectSelect.innerHTML = subjectOptions || '<option value="">Create a subject first</option>';
  pdfTopicSelect.innerHTML = `<option value="">No topic</option>${topicOptions}`;
  lectureTopicSelect.innerHTML = topicOptions || '<option value="">Create a topic first</option>';
};

const renderSubjects = (subjects) => {
  subjectList.innerHTML = subjects.length
    ? subjects
        .map((subject) => `
        <article class="subject-card" data-search="${escapeHtml(`${subject.title || subject.subject_name} ${subject.description || ""}`)}" style="--subject-color:${escapeHtml(subject.color || "#1f45b5")}">
          <div class="subject-card-top">
            <span class="subject-icon">${escapeHtml(subject.icon || "📘")}</span>
            <span class="status-pill">Published</span>
          </div>
          <h4>${escapeHtml(subject.title || subject.subject_name)}</h4>
          <p>${escapeHtml(subject.description || "No description added yet.")}</p>
          <div class="item-actions">
            <button onclick="editSubject(${subject.id}, '${encodeURIComponent(subject.title || subject.subject_name)}', '${encodeURIComponent(subject.description || "")}', '${encodeURIComponent(subject.icon || "")}', '${encodeURIComponent(subject.color || "#1f45b5")}')">Edit</button>
            <button class="delete-btn" onclick="deleteSubject(${subject.id})">Delete</button>
          </div>
        </article>
      `)
        .join("")
    : emptyState("No subjects yet", "Create your first subject to start organizing content.");
};

const renderTable = (rows, columns, emptyTitle, emptyText) => {
  if (!rows.length) return emptyState(emptyTitle, emptyText);
  return `
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr>${columns.map((column) => `<th>${column.label}</th>`).join("")}<th>Actions</th></tr></thead>
        <tbody>${rows
          .map((row) => `
          <tr data-search="${escapeHtml(row.search)}">
            ${columns.map((column) => `<td>${column.render(row.item)}</td>`).join("")}
            <td><div class="item-actions">${row.actions}</div></td>
          </tr>
        `)
          .join("")}</tbody>
      </table>
    </div>
  `;
};

const renderLectures = (lectures) => {
  lectureList.innerHTML = lectures.length
    ? `<div class="lecture-grid">${lectures
        .map((lecture) => {
          const id = youtubeId(lecture.youtube_url);
          const embed = id ? `https://www.youtube.com/embed/${id}` : "";
          return `
            <article class="lecture-card" data-search="${escapeHtml(`${lecture.title} ${lecture.topic_title || lecture.topic_name || ""} ${lecture.youtube_url || ""}`)}">
              ${embed ? `<iframe src="${embed}" title="${escapeHtml(lecture.title)}" loading="lazy" allowfullscreen></iframe>` : `<img src="${escapeHtml(lecture.thumbnail || "")}" alt="${escapeHtml(lecture.title)}" />`}
              <div>
                <span class="status-pill">${escapeHtml(lecture.topic_title || lecture.topic_name || "Topic")}</span>
                <h4>${escapeHtml(lecture.title)}</h4>
                <a class="topic-action" href="${escapeHtml(lecture.youtube_url)}" target="_blank" rel="noopener noreferrer">Open YouTube</a>
              </div>
              <div class="item-actions">
                <button onclick="editLecture(${lecture.id}, ${lecture.topic_id || "null"}, '${encodeURIComponent(lecture.title)}', '${encodeURIComponent(lecture.youtube_url)}')">Edit</button>
                <button class="delete-btn" onclick="deleteLecture(${lecture.id})">Delete</button>
              </div>
            </article>
          `;
        })
        .join("")}</div>`
    : emptyState("No lectures yet", "Add YouTube lectures to enrich each topic.");
};

const renderDashboard = () => {
  const { subjects, topics, pdfs, lectures } = dashboardState;
  updateSelects();
  renderSubjects(subjects);

  topicList.innerHTML = renderTable(
    topics.map((topic) => ({
      item: topic,
      search: `${topic.title || topic.topic_name} ${topic.subject_title || topic.subject_name || ""} ${topic.description || ""}`,
      actions: `
        <button onclick="editTopic(${topic.id}, ${topic.subject_id}, '${encodeURIComponent(topic.title || topic.topic_name)}', '${encodeURIComponent(topic.description || "")}', '${encodeURIComponent(topic.youtube_link || "")}', ${topic.order_index || 0})">Edit</button>
        <button class="delete-btn" onclick="deleteTopic(${topic.id})">Delete</button>
      `
    })),
    [
      { label: "Topic", render: (topic) => `<strong>${escapeHtml(topic.title || topic.topic_name)}</strong>` },
      { label: "Subject", render: (topic) => escapeHtml(topic.subject_title || topic.subject_name || "General") },
      { label: "Order", render: (topic) => escapeHtml(topic.order_index ?? 0) },
      { label: "Description", render: (topic) => escapeHtml(topic.description || "No description") }
    ],
    "No topics yet",
    "Add topics under a subject to build the curriculum."
  );

  pdfList.innerHTML = renderTable(
    pdfs.map((pdf) => ({
      item: pdf,
      search: `${pdf.title} ${pdf.subject_title || pdf.subject_name || ""} ${pdf.topic_title || pdf.topic_name || ""}`,
      actions: `<button class="delete-btn" onclick="deletePdf(${pdf.id})">Delete</button>`
    })),
    [
      { label: "PDF", render: (pdf) => `<strong>${escapeHtml(pdf.title)}</strong>` },
      { label: "Subject", render: (pdf) => escapeHtml(pdf.subject_title || pdf.subject_name || "Unassigned") },
      { label: "Topic", render: (pdf) => escapeHtml(pdf.topic_title || pdf.topic_name || "No topic") },
      {
        label: "File",
        render: (pdf) =>
          pdf.file_path
            ? `<a class="topic-action" href="${escapeHtml(pdf.file_path)}" target="_blank" rel="noopener noreferrer">View PDF</a>`
            : '<span class="soon">Not uploaded</span>'
      }
    ],
    "No PDFs uploaded",
    "Upload notes, PYQs, and learning resources for students."
  );

  renderLectures(lectures);
};

const getAdminSearchItems = () => [
  ...dashboardState.subjects.map((subject) => ({
    type: "Subject",
    title: subject.title || subject.subject_name,
    meta: subject.description || "Course subject",
    target: "subjects"
  })),
  ...dashboardState.topics.map((topic) => ({
    type: "Topic",
    title: topic.title || topic.topic_name,
    meta: topic.subject_title || topic.subject_name || "Course topic",
    target: "topics"
  })),
  ...dashboardState.pdfs.map((pdf) => ({
    type: "PDF",
    title: pdf.title,
    meta: pdf.subject_title || pdf.subject_name || pdf.category || "PDF resource",
    target: "pdfs"
  })),
  ...dashboardState.lectures.map((lecture) => ({
    type: "Lecture",
    title: lecture.title,
    meta: lecture.topic_title || lecture.topic_name || lecture.subject_name || "YouTube lecture",
    target: "lectures"
  }))
];

const getAdminSearchMatches = (query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  return getAdminSearchItems()
    .filter((item) => `${item.title} ${item.meta} ${item.type}`.toLowerCase().includes(normalizedQuery))
    .slice(0, 8);
};

const renderAdminSearchDropdown = (query) => {
  if (!query.trim()) {
    adminSearchDropdown.classList.remove("is-open");
    adminSearchDropdown.innerHTML = "";
    return;
  }

  const matches = getAdminSearchMatches(query);
  adminSearchDropdown.classList.add("is-open");
  adminSearchDropdown.innerHTML = matches.length
    ? matches
        .map(
          (item) => `
            <button class="admin-search-option" type="button" data-target="${item.target}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.type)} · ${escapeHtml(item.meta)}</span>
            </button>
          `
        )
        .join("")
    : `<div class="admin-search-empty">No matching content found.</div>`;
};

const openAdminSearchTarget = (target) => {
  if (!target) return;
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelectorAll(".nav-link").forEach((item) => item.classList.toggle("active", item.getAttribute("href") === `#${target}`));
  adminSearchDropdown.classList.remove("is-open");
};

const loadDashboardData = async () => {
  try {
    setLoadingLists();
    const [subjects, topics, pdfs, lectures, stats] = await Promise.all([
      fetchJson(`${API_BASE}/subjects`),
      fetchJson(`${API_BASE}/topics`),
      fetchJson(`${API_BASE}/pdfs`),
      fetchJson(`${API_BASE}/lectures`),
      fetchJson(`${API_BASE}/stats`, { headers: authHeaders })
    ]);

    subjectCount.textContent = stats.subjects ?? subjects.length;
    topicCount.textContent = stats.topics ?? topics.length;
    pdfCount.textContent = stats.pdfs ?? pdfs.length;
    lectureCount.textContent = stats.lectures ?? lectures.length;

    dashboardState = { subjects, topics, pdfs, lectures };
    renderDashboard();
  } catch (error) {
    showToast(error.message, "error");
  }
};

subjectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(subjectForm).entries());
  payload.title = payload.subject_name;
  try {
    setFormState(subjectForm, "subject", true);
    await fetchJson(`${API_BASE}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload)
    });
    subjectForm.reset();
    subjectForm.elements.color.value = "#1f45b5";
    await loadDashboardData();
    showToast("Subject saved successfully");
  } catch (error) {
    messageMap.subject.textContent = error.message;
    showToast(error.message, "error");
  } finally {
    setFormState(subjectForm, "subject", false);
  }
});

topicForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(topicForm).entries());
  payload.title = payload.topic_name;
  try {
    setFormState(topicForm, "topic", true);
    await fetchJson(`${API_BASE}/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload)
    });
    topicForm.reset();
    topicForm.elements.order_index.value = 0;
    await loadDashboardData();
    showToast("Topic saved successfully");
  } catch (error) {
    messageMap.topic.textContent = error.message;
    showToast(error.message, "error");
  } finally {
    setFormState(topicForm, "topic", false);
  }
});

pdfForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(pdfForm);
  try {
    setFormState(pdfForm, "pdf", true);
    await fetchJson(`${API_BASE}/pdfs`, {
      method: "POST",
      headers: authHeaders,
      body: formData
    });
    pdfForm.reset();
    await loadDashboardData();
    showToast("PDF uploaded successfully");
  } catch (error) {
    messageMap.pdf.textContent = error.message;
    showToast(error.message, "error");
  } finally {
    setFormState(pdfForm, "pdf", false);
  }
});

lectureForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(lectureForm).entries());
  try {
    setFormState(lectureForm, "lecture", true);
    await fetchJson(`${API_BASE}/lectures`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload)
    });
    lectureForm.reset();
    await loadDashboardData();
    showToast("Lecture added successfully");
  } catch (error) {
    messageMap.lecture.textContent = error.message;
    showToast(error.message, "error");
  } finally {
    setFormState(lectureForm, "lecture", false);
  }
});

window.deleteSubject = async (id) => {
  if (!confirm("Delete this subject? Related topics, PDFs, and lectures may also be affected.")) return;
  try {
    await fetchJson(`${API_BASE}/subjects/${id}`, { method: "DELETE", headers: authHeaders });
    await loadDashboardData();
    showToast("Subject deleted");
  } catch (error) {
    showToast(error.message, "error");
  }
};

window.deleteTopic = async (id) => {
  if (!confirm("Delete this topic? Related lectures will also be deleted.")) return;
  try {
    await fetchJson(`${API_BASE}/topics/${id}`, { method: "DELETE", headers: authHeaders });
    await loadDashboardData();
    showToast("Topic deleted");
  } catch (error) {
    showToast(error.message, "error");
  }
};

window.deletePdf = async (id) => {
  if (!confirm("Delete this PDF entry?")) return;
  try {
    await fetchJson(`${API_BASE}/pdfs/${id}`, { method: "DELETE", headers: authHeaders });
    await loadDashboardData();
    showToast("PDF deleted");
  } catch (error) {
    showToast(error.message, "error");
  }
};

window.deleteLecture = async (id) => {
  if (!confirm("Delete this lecture?")) return;
  try {
    await fetchJson(`${API_BASE}/lectures/${id}`, { method: "DELETE", headers: authHeaders });
    await loadDashboardData();
    showToast("Lecture deleted");
  } catch (error) {
    showToast(error.message, "error");
  }
};

window.editSubject = async (id, name, description, icon, color) => {
  const subject_name = prompt("Subject name:", decodeURIComponent(name));
  if (!subject_name) return;
  const updatedDescription = prompt("Description:", decodeURIComponent(description));
  const updatedIcon = prompt("Icon:", decodeURIComponent(icon));
  const updatedColor = prompt("Color:", decodeURIComponent(color));

  try {
    await fetchJson(`${API_BASE}/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ title: subject_name, subject_name, description: updatedDescription || "", icon: updatedIcon || "", color: updatedColor || "#1f45b5" })
    });
    await loadDashboardData();
    showToast("Subject updated");
  } catch (error) {
    showToast(error.message, "error");
  }
};

window.editTopic = async (id, subjectId, topicName, description, youtubeLink, orderIndex) => {
  const updatedTopicName = prompt("Topic name:", decodeURIComponent(topicName));
  if (!updatedTopicName) return;
  const updatedDescription = prompt("Description:", decodeURIComponent(description));
  const updatedYoutube = prompt("YouTube link:", decodeURIComponent(youtubeLink));
  const updatedOrder = prompt("Order index:", String(orderIndex ?? 0));
  const updatedSubject = prompt("Subject ID:", String(subjectId));

  try {
    await fetchJson(`${API_BASE}/topics/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ subject_id: Number(updatedSubject), title: updatedTopicName, topic_name: updatedTopicName, description: updatedDescription || "", youtube_link: updatedYoutube || "", order_index: Number(updatedOrder) || 0 })
    });
    await loadDashboardData();
    showToast("Topic updated");
  } catch (error) {
    showToast(error.message, "error");
  }
};

window.editLecture = async (id, topicId, title, url) => {
  const updatedTitle = prompt("Lecture title:", decodeURIComponent(title));
  if (!updatedTitle) return;
  const updatedUrl = prompt("YouTube URL:", decodeURIComponent(url));
  const updatedTopic = prompt("Topic ID:", String(topicId ?? ""));

  try {
    await fetchJson(`${API_BASE}/lectures/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ topic_id: Number(updatedTopic), title: updatedTitle, youtube_url: updatedUrl })
    });
    await loadDashboardData();
    showToast("Lecture updated");
  } catch (error) {
    showToast(error.message, "error");
  }
};

logoutBtn.addEventListener("click", logout);

adminSearch.addEventListener("input", () => {
  const query = adminSearch.value.trim().toLowerCase();
  document.querySelectorAll("[data-search]").forEach((item) => {
    item.classList.toggle("is-hidden", !item.dataset.search.toLowerCase().includes(query));
  });
  renderAdminSearchDropdown(adminSearch.value);
});

adminSearch.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const firstMatch = getAdminSearchMatches(adminSearch.value)[0];
  openAdminSearchTarget(firstMatch?.target);
});

adminSearchDropdown.addEventListener("mousedown", (event) => {
  const option = event.target.closest(".admin-search-option");
  if (!option) return;
  event.preventDefault();
  openAdminSearchTarget(option.dataset.target);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".admin-search-shell")) {
    adminSearchDropdown.classList.remove("is-open");
  }
});

loadTheme();
loadDashboardData();
