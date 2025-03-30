const logoutBtn = document.querySelector(".logout");
const usernameField = document.querySelector(".username");
const addTaskInput = document.getElementById("task-input");
const addTaskDue = document.querySelector("#due-input");
const addTaskButt = document.querySelector(".add-btn");
const tasksContainer = document.querySelector("#tasks-container");
const filterButtons = document.querySelectorAll(".filter-btn");

// Modal elements
const editModal = document.getElementById("edit-modal");
const closeModalBtn = document.querySelector(".close");
const editTaskForm = document.getElementById("edit-task-form");
const editTaskInput = document.getElementById("edit-task-input");
const editStatusInput = document.getElementById("edit-status-input");
const editTaskId = document.getElementById("edit-task-id");

// Global variables
let currentTaskIdToDelete = null;
let currentFilter = "all";

if (filterButtons.length > 0) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => handleFilterClick(button));
  });
}

function handleFilterClick(button) {
  const activeBtn = document.querySelector(".filter-btn.active");
  if (activeBtn) activeBtn.classList.remove("active");
  button.classList.add("active");
  currentFilter = button.dataset.filter;
  fetchTasks(currentFilter);
}

function init() {
  checkAuth();
  displayUsername();
  fetchTasks();
  initThemeToggle(); // Initialize theme toggle functionality
}

function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Please log in first!");
    location.href = "./index.html";
  }
}

async function displayUsername() {
  const token = localStorage.getItem("authToken");
  try {
    const response = await axios.get("https://todotap.onrender.com/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);

    usernameField.textContent = response.data?.username;
  } catch (error) {
    console.error("Error fetching username:", error);
  }
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  location.href = "./index.html";
});

async function addTask() {
  const token = localStorage.getItem("authToken");
  const task = addTaskInput.value;
  const due = addTaskDue.value;

  if (!task) {
    alert("Please enter a task description");
    return;
  }

  try {
    const response = await axios.post(
      "https://todotap.onrender.com/task/newTask",
      { task, due },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.message);

    addTaskInput.value = "";
    addTaskDue.value = "";

    await fetchTasks(currentFilter);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    alert(error.response ? error.response.data : "Error adding task");
  }
}

addTaskButt.addEventListener("click", (event) => {
  event.preventDefault();
  addTask();
});

async function fetchTasks(filter = "all") {
  addTaskInput.textContent = "";
  addTaskDue.value = "";
  const token = localStorage.getItem("authToken");

  tasksContainer.innerHTML = `
    <div class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading tasks...
    </div>
  `;

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await axios.get(
      "https://todotap.onrender.com/task/getDetails",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    let tasks = Array.isArray(response.data) ? response.data : [];

    if (filter !== "all" && filter) {
      tasks = tasks.filter((task) => task.status.toLowerCase() === filter);
    }

    renderTasks(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);

    displayNoTasksMessage();
  }
}

