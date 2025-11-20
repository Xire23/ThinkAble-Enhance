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

    const ADMIN_EMAIL = "admin@thinkable.com";
    const ADMIN_PW = "admin123";

    const PARENT_EMAIL = "parent@thinkable.com";
    const PARENT_PW = "parent123";

    const STUDENT_EMAIL = "student@thinkable.com";
    const STUDENT_PW = "student123";

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

// =========================
// Dark Mode (global)
// =========================
function applySavedDarkMode() {
  const enabled = localStorage.getItem("darkMode") === "true";
  if (enabled) document.body.classList.add("dark");
}

function toggleDarkMode() {
  const enabled = document.getElementById("darkModeToggle").checked;
  if (enabled) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
  localStorage.setItem("darkMode", enabled);
}

// =========================
// Large Text Mode (global)
// =========================
function applySavedLargeText() {
  const enabled = localStorage.getItem("largeText") === "true";
  if (enabled) document.body.classList.add("largeText");
}

function toggleLargeText() {
  const enabled = document.getElementById("largeTextToggle").checked;
  if (enabled) document.body.classList.add("largeText");
  else document.body.classList.remove("largeText");
  localStorage.setItem("largeText", enabled);
}

// =========================
// Parent PIN Lock
// =========================
function saveParentPIN() {
  const pin = document.getElementById("parentPIN").value;
  if (pin.length !== 4) return alert("PIN must be 4 digits!");
  localStorage.setItem("parentPIN", pin);
  alert("Parent PIN saved!");
}

function verifyParentPIN() {
  const stored = localStorage.getItem("parentPIN");
  let entered = prompt("Enter Parent PIN:");

  if (entered !== stored) {
    alert("Incorrect PIN.");
    window.location.href = "home.html";
  }
}

// =========================
// Subscription System
// =========================
function activateSubscription() {
  localStorage.setItem("subscriptionActive", "true");
  alert("Subscription activated!");
}

function checkSubscriptionLimit() {
  const subscribed = localStorage.getItem("subscriptionActive") === "true";
  const stars = parseInt(localStorage.getItem("stars") || "0");

  if (!subscribed && stars >= 3) {
    alert("Free trial ended. Subscribe to unlock more worksheets.");
    window.location.href = "../parent/home.html";
  }
}

// =========================
// Student Scoring System
// =========================
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

// =========================
// Worksheet Interactions
// =========================

// ---- WORKSHEET 1 ----
if (window.location.pathname.includes("worksheet-1.html")) {
  checkSubscriptionLimit();

  const boxes = document.querySelectorAll(".choice-box");
  boxes.forEach(b => {
    b.addEventListener("click", () => b.classList.toggle("selected"));
  });

  document.getElementById("submitBtn").addEventListener("click", () => {
    let score = 0;
    boxes.forEach(b => {
      if (b.dataset.answer === "true" && b.classList.contains("selected")) {
        score++;
      }
    });

    if (score >= 6) addStar();
    window.location.href = "home.html";
  });
}

// ---- WORKSHEET 2 ----
if (window.location.pathname.includes("worksheet-2.html")) {
  checkSubscriptionLimit();

  const boxes = document.querySelectorAll(".choice-box");
  boxes.forEach(b => {
    b.addEventListener("click", () => b.classList.toggle("selected"));
  });

  document.getElementById("submitBtn").addEventListener("click", () => {
    let score = 0;
    boxes.forEach(b => {
      if (b.dataset.answer === "true" && b.classList.contains("selected")) {
        score++;
      }
    });

    if (score >= 4) addStar();
    window.location.href = "home.html";
  });
}

// ---- WORKSHEET 3 ----
if (window.location.pathname.includes("worksheet-3.html")) {
  checkSubscriptionLimit();

  const answers = { q1: "5", q2: "7", q3: "4", q4: "10", q5: "6" };

  document.getElementById("submitBtn").addEventListener("click", () => {
    let score = 0;
    for (let key in answers) {
      const user = document.getElementById(key).value.trim();
      if (user === answers[key]) score++;
    }

    if (score >= 4) addStar();
    window.location.href = "home.html";
  });
}

