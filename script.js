const light = document.querySelector(".light");
const grid = document.querySelector("#hex-grid");

function moveLight(x, y) {
  light.style.left = `${x}px`;
  light.style.top = `${y}px`;
}

// Mouse movement
grid.addEventListener("mousemove", (e) => {
  moveLight(e.clientX, e.clientY);
});

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

function showForm(formType) {
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.remove("active");
  });
  document.getElementById(`${formType}-form`).classList.add("active");
}
setTimeout(() => {
  document.querySelector(".tagline").classList.add("stop-blink");
}, 1800); // Same as the typing duration

// Backend Connection STARTS

const signupUser = document.querySelector(".signupuser-input");
const signupPass = document.querySelector(".signuppass-input");

const loginUser = document.querySelector(".loginuser-input");
const loginPass = document.querySelector(".loginpass-input");


