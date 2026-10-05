// Seed Data provided by specification[cite: 2]
const seedData = [
  {
    id: 1,
    project: "Portfolio Website",
    category: "Web",
    status: "In Progress",
    notes: "Homepage layout done, working on projects section"
  },
  {
    id: 2,
    project: "Poster for Tech Fest",
    category: "Design",
    status: "Backlog",
    notes: ""
  },
  {
    id: 3,
    project: "IoT Weather Station",
    category: "Hardware",
    status: "Review",
    notes: "Sensor calibration pending"
  }
];

const STAGES = ["Backlog", "In Progress", "Review", "Completed"];

// Tier 3: LocalStorage persistence[cite: 2]
let projects = JSON.parse(localStorage.getItem("kanban_app_projects")) || seedData;

// DOM Selectors
const form = document.getElementById("add-project-form");
const searchInput = document.getElementById("search-input");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// State persistence
function persistState() {
  localStorage.setItem("kanban_app_projects", JSON.stringify(projects));
}

// Tier 4: Dark Mode initialization & handler[cite: 2]
function initTheme() {
  const isDark = localStorage.getItem("kanban_theme") === "dark";
  if (isDark) {
    document.body.classList.add("dark-mode");
    themeIcon.innerHTML = "&#9788;"; // Sun icon
  } else {
    document.body.classList.remove("dark-mode");
    themeIcon.innerHTML = "&#9790;"; // Moon icon
  }
}

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  themeIcon.innerHTML = isDark ? "&#9788;" : "&#9790;";
  localStorage.setItem("kanban_theme", isDark ? "dark" : "light");
});

// Tier 3: Update Header Statistics Summary[cite: 2]
function updateStats() {
  document.getElementById("stat-total").textContent = projects.length;
  STAGES.forEach(stage => {
    const slug = stage.toLowerCase().replace(/\s+/g, "-");
    const count = projects.filter(p => p.status === stage).length;
    const statElem = document.getElementById(`stat-${slug}`);
    if (statElem) statElem.textContent = count;
  });
}

// Render Board Engine
function renderBoard(filterQuery = "") {
  // Clear lanes
  STAGES.forEach(stage => {
    const slug = stage.toLowerCase().replace(/\s+/g, "-");
    const lane = document.getElementById(`cards-${slug}`);
    const badge = document.getElementById(`badge-${slug}`);
    if (lane) lane.innerHTML = "";
    if (badge) badge.textContent = "0";
  });

  const query = filterQuery.toLowerCase().trim();
  const visibleProjects = projects.filter(p => p.project.toLowerCase().includes(query));

  STAGES.forEach(stage => {
    const slug = stage.toLowerCase().replace(/\s+/g, "-");
    const dropzone = document.getElementById(`cards-${slug}`);
    const badge = document.getElementById(`badge-${slug}`);
    const stageItems = visibleProjects.filter(p => p.status === stage);

    if (badge) badge.textContent = stageItems.length;

    // Tier 1: Empty state message[cite: 2]
    if (stageItems.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "empty-placeholder";
      placeholder.textContent = query ? "No matching projects" : "No projects yet";
      dropzone.appendChild(placeholder);
      return;
    }

    stageItems.forEach(item => {
      const card = document.createElement("article");
      card.className = "card";
      card.draggable = true; // Tier 3: Drag & Drop[cite: 2]
      card.dataset.id = item.id;

      const tagClass = `tag-${item.category.toLowerCase()}`;
      const noteClass = item.notes ? "card-notes" : "card-notes empty-note";
      const noteText = item.notes ? item.notes : "No notes added yet";

      const currentStageIndex = STAGES.indexOf(item.status);
      const nextStage = currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null;

      card.innerHTML = `
        <div class="card-top">
          <span class="tag ${tagClass}">${item.category}</span>
          <button class="btn-icon-del" onclick="deleteCard(${item.id})" title="Delete card">&times;</button>
        </div>
        <h3 class="card-title">${escapeHtml(item.project)}</h3>
        <p class="${noteClass}">${escapeHtml(noteText)}</p>
        <div class="card-footer">
          ${nextStage ? `<button class="btn-step" onclick="advanceCard(${item.id})">Move &rarr; ${nextStage}</button>` : `<span class="done-badge">&#10003; Completed</span>`}
        </div>
      `;

      // HTML5 Drag and Drop events (Tier 3)[cite: 2]
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", item.id);
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
      });

      dropzone.appendChild(card);
    });
  });

  updateStats();
}

// Tier 3: HTML5 Native Drag & Drop Handlers[cite: 2]
document.querySelectorAll(".lane-dropzone").forEach(dropzone => {
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-hover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("drag-hover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-hover");

    const cardId = parseInt(e.dataTransfer.getData("text/plain"), 10);
    const targetStage = dropzone.closest(".kanban-lane").dataset.stage;

    const item = projects.find(p => p.id === cardId);
    if (item && item.status !== targetStage) {
      item.status = targetStage;
      persistState();
      renderBoard(searchInput.value);
    }
  });
});

// Tier 1: Add Project[cite: 2]
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("project-title").value.trim();
  const category = document.getElementById("project-category").value;
  const status = document.getElementById("project-status").value;
  const notes = document.getElementById("project-notes").value.trim();

  if (!title) return;

  const newProject = {
    id: Date.now(),
    project: title,
    category,
    status,
    notes
  };

  projects.unshift(newProject);
  persistState();
  renderBoard(searchInput.value);
  form.reset();
});

// Tier 1: Delete Project[cite: 2]
window.deleteCard = function(id) {
  projects = projects.filter(p => p.id !== id);
  persistState();
  renderBoard(searchInput.value);
};

// Tier 2: Step to next stage[cite: 2]
window.advanceCard = function(id) {
  const item = projects.find(p => p.id === id);
  if (!item) return;

  const currentIndex = STAGES.indexOf(item.status);
  if (currentIndex < STAGES.length - 1) {
    item.status = STAGES[currentIndex + 1];
    persistState();
    renderBoard(searchInput.value);
  }
};

// Tier 2: Search input filtering[cite: 2]
searchInput.addEventListener("input", (e) => {
  renderBoard(e.target.value);
});

// Tier 4: Cross-tab board synchronization[cite: 2]
window.addEventListener("storage", (e) => {
  if (e.key === "kanban_app_projects") {
    projects = JSON.parse(e.newValue) || [];
    renderBoard(searchInput.value);
  }
});

// Utility: Prevent HTML injection
function escapeHtml(str) {
  const p = document.createElement("p");
  p.innerText = str;
  return p.innerHTML;
}

// App Kickoff
initTheme();
renderBoard();