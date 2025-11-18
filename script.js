
// =========================
// Helpers: generic storage
// =========================
function loadFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    console.error("Error loading", key, e);
    return [];
  }
}
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Worksheet helpers
function loadWorksheets() {
  return loadFromStorage("worksheets");
}
function saveWorksheets(data) {
  saveToStorage("worksheets", data);
}

// =========================
// Login
// =========================
function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    // Standard passwords
    const ADMIN_EMAIL = "admin@thinkable.com";
    const ADMIN_PW = "admin123";

    const PARENT_EMAIL = "parent@thinkable.com";
    const PARENT_PW = "parent123";

    const STUDENT_EMAIL = "student@thinkable.com";
    const STUDENT_PW = "student123";

    // ---- Authentication Logic ----
    if (email === ADMIN_EMAIL && password === ADMIN_PW) {
      window.location.href = "admin/home.html";
    }
    else if (email === PARENT_EMAIL && password === PARENT_PW) {
      window.location.href = "parent/home.html";
    }
    else if (email === STUDENT_EMAIL && password === STUDENT_PW) {
      window.location.href = "student/home.html";
    }
    else {
      alert("Invalid login. Please check your email and password.");
    }
  });
}

// ============ STUDENT WORKSHEET SCORING ============

function addStar() {
  let stars = parseInt(localStorage.getItem("stars") || "0");
  stars++;
  localStorage.setItem("stars", stars);
}

function loadStars() {
  let stars = parseInt(localStorage.getItem("stars") || "0");
  const starCount = document.getElementById("starCount");
  if (starCount) starCount.textContent = stars;
}

// Worksheet 1
const ws1Form = document.getElementById("ws1Form");
if (ws1Form) {
  ws1Form.addEventListener("submit", function(e) {
    e.preventDefault();
    addStar();
    document.getElementById("ws1Result").textContent = "✔ Worksheet Completed!";
  });
}

// Worksheet 2
const ws2Form = document.getElementById("ws2Form");
if (ws2Form) {
  ws2Form.addEventListener("submit", function(e) {
    e.preventDefault();
    addStar();
    document.getElementById("ws2Result").textContent = "✔ Worksheet Completed!";
  });
}

// Worksheet 3
const ws3Form = document.getElementById("ws3Form");
if (ws3Form) {
  ws3Form.addEventListener("submit", function(e) {
    e.preventDefault();
    addStar();
    document.getElementById("ws3Result").textContent = "✔ Worksheet Completed!";
  });
}

document.addEventListener("DOMContentLoaded", loadStars);


// =========================
// Admin: Worksheet CRUD (Option B)
// =========================
function renderQuestionRow(container, qText = "", aText = "") {
  const row = document.createElement("div");
  row.className = "question-row";
  row.innerHTML = `
    <div>
      <label>Question</label>
      <textarea class="question-text">${qText}</textarea>
    </div>
    <div>
      <label>Answer</label>
      <input class="question-answer" type="text" value="${aText}">
    </div>
    <div>
      <button type="button" class="btn sm danger remove-question">Remove</button>
    </div>
  `;
  container.appendChild(row);
  row.querySelector(".remove-question").addEventListener("click", () => {
    container.removeChild(row);
  });
}

function collectWorksheetForm(isEdit = false) {
  const title = document.getElementById("ws_title").value.trim();
  const subject = document.getElementById("ws_subject").value.trim();
  const grade = document.getElementById("ws_grade").value.trim();
  const description = document.getElementById("ws_description").value.trim();
  const status = document.getElementById("ws_status").value;

  if (!title || !subject || !grade) {
    alert("Title, Subject and Grade are required.");
    return null;
  }

  const qTexts = Array.from(document.querySelectorAll(".question-text"));
  const aTexts = Array.from(document.querySelectorAll(".question-answer"));

  if (qTexts.length === 0) {
    alert("Please add at least one question.");
    return null;
  }

  const questions = [];
  const answerKey = [];
  qTexts.forEach((el, idx) => {
    const q = el.value.trim();
    const a = aTexts[idx].value.trim();
    if (q) {
      questions.push(q);
      answerKey.push(a || "");
    }
  });

  if (questions.length === 0) {
    alert("Please ensure questions are not empty.");
    return null;
  }

  const now = new Date().toISOString();
  const base = {
    title,
    subject,
    gradeLevel: grade,
    description,
    questions,
    answerKey,
    status, // draft / published
    updatedAt: now
  };
  if (!isEdit) {
    base.id = Date.now();
    base.createdAt = now;
  }
  return base;
}

