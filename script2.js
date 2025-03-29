const logoutBtn = document.querySelector(".logout");
const usernameField = document.querySelector(".username");
const addTaskInput = document.getElementById("task-input");
const addTaskDue = document.querySelector("#due-input");
const addTaskButt = document.querySelector(".add-btn");
const tasksContainer = document.querySelector("#tasks-container");
const filterButtons = document.querySelectorAll(".filter-btn");

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

console.log(tasksContainer);
console.log(addTaskInput);
console.log(addTaskButt);
function init() {
  checkAuth();
  displayUsername();
  fetchTasks();
  //   setupEventListeners();
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
  } catch (error) {}
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
    // Clear inputs after successful submission
    addTaskInput.value = "";
    addTaskDue.value = "";

    // Refresh the task list
    await fetchTasks(currentFilter);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error);
    alert(error.response.data);
  }
}
addTaskButt.addEventListener("click", (event) => {
  event.preventDefault();
  addTask();
});

async function fetchTasks() {
  addTaskInput.textContent = "";
  addTaskDue.value = "";
  const token = localStorage.getItem("authToken");
  try {
    tasksContainer.innerHTML = `
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i> Loading tasks...
      </div>
    `;
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = await axios.get(
      "https://todotap.onrender.com/task/getDetails",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    let tasks = response.data || [];

    if (currentFilter !== "all") {
      tasks = tasks.filter((task) => task.status.toLowerCase() === filter);
    }
    renderTasks(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    tasksContainer.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-circle"></i> Error loading tasks. Please try again.
      </div>
    `;
  }
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

  if (tasks.length === 0) {
    tasksContainer.innerHTML = `
		<div class="no-tasks">
		  <i class="fas fa-check-circle"></i> No tasks found for this filter.
		</div>
	  `;
    return;
  }

  tasksContainer.innerHTML = "";

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task-item");
    taskElement.dataset.status = task.status.toLowerCase();

    taskElement.innerHTML = `
		<div class="task-content">
		  <p class="task-desc">${task.task}</p>
		  <p class="task-due">Due: ${formatDate(task.due)}</p>
		</div>
		<span class="task-status ${task.status.toLowerCase()}">${task.status}</span>
		<div class="task-actions">
      <button class="edit-btn" data-id="${task._id}" title="Edit">
        <i class="fas fa-pencil-alt"></i>
      </button>
      <button class="delete-btn" data-id="${task._id}" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>

	  `;

    tasksContainer.appendChild(taskElement);
  });

  // Add event listeners to dynamically created buttons
  //   document.querySelectorAll(".edit-btn").forEach((btn) => {
  //     btn.addEventListener("click", handleEditClick);
  //   });

  //   document.querySelectorAll(".delete-btn").forEach((btn) => {
  //     btn.addEventListener("click", handleDeleteClick);
  //   });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    checkAuth();
    displayUsername();
    fetchTasks();
  }, 100);
});
