"use strict";
// ============================================
// TYPES
// ============================================
// ============================================
// DOM ELEMENTS
// ============================================
const addTaskBtn = document.getElementById("add-task-btn");
const modalOverlay = document.getElementById("modal-overlay");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");
const taskForm = document.getElementById("task-form");
const modalTitle = document.getElementById("modal-title");
const modalIcon = document.getElementById("modal-icon");
const submitBtnText = document.getElementById("submit-btn-text");
const taskTitle = document.getElementById("task-title");
const taskPriority = document.getElementById("task-priority");
const taskDueDate = document.getElementById("task-due-date");
const taskDescription = document.getElementById("task-description");
const titleError = document.getElementById("title-error");
const dateError = document.getElementById("date-error");
const descriptionError = document.getElementById("description-error");
const charCount = document.getElementById("char-count");
const todoContainer = document.getElementById("tasks-todo");
const inProgressContainer = document.getElementById("tasks-in-progress");
const completedContainer = document.getElementById("tasks-completed");
const columns = document.querySelectorAll("[data-status]");
// ============================================
// VARIABLES
// ============================================
let tasks = [];
let editingTaskId = null;
const STORAGE_KEY = "kanban_tasks";
// ============================================
// LOCAL STORAGE
// ============================================
function loadTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (!storedTasks) {
        tasks = [];
        return;
    }
    try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
            tasks = parsedTasks;
        }
        else {
            tasks = [];
        }
    }
    catch (error) {
        console.error("Failed to load tasks:", error);
        tasks = [];
    }
}
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
// ============================================
// MODAL
// ============================================
function openModal() {
    modalOverlay.classList.remove("hidden");
    modalOverlay.classList.add("flex");
    setTimeout(() => {
        taskTitle.focus();
    }, 100);
}
function closeModal() {
    modalOverlay.classList.add("hidden");
    modalOverlay.classList.remove("flex");
    resetForm();
}
function openCreateModal() {
    editingTaskId = null;
    modalTitle.innerHTML = `
    <i class="fa-solid fa-plus-circle text-indigo-500"></i>
    Create New Task
  `;
    modalIcon.className = "fa-solid fa-plus-circle text-indigo-500";
    submitBtnText.textContent = "Add Task";
    taskForm.reset();
    taskPriority.value = "medium";
    clearErrors();
    updateCharacterCount();
    openModal();
}
function openEditModal(task) {
    editingTaskId = task.id;
    modalTitle.innerHTML = `
    <i class="fa-solid fa-pen-to-square text-indigo-500"></i>
    Edit Task
  `;
    modalIcon.className = "fa-solid fa-pen-to-square text-indigo-500";
    submitBtnText.textContent = "Update Task";
    taskTitle.value = task.title;
    taskPriority.value = task.priority;
    taskDueDate.value = task.dueDate;
    taskDescription.value = task.description;
    clearErrors();
    updateCharacterCount();
    openModal();
}
// ============================================
// FORM
// ============================================
function resetForm() {
    taskForm.reset();
    taskPriority.value = "medium";
    editingTaskId = null;
    clearErrors();
    updateCharacterCount();
}
function clearErrors() {
    titleError.textContent = "";
    dateError.textContent = "";
    descriptionError.textContent = "";
    titleError.classList.add("hidden");
    dateError.classList.add("hidden");
    descriptionError.classList.add("hidden");
    taskTitle.classList.remove("border-red-500");
    taskDueDate.classList.remove("border-red-500");
    taskDescription.classList.remove("border-red-500");
}
function showError(element, input, message) {
    element.textContent = message;
    element.classList.remove("hidden");
    input.classList.add("border-red-500");
}
function validateForm() {
    clearErrors();
    let isValid = true;
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const dueDate = taskDueDate.value;
    // Title validation
    if (!title) {
        showError(titleError, taskTitle, "Task title is required.");
        isValid = false;
    }
    else if (title.length < 3) {
        showError(titleError, taskTitle, "Task title must be at least 3 characters.");
        isValid = false;
    }
    // Description validation
    if (description.length > 500) {
        showError(descriptionError, taskDescription, "Description cannot exceed 500 characters.");
        isValid = false;
    }
    // Date validation
    if (dueDate) {
        const selectedDate = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            showError(dateError, taskDueDate, "Due date cannot be in the past.");
            isValid = false;
        }
    }
    return isValid;
}
function updateCharacterCount() {
    const length = taskDescription.value.length;
    charCount.textContent = `${length}/500`;
}
// ============================================
// CREATE
// ============================================
function createTask() {
    const newTask = {
        id: crypto.randomUUID(),
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        priority: taskPriority.value,
        dueDate: taskDueDate.value,
        status: "todo",
        createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closeModal();
}
// ============================================
// UPDATE
// ============================================
function updateTask() {
    if (!editingTaskId)
        return;
    const taskIndex = tasks.findIndex((task) => task.id === editingTaskId);
    if (taskIndex === -1)
        return;
    const oldTask = tasks[taskIndex];
    const updatedTask = {
        ...oldTask,
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        priority: taskPriority.value,
        dueDate: taskDueDate.value,
    };
    tasks[taskIndex] = updatedTask;
    saveTasks();
    renderTasks();
    closeModal();
}
// ============================================
// DELETE
// ============================================
function deleteTask(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (!task)
        return;
    const confirmed = confirm(`Are you sure you want to delete "${task.title}"?`);
    if (!confirmed)
        return;
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
}
// ============================================
// CHANGE STATUS
// ============================================
function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find((task) => task.id === taskId);
    if (!task)
        return;
    task.status = newStatus;
    saveTasks();
    renderTasks();
}
// ============================================
// GET TASKS BY STATUS
// ============================================
function getTasksByStatus(status) {
    return tasks.filter((task) => task.status === status);
}
// ============================================
// FORMAT DATE
// ============================================
function formatDate(date) {
    if (!date)
        return "No due date";
    const dateObject = new Date(`${date}T00:00:00`);
    return dateObject.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
// ============================================
// PRIORITY
// ============================================
function getPriorityClasses(priority) {
    switch (priority) {
        case "low":
            return "bg-emerald-50 text-emerald-600";
        case "medium":
            return "bg-amber-50 text-amber-600";
        case "high":
            return "bg-red-50 text-red-600";
        default:
            return "bg-slate-50 text-slate-600";
    }
}
// ============================================
// CREATE TASK CARD
// ============================================
function createTaskCard(task) {
    const card = document.createElement("div");
    card.className =
        "task-card bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-grab";
    card.dataset.taskId = task.id;
    card.draggable = true;
    card.innerHTML = `
    <div class="flex items-start justify-between gap-3">

      <div class="flex-1 min-w-0">

        <h3 class="font-semibold text-slate-800 break-words">
          ${escapeHtml(task.title)}
        </h3>

        ${task.description
        ? `
              <p class="text-sm text-slate-500 mt-2 break-words">
                ${escapeHtml(task.description)}
              </p>
            `
        : ""}

      </div>

      <div class="relative">

        <button
          class="task-menu-btn w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          type="button"
          title="Task actions"
        >
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>

        <div
          class="task-menu hidden absolute right-0 top-9 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-32 overflow-hidden"
        >

          <button
            type="button"
            class="edit-task-btn w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700"
          >
            <i class="fa-solid fa-pen mr-2"></i>
            Edit
          </button>

          <button
            type="button"
            class="delete-task-btn w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-500"
          >
            <i class="fa-solid fa-trash mr-2"></i>
            Delete
          </button>

        </div>

      </div>

    </div>

    <div class="flex items-center justify-between gap-2 mt-4">

      <span
        class="text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getPriorityClasses(task.priority)}"
      >
        ${task.priority}
      </span>

      ${task.dueDate
        ? `
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <i class="fa-regular fa-calendar"></i>
              ${formatDate(task.dueDate)}
            </span>
          `
        : ""}

    </div>

    <div class="mt-4">

      <select
        class="status-select w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="todo" ${task.status === "todo" ? "selected" : ""}>
          To Do
        </option>

        <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>
          In Progress
        </option>

        <option value="completed" ${task.status === "completed" ? "selected" : ""}>
          Completed
        </option>
      </select>

    </div>
  `;
    addCardEventListeners(card, task);
    return card;
}
// ============================================
// ESCAPE HTML
// Prevent HTML injection
// ============================================
function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}
// ============================================
// CARD EVENTS
// ============================================
function addCardEventListeners(card, task) {
    const menuButton = card.querySelector(".task-menu-btn");
    const menu = card.querySelector(".task-menu");
    const editButton = card.querySelector(".edit-task-btn");
    const deleteButton = card.querySelector(".delete-task-btn");
    const statusSelect = card.querySelector(".status-select");
    // Open / close menu
    menuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        document.querySelectorAll(".task-menu").forEach((otherMenu) => {
            if (otherMenu !== menu) {
                otherMenu.classList.add("hidden");
            }
        });
        menu.classList.toggle("hidden");
    });
    // Edit
    editButton.addEventListener("click", () => {
        menu.classList.add("hidden");
        openEditModal(task);
    });
    // Delete
    deleteButton.addEventListener("click", () => {
        menu.classList.add("hidden");
        deleteTask(task.id);
    });
    // Change status
    statusSelect.addEventListener("change", () => {
        updateTaskStatus(task.id, statusSelect.value);
    });
    // Drag start
    card.addEventListener("dragstart", () => {
        card.classList.add("opacity-50");
        card.dataset.dragging = "true";
    });
    // Drag end
    card.addEventListener("dragend", () => {
        card.classList.remove("opacity-50");
        delete card.dataset.dragging;
    });
}
// ============================================
// RENDER
// ============================================
function renderTasks() {
    renderColumn(todoContainer, getTasksByStatus("todo"));
    renderColumn(inProgressContainer, getTasksByStatus("in-progress"));
    renderColumn(completedContainer, getTasksByStatus("completed"));
    updateTaskCounts();
}
function renderColumn(container, columnTasks) {
    container.innerHTML = "";
    if (columnTasks.length === 0) {
        container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-slate-400">
        <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>

        <p class="text-sm">
          No tasks yet
        </p>

        <p class="text-xs mt-1">
          Click + to add one
        </p>
      </div>
    `;
        return;
    }
    columnTasks.forEach((task) => {
        const card = createTaskCard(task);
        container.appendChild(card);
    });
}
// ============================================
// TASK COUNTS
// ============================================
function updateTaskCounts() {
    columns.forEach((column) => {
        const status = column.dataset.status;
        const count = getTasksByStatus(status).length;
        const countElement = column.querySelector("p.text-xs");
        if (!countElement)
            return;
        countElement.textContent = `${count} ${count === 1 ? "task" : "tasks"}`;
    });
}
// ============================================
// DRAG & DROP
// ============================================
function setupDragAndDrop() {
    columns.forEach((column) => {
        const status = column.dataset.status;
        const container = column.querySelector(`[id^="tasks-"]`);
        if (!container)
            return;
        container.addEventListener("dragover", (event) => {
            event.preventDefault();
            column.classList.add("ring-2", "ring-indigo-300");
        });
        container.addEventListener("dragleave", () => {
            column.classList.remove("ring-2", "ring-indigo-300");
        });
        container.addEventListener("drop", (event) => {
            event.preventDefault();
            column.classList.remove("ring-2", "ring-indigo-300");
            const draggedCard = document.querySelector('[data-dragging="true"]');
            if (!draggedCard)
                return;
            const taskId = draggedCard.dataset.taskId;
            if (!taskId)
                return;
            updateTaskStatus(taskId, status);
        });
    });
}
// ============================================
// CLOSE MENUS WHEN CLICKING OUTSIDE
// ============================================
document.addEventListener("click", () => {
    document.querySelectorAll(".task-menu").forEach((menu) => {
        menu.classList.add("hidden");
    });
});
// ============================================
// EVENTS
// ============================================
// Add task
addTaskBtn.addEventListener("click", () => {
    openCreateModal();
});
// Close modal
closeModalBtn.addEventListener("click", () => {
    closeModal();
});
// Cancel
cancelBtn.addEventListener("click", () => {
    closeModal();
});
// Click outside modal
modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});
// Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (!modalOverlay.classList.contains("hidden")) {
            closeModal();
        }
    }
});
// Character counter
taskDescription.addEventListener("input", () => {
    updateCharacterCount();
});
// Form submit
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = validateForm();
    if (!isValid)
        return;
    if (editingTaskId) {
        updateTask();
    }
    else {
        createTask();
    }
});
function setMinDueDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;
    taskDueDate.min = todayString;
    taskDueDate.value = todayString;
}
// ============================================
// INITIALIZATION
// ============================================
function init() {
    loadTasks();
    renderTasks();
    setupDragAndDrop();
    updateCharacterCount();
    setMinDueDate();
}
init();
