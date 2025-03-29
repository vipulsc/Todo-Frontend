const logoutBtn = document.querySelector(".logout");
const usernameField = document.querySelector(".username");

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

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    checkAuth();
    displayUsername();
  }, 100);
});
