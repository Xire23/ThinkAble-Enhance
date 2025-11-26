const toolbarItems = document.querySelectorAll(".tool-item");
const canvas = document.getElementById("canvas");
let blockId = 0;

// Allow toolbar items to be dragged
toolbarItems.forEach(item => {
  item.addEventListener("dragstart", e => {
    e.dataTransfer.setData("type", item.dataset.type);
  });
});

// Allow canvas drop
canvas.addEventListener("dragover", e => e.preventDefault());
canvas.addEventListener("drop", e => {
  e.preventDefault();
  const type = e.dataTransfer.getData("type");
  addBlock(type);
});

function addBlock(type) {
  const id = "block-" + (blockId++);
  const div = document.createElement("div");
  div.className = "builder-block";
  div.dataset.type = type;
  div.id = id;

  div.innerHTML = `
    <div class="block-header">
      <span class="block-handle">☰</span>
      <span class="block-remove" onclick="removeBlock('${id}')">✖</span>
    </div>
    ${renderBlockContent(type)}
  `;

  canvas.appendChild(div);
}

function renderBlockContent(type) {
  switch(type) {
    case "title":
      return `<input class="block-title" placeholder="Section title...">`;
    case "text":
      return `<input class="block-question" placeholder="Enter question...">`;
    case "blank":
      return `<input class="block-question" placeholder="Fill in the blank question...">`;
    case "number":
      return `<input class="block-question" placeholder="Enter number question...">`;
    case "tf":
      return `
        <input class="block-question" placeholder="True/False question...">
        <select class="block-answer">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>`;
    case "mcq":
      return `
        <input class="block-question" placeholder="Question...">
        <input class="block-option" placeholder="Option A">
        <input class="block-option" placeholder="Option B">
        <input class="block-option" placeholder="Option C">
        <input class="block-option" placeholder="Option D">
        <input class="block-answer" placeholder="Correct answer letter (A/B/C/D)">
      `;
  }
}

function removeBlock(id) {
  document.getElementById(id).remove();
}

// Save worksheet
document.getElementById("saveWorksheetBtn").addEventListener("click", () => {
  const title = document.getElementById("wsTitle").value;
  const desc = document.getElementById("wsDesc").value;

  const blocks = [...document.querySelectorAll(".builder-block")];

  const content = blocks.map(b => {
    let type = b.dataset.type;

    switch(type) {
      case "title":
        return {
          type: "title",
          text: b.querySelector(".block-title").value
        };
      case "text":
      case "blank":
      case "number":
        return {
          type,
          question: b.querySelector(".block-question").value
        };
      case "tf":
        return {
          type: "truefalse",
          question: b.querySelector(".block-question").value,
          answer: b.querySelector(".block-answer").value
        };
      case "mcq":
        return {
          type: "mcq",
          question: b.querySelector(".block-question").value,
          options: [...b.querySelectorAll(".block-option")].map(o => o.value),
          answer: b.querySelector(".block-answer").value
        };
    }
  });

  const worksheet = {
    id: Date.now(),
    title,
    desc,
    content
  };

  // Save to localStorage
  const list = JSON.parse(localStorage.getItem("wsList") || "[]");
  list.push(worksheet);
  localStorage.setItem("wsList", JSON.stringify(list));

  alert("Worksheet saved!");
  window.location.href = "worksheet-read.html";
});