function displayNoTasksMessage() {
  tasksContainer.innerHTML = `
    <div class="no-tasks">
      <p class="nono-task">No 
      <span class="field-name">${
        currentFilter !== "all" ? currentFilter : ""
      } </span>
      tasks currently.</p>
      <p  class="empty-message">Add a new task to get started!</p>
    </div>
  `;
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  try {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch {
    return dateString; // Return raw string if date parsing fails
  }
}

function renderTasks(tasks) {
  if (!tasksContainer) return;

  tasksContainer.innerHTML = "";

  if (!tasks || tasks.length === 0) {
    displayNoTasksMessage();
    return;
  }

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task-item");
    taskElement.dataset.status = task.status.toLowerCase();

    taskElement.innerHTML = `
      <div class="task-content">
        <p class="task-desc">${task.task}</p>
        <p class="task-due">Due: ${formatDate(task.due)}</p>
      </div>
      <span class="task-status ${task.status.toLowerCase()}">${
      task.status
    }</span>
      <div class="task-actions">
        <button class="edit-btn" data-id="${task.taskid}" title="Edit">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="delete-btn" data-id="${task.taskid}" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    tasksContainer.appendChild(taskElement);
  });

  // Add event listeners to dynamically created buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", handleEditClick);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", handleDeleteClick);
  });
}

function handleEditClick(e) {
  const taskId = e.currentTarget.dataset.id;

  const taskElement = e.currentTarget.closest(".task-item");

  const taskDesc = taskElement.querySelector(".task-desc").textContent;
  const taskStatus = taskElement.querySelector(".task-status").textContent;

  editTaskInput.value = taskDesc;
  editStatusInput.value = taskStatus;
  editTaskId.value = taskId;

  editModal.style.display = "block";
}

closeModalBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === editModal) {
    editModal.style.display = "none";
  }
});

// Handle form submission
editTaskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const task = editTaskInput.value;
  const status = editStatusInput.value;
  const taskid = editTaskId.value;

  if (!task) {
    alert("Please enter a task description");
    return;
  }

  await updateTask(taskid, task, status);

  // Close the modal
  editModal.style.display = "none";
});

// Function to update a task
async function updateTask(taskid, task, status) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await axios.put(
      "https://todotap.onrender.com/task/editTask",
      { taskid, task, status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Task updated:", response.data);

    // Refresh the task list
    await fetchTasks(currentFilter);
  } catch (error) {
    console.error(
      "Error updating task:",
      error.response ? error.response.data : error
    );
    alert(error.response ? error.response.data.error : "Failed to update task");
  }
}

// Handle delete button clicks
async function handleDeleteClick(e) {
  const taskId = e.currentTarget.dataset.id;
  if (confirm("Are you sure you want to delete this task?")) {
    await deleteTask(taskId);
  }
}

// Function to delete a task
async function deleteTask(taskid) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await axios.delete(
      "https://todotap.onrender.com/task/delete",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { taskid },
      }
    );

    console.log("Task deleted:", response.data);

    // Refresh the task list
    await fetchTasks(currentFilter);
  } catch (error) {
    console.error(
      "Error deleting task:",
      error.response ? error.response.data : error
    );
    alert(error.response ? error.response.data.error : "Failed to delete task");
  }
}

// Theme toggle functionality
function initThemeToggle() {
  // Create theme toggle button if it doesn't exist
  if (!document.getElementById("theme-toggle")) {
    const rightDiv = document.querySelector(".right");
    if (rightDiv) {
      const themeToggleBtn = document.createElement("button");
      themeToggleBtn.className = "theme-toggle";
      themeToggleBtn.id = "theme-toggle";
      themeToggleBtn.innerHTML = `
        <span class="theme-icon">🌙</span>
        <span class="toggle-text">Light Mode</span>
      `;

      // Insert before logout button
      rightDiv.insertBefore(themeToggleBtn, logoutBtn);
    }
  }

  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    const themeIcon = themeToggle.querySelector(".theme-icon");
    const toggleText = themeToggle.querySelector(".toggle-text");

    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);

    // Update button appearance based on current theme
    updateToggleButton(savedTheme);

    // Toggle theme when button is clicked
    themeToggle.addEventListener("click", function () {
      const currentTheme = document.body.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      // Update theme
      document.body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);

      // Update button appearance
      updateToggleButton(newTheme);
    });
  }

  // Function to ensure task descriptions don't break layout
  setTimeout(updateTaskDescriptions, 1000);
}

function updateToggleButton(theme) {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  const themeIcon = themeToggle.querySelector(".theme-icon");
  const toggleText = themeToggle.querySelector(".toggle-text");

  if (theme === "dark") {
    themeIcon.textContent = "🌙";
    toggleText.textContent = "Light Mode";
  } else {
    themeIcon.textContent = "☀️";
    toggleText.textContent = "Dark Mode";
  }
}

function updateTaskDescriptions() {
  const taskDescs = document.querySelectorAll(".task-desc");
  taskDescs.forEach((desc) => {
    if (desc.scrollWidth > desc.clientWidth) {
      desc.title = desc.textContent;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    checkAuth();
    displayUsername();
    fetchTasks();
    initThemeToggle(); // Initialize theme toggle
  }, 100);
});
