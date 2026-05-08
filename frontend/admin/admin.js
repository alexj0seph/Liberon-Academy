const API_BASE = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "/admin-login";
}

const authHeaders = { Authorization: `Bearer ${token}` };

const subjectForm = document.getElementById("subjectForm");
const topicForm = document.getElementById("topicForm");
const resourceForm = document.getElementById("resourceForm");
const logoutBtn = document.getElementById("logoutBtn");

const subjectList = document.getElementById("subjectList");
const topicList = document.getElementById("topicList");
const resourceList = document.getElementById("resourceList");
const topicSubjectSelect = document.getElementById("topicSubjectSelect");

const subjectCount = document.getElementById("subjectCount");
const topicCount = document.getElementById("topicCount");
const resourceCount = document.getElementById("resourceCount");

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const loadDashboardData = async () => {
  try {
    const [subjects, topics, resources] = await Promise.all([
      fetchJson(`${API_BASE}/subjects`),
      fetchJson(`${API_BASE}/topics`),
      fetchJson(`${API_BASE}/resources`)
    ]);

    subjectCount.textContent = subjects.length;
    topicCount.textContent = topics.length;
    resourceCount.textContent = resources.length;

    topicSubjectSelect.innerHTML = subjects
      .map((subject) => `<option value="${subject.id}">${subject.subject_name}</option>`)
      .join("");

    subjectList.innerHTML = subjects
      .map(
        (subject) => `
        <div class="list-item">
          <div>
            <h4>${subject.icon || "📘"} ${subject.subject_name}</h4>
            <p>${subject.description || ""}</p>
          </div>
          <div class="item-actions">
            <button onclick="editSubject(${subject.id}, '${encodeURIComponent(
              subject.subject_name
            )}', '${encodeURIComponent(subject.description || "")}', '${encodeURIComponent(
              subject.icon || ""
            )}')">Edit</button>
            <button class="delete-btn" onclick="deleteSubject(${subject.id})">Delete</button>
          </div>
        </div>
      `
      )
      .join("");

    topicList.innerHTML = topics
      .map(
        (topic) => `
        <div class="list-item">
          <div>
            <h4>${topic.topic_name}</h4>
            <p>${topic.subject_name} | ${topic.description || ""}</p>
          </div>
          <div class="item-actions">
            <button onclick="editTopic(${topic.id}, ${topic.subject_id}, '${encodeURIComponent(
              topic.topic_name
            )}', '${encodeURIComponent(topic.description || "")}', '${encodeURIComponent(
              topic.youtube_link || ""
            )}')">Edit</button>
            <button class="delete-btn" onclick="deleteTopic(${topic.id})">Delete</button>
          </div>
        </div>
      `
      )
      .join("");

    resourceList.innerHTML = resources
      .map(
        (resource) => `
        <div class="list-item">
          <div>
            <h4>${resource.title}</h4>
            <p>${resource.category}</p>
          </div>
          <div class="item-actions">
            <button class="delete-btn" onclick="deleteResource(${resource.id})">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    alert(error.message);
  }
};

subjectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(subjectForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await fetchJson(`${API_BASE}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload)
    });
    subjectForm.reset();
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
});

topicForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(topicForm);

  try {
    await fetchJson(`${API_BASE}/topics`, {
      method: "POST",
      headers: authHeaders,
      body: formData
    });
    topicForm.reset();
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
});

resourceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(resourceForm);

  try {
    await fetchJson(`${API_BASE}/resources`, {
      method: "POST",
      headers: authHeaders,
      body: formData
    });
    resourceForm.reset();
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
});

window.deleteSubject = async (id) => {
  if (!confirm("Delete this subject? All related topics will also be deleted.")) return;
  try {
    await fetchJson(`${API_BASE}/subjects/${id}`, {
      method: "DELETE",
      headers: authHeaders
    });
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
};

window.editSubject = async (id, name, description, icon) => {
  const subject_name = prompt("Update subject name:", decodeURIComponent(name));
  if (!subject_name) return;
  const desc = prompt("Update description:", decodeURIComponent(description));
  const updatedIcon = prompt("Update icon:", decodeURIComponent(icon));

  try {
    await fetchJson(`${API_BASE}/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        subject_name,
        description: desc || "",
        icon: updatedIcon || ""
      })
    });
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
};

window.deleteTopic = async (id) => {
  if (!confirm("Delete this topic?")) return;
  try {
    await fetchJson(`${API_BASE}/topics/${id}`, {
      method: "DELETE",
      headers: authHeaders
    });
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
};

window.editTopic = async (id, subject_id, topic_name, description, youtube_link) => {
  const updatedTopicName = prompt("Update topic name:", decodeURIComponent(topic_name));
  if (!updatedTopicName) return;
  const updatedDescription = prompt("Update description:", decodeURIComponent(description));
  const updatedYoutube = prompt("Update YouTube link:", decodeURIComponent(youtube_link));
  const updatedSubjectId = prompt("Update subject id:", String(subject_id));

  const payload = new FormData();
  payload.append("subject_id", updatedSubjectId);
  payload.append("topic_name", updatedTopicName);
  payload.append("description", updatedDescription || "");
  payload.append("youtube_link", updatedYoutube || "");

  try {
    await fetchJson(`${API_BASE}/topics/${id}`, {
      method: "PUT",
      headers: authHeaders,
      body: payload
    });
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
};

window.deleteResource = async (id) => {
  if (!confirm("Delete this resource?")) return;
  try {
    await fetchJson(`${API_BASE}/resources/${id}`, {
      method: "DELETE",
      headers: authHeaders
    });
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
};

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "/admin-login";
});

loadDashboardData();