// =========================
// Admin: Worksheet CRUD
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
    </div>`;
  
  container.appendChild(row);
  row.querySelector(".remove-question").addEventListener("click", () => row.remove());
}

function collectWorksheetForm(isEdit = false) {
  const title = document.getElementById("ws_title").value.trim();
  const subject = document.getElementById("ws_subject").value.trim();
  const grade = document.getElementById("ws_grade").value.trim();
  const description = document.getElementById("ws_description").value.trim();
  const status = document.getElementById("ws_status").value;

  if (!title || !subject || !grade) {
    alert("Missing required fields.");
    return null;
  }

  const qTexts = [...document.querySelectorAll(".question-text")];
  const aTexts = [...document.querySelectorAll(".question-answer")];

  const questions = qTexts.map(el => el.value.trim());
  const answerKey = aTexts.map(el => el.value.trim());

  const now = new Date().toISOString();

  const result = {
    title, subject, gradeLevel: grade, description,
    questions, answerKey, status, updatedAt: now
  };

  if (!isEdit) {
    result.id = Date.now();
    result.createdAt = now;
  }

  return result;
}

// ---- Create ----
function initWorksheetCreate() {
  const form = document.getElementById("worksheetCreateForm");
  if (!form) return;

  const container = document.getElementById("questionsContainer");
  document.getElementById("addQuestionBtn")
    .addEventListener("click", () => renderQuestionRow(container));

  renderQuestionRow(container);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = collectWorksheetForm(false);
    if (!data) return;

    const worksheets = loadWorksheets();
    worksheets.push(data);
    saveWorksheets(worksheets);

    alert("Worksheet created!");
    window.location.href = "worksheet-read.html";
  });
}

// ---- List ----
function initWorksheetList() {
  const tableBody = document.getElementById("worksheetTable");
  if (!tableBody) return;

  const worksheets = loadWorksheets();
  if (!worksheets.length) {
    tableBody.innerHTML = `<tr><td colspan="6">No worksheets yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML =
    worksheets.map(ws => `
      <tr>
        <td>${ws.title}</td>
        <td>${ws.subject}</td>
        <td>${ws.gradeLevel}</td>
        <td><span class="pill">${ws.status}</span></td>
        <td>${ws.questions.length}</td>
        <td>
          <button class="btn sm" onclick="openWorksheetEdit(${ws.id})">Edit</button>
          <button class="btn sm danger" onclick="deleteWorksheet(${ws.id})">Delete</button>
        </td>
      </tr>
    `).join("");
}

// ---- Edit ----
function openWorksheetEdit(id) {
  localStorage.setItem("editWorksheetId", id);
  window.location.href = "worksheet-update.html";
}

function initWorksheetUpdate() {
  const form = document.getElementById("worksheetUpdateForm");
  if (!form) return;

  const id = localStorage.getItem("editWorksheetId");
  const worksheets = loadWorksheets();
  const ws = worksheets.find(w => w.id == id);

  if (!ws) {
    alert("Worksheet not found.");
    window.location.href = "worksheet-read.html";
    return;
  }

  document.getElementById("ws_title").value = ws.title;
  document.getElementById("ws_subject").value = ws.subject;
  document.getElementById("ws_grade").value = ws.gradeLevel;
  document.getElementById("ws_description").value = ws.description;
  document.getElementById("ws_status").value = ws.status;

  const container = document.getElementById("questionsContainer");
  document.getElementById("addQuestionBtn")
    .addEventListener("click", () => renderQuestionRow(container));

  ws.questions.forEach((q, i) => {
    renderQuestionRow(container, q, ws.answerKey[i]);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = collectWorksheetForm(true);
    Object.assign(ws, updated);
    saveWorksheets(worksheets);

    alert("Worksheet updated.");
    window.location.href = "worksheet-read.html";
  });
}

// ---- Delete ----
function deleteWorksheet(id) {
  if (!confirm("Delete this worksheet?")) return;
  let worksheets = loadWorksheets();
  worksheets = worksheets.filter(w => w.id !== id);
  saveWorksheets(worksheets);
  alert("Deleted.");
  window.location.reload();
}

// =========================
// Page Auto Init
// =========================
document.addEventListener("DOMContentLoaded", function () {
  initLogin();
  initWorksheetCreate();
  initWorksheetList();
  initWorksheetUpdate();
  loadStars();
  applySavedDarkMode();
  applySavedLargeText();
});
