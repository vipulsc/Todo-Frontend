// ✅ Select DOM Elements
const light = document.querySelector(".light");
const grid = document.querySelector("#hex-grid");

// ✅ Move Light Effect (Smooth Performance)
function moveLight(x, y) {
  requestAnimationFrame(() => {
    light.style.left = `${x}px`;
    light.style.top = `${y}px`;
  });
}

// ✅ Mouse movement
grid.addEventListener("mousemove", (e) => moveLight(e.clientX, e.clientY));

// ✅ Touch movement (Prevents Lag)
grid.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  moveLight(touch.clientX, touch.clientY);
});

// ✅ Handle window resize
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

// ✅ General Input Validation
function validateInput(inputElement, errorElement) {
  const value = inputElement.value.trim();

  if (value.includes(" ")) {
    errorElement.textContent = "❌ No spaces allowed!";
    return false;
  }
  if (value === "") {
    errorElement.textContent = "⚠️ This field cannot be empty!";
    return false;
  }

  errorElement.textContent = "";
  return true;
}

// ✅ Password Validation Function
function validatePassword(password, errorElement) {
  const passwordCriteria =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordCriteria.test(password)) {
    errorElement.textContent =
      "❌ Password must be at least 8 characters long with 1 uppercase, 1 lowercase, 1 number, and 1 special character.";
    return false;
  }
  errorElement.textContent = "";
  return true;
}

// ✅ Real-time Validation
document.querySelectorAll(".input-group input").forEach((input) => {
  input.addEventListener("input", function () {
    const errorId = this.id + "-error";
    const errorElement = document.getElementById(errorId);

    if (this.type === "password") {
      validatePassword(this.value, errorElement);
    } else {
      validateInput(this, errorElement);
    }
  });
});

// ✅ Signup & Login Elements
const signupUser = document.getElementById("signup-username");
const signupPass = document.getElementById("signup-password");
const loginUser = document.getElementById("login-username");
const loginPass = document.getElementById("login-password");

const signupBtn = document.querySelector(".submit-btn2");
const loginBtn = document.querySelector(".submit-btn1");

const errorFieldS = document.querySelector(".server-error");
const errorFieldL = document.querySelector(".server-errorL");

// ✅ Validation Check Functions
function isValidSignup() {
  return (
    validateInput(
      signupUser,
      document.getElementById("signup-username-error")
    ) &&
    validatePassword(
      signupPass.value,
      document.getElementById("signup-password-error")
    )
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
    errorFieldS.textContent = "⚠️ Please fix errors before signing up!";
    setTimeout(() => {
      errorFieldS.textContent = "";
    }, 5000);
    return;
  }

  const user = signupUser.value.trim();
  const pass = signupPass.value.trim();

  try {
    const response = await axios.post("https://todotap.onrender.com/signup", {
      username: user,
      password: pass,
    });
    errorFieldS.textContent = "✅ Signup successful! Please log in.";
    setTimeout(() => {
      errorFieldS.textContent = "";
    }, 5000);
    showForm("signin");
  } catch (error) {
    let errorMessage;
    try {
      errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : JSON.stringify(error.response?.data);
    } catch {
      errorMessage = error.message || "Something went wrong";
    }
    errorFieldS.textContent = errorMessage;

    setTimeout(() => {
      errorFieldS.textContent = "";
    }, 5000);
  }
}

// ✅ Backend Call: Login
async function login() {
  if (!isValidLogin()) {
    errorFieldL.textContent = "⚠️ Please fix errors before logging in!";

    setTimeout(() => {
      errorFieldL.textContent = "";
    }, 5000);
    return;
  }

  const user = loginUser.value.trim();
  const pass = loginPass.value.trim();

  try {
    const response = await axios.post("https://todotap.onrender.com/login", {
      username: user,
      password: pass,
    });
    const token = response.data.token;
    localStorage.setItem("authToken", token);

    location.href = "./index.html"; // Redirect on success
  } catch (error) {
    let errorMessage;
    try {
      errorMessage =
        typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : JSON.stringify(error.response?.data?.error);
    } catch {
      errorMessage = error.message || "Something went wrong";
    }
    errorFieldL.textContent = errorMessage;

    setTimeout(() => {
      errorFieldL.textContent = "";
    }, 5000);
  }
}

// ✅ Event Listeners for Signup & Login
signupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  signup();
});

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  login();
});
