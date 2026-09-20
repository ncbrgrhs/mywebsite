const STORAGE_KEY = "bucketlist_items_v1";

let items = [];

const form = document.getElementById("bucket-form");
const listEl = document.getElementById("bucket-list");
const filterEl = document.getElementById("filter");
const statsTextEl = document.getElementById("stats-text");
const progressFillEl = document.getElementById("progress-fill");
const clearCompletedBtn = document.getElementById("clear-completed");

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    items = [];
    return;
  }
  try {
    items = JSON.parse(raw);
  } catch {
    items = [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function addItem(data) {
  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    title: data.title.trim(),
    category: data.category.trim(),
    targetDate: data.targetDate || "",
    notes: data.notes.trim(),
    completed: false,
    createdAt: Date.now()
  };
  items.push(item);
  saveItems();
  render();
}

function deleteItem(id) {
  items = items.filter((i) => i.id !== id);
  saveItems();
  render();
}

function toggleCompleted(id) {
  items = items.map((i) =>
    i.id === id ? { ...i, completed: !i.completed } : i
  );
  saveItems();
  render();
}

function clearCompleted() {
  items = items.filter((i) => !i.completed);
  saveItems();
  render();
}

function getFilteredItems() {
  const filter = filterEl.value;
  if (filter === "active") return items.filter((i) => !i.completed);
  if (filter === "completed") return items.filter((i) => i.completed);
  return items;
}

function renderStats() {
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  statsTextEl.textContent = `${completed} completed / ${total} total`;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressFillEl.style.width = `${percent}%`;
}

function renderList() {
  const filtered = getFilteredItems();
  listEl.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "bucket-item";
    empty.innerHTML =
      '<div class="bucket-item-main"><span class="bucket-title">Nothing here yet.</span><span class="bucket-meta">Add something you’ve always wanted to do.</span></div>';
    listEl.appendChild(empty);
    return;
  }

  filtered
    .sort((a, b) => a.completed - b.completed || a.createdAt - b.createdAt)
    .forEach((item) => {
      const li = document.createElement("li");
      li.className = "bucket-item" + (item.completed ? " completed" : "");

      const check = document.createElement("input");
      check.type = "checkbox";
      check.className = "bucket-check";
      check.checked = item.completed;
      check.addEventListener("change", () => toggleCompleted(item.id));

      const main = document.createElement("div");
      main.className = "bucket-item-main";

      const title = document.createElement("span");
      title.className = "bucket-title";
      title.textContent = item.title;

      const meta = document.createElement("span");
      meta.className = "bucket-meta";
      const parts = [];
      if (item.category) parts.push(item.category);
      if (item.targetDate) parts.push(`Target: ${item.targetDate}`);
      meta.textContent = parts.join(" • ");

      const notes = document.createElement("span");
      notes.className = "bucket-notes";
      notes.textContent = item.notes;

      main.appendChild(title);
      if (parts.length) main.appendChild(meta);
      if (item.notes) main.appendChild(notes);

      const actions = document.createElement("div");
      actions.className = "bucket-actions";

      const delBtn = document.createElement("button");
      delBtn.className = "btn secondary small";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteItem(item.id));

      actions.appendChild(delBtn);

      li.appendChild(check);
      li.appendChild(main);
      li.appendChild(actions);

      listEl.appendChild(li);
    });
}

function render() {
  renderStats();
  renderList();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const targetDate = document.getElementById("targetDate").value;
  const notes = document.getElementById("notes").value;

  if (!title.trim()) {
    alert("Give your bucket list item a title.");
    return;
  }

  addItem({ title, category, targetDate, notes });
  form.reset();
});

filterEl.addEventListener("change", render);
clearCompletedBtn.addEventListener("click", () => {
  if (confirm("Remove all completed items from your list?")) {
    clearCompleted();
  }
});

loadItems();
render();