// Create
function initWorksheetCreate() {
  const form = document.getElementById("worksheetCreateForm");
  if (!form) return;

  const qContainer = document.getElementById("questionsContainer");
  const addBtn = document.getElementById("addQuestionBtn");
  addBtn.addEventListener("click", () => renderQuestionRow(qContainer));
  // Start with one blank row
  renderQuestionRow(qContainer);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const worksheet = collectWorksheetForm(false);
    if (!worksheet) return;

    const worksheets = loadWorksheets();
    worksheets.push(worksheet);
    saveWorksheets(worksheets);
    alert("Worksheet created successfully!");
    window.location.href = "worksheet-read.html";
  });
}

// List / Read
function initWorksheetList() {
  const tableBody = document.getElementById("worksheetTable");
  if (!tableBody) return;

  const worksheets = loadWorksheets();
  if (worksheets.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No worksheets yet. Go to "Create Worksheet" to add one.</td></tr>`;
    return;
  }

  tableBody.innerHTML = worksheets.map(ws => `
    <tr>
      <td>${ws.title}</td>
      <td>${ws.subject}</td>
      <td>${ws.gradeLevel}</td>
      <td><span class="pill">${ws.status || "draft"}</span></td>
      <td>${(ws.questions || []).length}</td>
      <td>
        <button class="btn sm" onclick="openWorksheetEdit(${ws.id})">Edit</button>
        <button class="btn sm danger" onclick="deleteWorksheet(${ws.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

// Update
function openWorksheetEdit(id) {
  localStorage.setItem("editWorksheetId", String(id));
  window.location.href = "worksheet-update.html";
}

function initWorksheetUpdate() {
  const form = document.getElementById("worksheetUpdateForm");
  if (!form) return;

  const editId = localStorage.getItem("editWorksheetId");
  if (!editId) {
    alert("No worksheet selected.");
    window.location.href = "worksheet-read.html";
    return;
  }

  const worksheets = loadWorksheets();
  const ws = worksheets.find(w => String(w.id) === String(editId));
  if (!ws) {
    alert("Worksheet not found.");
    window.location.href = "worksheet-read.html";
    return;
  }

  document.getElementById("ws_title").value = ws.title;
  document.getElementById("ws_subject").value = ws.subject;
  document.getElementById("ws_grade").value = ws.gradeLevel;
  document.getElementById("ws_description").value = ws.description || "";
  document.getElementById("ws_status").value = ws.status || "draft";

  const qContainer = document.getElementById("questionsContainer");
  const addBtn = document.getElementById("addQuestionBtn");
  addBtn.addEventListener("click", () => renderQuestionRow(qContainer));

  (ws.questions || []).forEach((q, idx) => {
    const ans = (ws.answerKey || [])[idx] || "";
    renderQuestionRow(qContainer, q, ans);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const updated = collectWorksheetForm(true);
    if (!updated) return;

    ws.title = updated.title;
    ws.subject = updated.subject;
    ws.gradeLevel = updated.gradeLevel;
    ws.description = updated.description;
    ws.questions = updated.questions;
    ws.answerKey = updated.answerKey;
    ws.status = updated.status;
    ws.updatedAt = updated.updatedAt;

    saveWorksheets(worksheets);
    alert("Worksheet updated.");
    window.location.href = "worksheet-read.html";
  });
}

// Delete
function deleteWorksheet(id) {
  if (!confirm("Delete this worksheet?")) return;
  let worksheets = loadWorksheets();
  worksheets = worksheets.filter(w => w.id !== id);
  saveWorksheets(worksheets);
  alert("Worksheet deleted.");
  if (document.getElementById("worksheetTable")) {
    initWorksheetList();
  } else {
    window.location.href = "worksheet-read.html";
  }
}

// Dummy initialisers for other pages if needed in future
function initAdminHome() {}
function initParentHome() {}
function initStudentHome() {}

// =========================
// Bootstrap
// =========================
document.addEventListener("DOMContentLoaded", function () {
  initLogin();
  initWorksheetCreate();
  initWorksheetList();
  initWorksheetUpdate();
  initAdminHome();
  initParentHome();
  initStudentHome();
});
