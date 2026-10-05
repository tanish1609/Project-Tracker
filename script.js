// Initial seed data from the task specification[cite: 2]
const defaultProjects = [
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

// Tier 3: Load from localStorage or fall back to seed data[cite: 2]
let projects = JSON.parse(localStorage.getItem("kanban_projects")) || defaultProjects;

const stages = ["Backlog", "In Progress", "Review", "Completed"]; //

// DOM Elements
const form = document.getElementById("add-project-form");
const searchInput = document.getElementById("search-input");

// Save state to localStorage[cite: 2]
function saveProjects() {
  localStorage.setItem("kanban_projects", JSON.stringify(projects));
}

// Render cards into appropriate columns
function renderBoard(filterQuery = "") {
  // Clear columns and reset counters
  stages.forEach(stage => {
    const slug = stage.toLowerCase().replace(/\s+/g, "-");
    const container = document.getElementById(`cards-${slug}`);
    const badge = document.getElementById(`badge-${slug}`);
    if (container) container.innerHTML = "";
    if (badge) badge.textContent = "0";
  });

  // Filter projects by search term (Tier 2)[cite: 2]
  const filtered = projects.filter(p =>
    p.project.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Group and render projects
  stages.forEach(stage => {
    const slug = stage.toLowerCase().replace(/\s+/g, "-");
    const container = document.getElementById(`cards-${slug}`);
    const badge = document.getElementById(`badge-${slug}`);
    const stageProjects = filtered.filter(p => p.status === stage);

    if (badge) badge.textContent = stageProjects.length;

    // Tier 1: Empty state placeholder[cite: 2]
    if (stageProjects.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty-placeholder";
      emptyDiv.textContent = filterQuery ? "No matching projects" : "No projects yet";
      container.appendChild(emptyDiv);
      return;
    }

    stageProjects.forEach(item => {
      const card = document.createElement("article");
      card.className = "card";

      // Tag styling class
      const tagClass = `tag-${item.category.toLowerCase()}`;
      const notesText = item.notes ? item.notes : "No notes added";
      const notesClass = item.notes ? "card-notes" : "card-notes text-muted italic";

      // Determine next stage
      const currentIndex = stages.indexOf(item.status);
      const hasNextStage = currentIndex < stages.length - 1;
      const nextStageName = hasNextStage ? stages[currentIndex + 1] : null;

      card.innerHTML = `
        <div class="card-header">
          <span class="tag ${tagClass}">${item.category}</span>
          <button class="btn-delete" title="Delete Project" onclick="deleteProject(${item.id})">&times;</button>
        </div>
        <h3 class="card-title">${escapeHtml(item.project)}</h3>
        <p class="${notesClass}">${escapeHtml(notesText)}</p>
        <div class="card-actions">
          ${hasNextStage ? `<button class="btn-move" onclick="moveProject(${item.id})">Move &rarr; ${nextStageName}</button>` : `<span class="completed-text">&#10003; Done</span>`}
        </div>
      `;

      container.appendChild(card);
    });
  });
}

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

  projects.push(newProject);
  saveProjects();
  renderBoard(searchInput.value);
  form.reset();
});

// Tier 1: Delete Card[cite: 2]
window.deleteProject = function(id) {
  projects = projects.filter(p => p.id !== id);
  saveProjects();
  renderBoard(searchInput.value);
};

// Tier 2: Move to Next Stage[cite: 2]
window.moveProject = function(id) {
  const target = projects.find(p => p.id === id);
  if (!target) return;

  const currentIndex = stages.indexOf(target.status);
  if (currentIndex < stages.length - 1) {
    target.status = stages[currentIndex + 1];
    saveProjects();
    renderBoard(searchInput.value);
  }
};

// Tier 2: Search Bar[cite: 2]
searchInput.addEventListener("input", (e) => {
  renderBoard(e.target.value);
});

// Helper: Escape text to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

// Initial board render on load
renderBoard();