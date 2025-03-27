// ✅ Select DOM Elements
const light = document.querySelector(".light");
const grid = document.querySelector("#hex-grid");

// ✅ Move Light Effect
function moveLight(x, y) {
  light.style.left = `${x}px`;
  light.style.top = `${y}px`;
}

// Mouse movement
grid.addEventListener("mousemove", (e) => moveLight(e.clientX, e.clientY));

// Touch movement
grid.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  moveLight(touch.clientX, touch.clientY);
});

// Handle window resize
window.addEventListener("resize", () => {
  light.style.left = "50%";
  light.style.top = "50%";
});

// ✅ Stop tagline blinking after 1.8s
setTimeout(() => {
  document.querySelector(".tagline").classList.add("stop-blink");
}, 1800);

// ✅ Toggle Signup/Login Forms
function showForm(formType) {
  document
    .querySelectorAll(".auth-form")
    .forEach((form) => form.classList.remove("active"));
  document.getElementById(`${formType}-form`).classList.add("active");
}

// ✅ Form Validation Function
function validateInput(inputElement, errorElement) {
  const value = inputElement.value;

  if (value.includes(" ")) {
    errorElement.textContent = "❌ No spaces allowed!";
    return false;
  }
  if (value.trim() === "") {
    errorElement.textContent = "⚠️ This field cannot be empty!";
    return false;
  }

  errorElement.textContent = "";
  return true;
}

// ✅ Real-time Validation
document.querySelectorAll(".input-group input").forEach((input) => {
  input.addEventListener("input", function () {
    const errorId = this.id + "-error"; // Get corresponding error ID
    const errorElement = document.getElementById(errorId);
    if (errorElement) validateInput(this, errorElement);
  });
});

// ✅ Signup & Login Elements
const signupUser = document.getElementById("signup-username");
const signupPass = document.getElementById("signup-password");
const loginUser = document.getElementById("login-username");
const loginPass = document.getElementById("login-password");

const signupBtn = document.querySelector(".submit-btn2");
const loginBtn = document.querySelector(".submit-btn1");

// ✅ Validation Check Functions
function isValidSignup() {
  return (
    validateInput(
      signupUser,
      document.getElementById("signup-username-error")
    ) &&
    validateInput(signupPass, document.getElementById("signup-password-error"))
  );
}

function isValidLogin() {
  return (
    validateInput(loginUser, document.getElementById("login-username-error")) &&
    validateInput(loginPass, document.getElementById("login-password-error"))
  );
}

// ✅ Backend Call: Signup
async function signup() {
  if (!isValidSignup()) {
    alert("⚠️ Please fix errors before signing up!");
    return;
  }

  const user = signupUser.value.trim();
  const pass = signupPass.value.trim();

  try {
    const response = await axios.post("https://todotap.onrender.com/signup", {
      username: user,
      password: pass,
    });
    console.log(response.data);
  } catch (error) {
    console.error("Signup failed:", error.response?.data || error.message);
  }
}

// ✅ Backend Call: Login
async function login() {
  if (!isValidLogin()) {
    alert("⚠️ Please fix errors before logging in!");
    return;
  }

  const user = loginUser.value.trim();
  const pass = loginPass.value.trim();

  try {
    const response = await axios.post("https://todotap.onrender.com/login", {
      username: user,
      password: pass,
    });
    console.log(response.data);
    location.href = "./homepage.html";
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
  }
}

// ✅ Event Listeners for Signup & Login
signupBtn.addEventListener("click", () => {
  signup();
});
loginBtn.addEventListener("click", () => {
  login();
});
