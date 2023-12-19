/*=========================================================================================================================================*/
const backendUrl =
  "https://4c38-158-62-75-82.ngrok-free.app/Final-backend/public/api/";

function login(event) {
  event.preventDefault();

  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");

  var formData = new FormData();
  formData.append("username", document.getElementById("username").value);
  formData.append("password", document.getElementById("password").value);

  const userType = document.getElementById("userType").value;

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formData,
    redirect: "follow",
  };

  let endpoint = "";
  if (userType === "customer") {
    endpoint = backendUrl + "customerlogin";
  } else if (userType === "staff") {
    endpoint = backendUrl + "restaurantownerlogin";
  }
  localStorage.setItem("userType", userType);
  fetch(endpoint, requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Login failed");
      }
    })
    .then((data) => {
      if ((data.token, userType == "customer")) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("customer_id", data.customer.id);
        fetchRestaurants();
        window.location.href = "main.html";
      } else if ((data.token && data.restaurantowner.id, userType == "staff")) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("owner_id", data.restaurantowner.id);
        fetchOwnerRestaurants();
        window.location.href = "owner.html";
      } else {
        throw new Error("Token not found in response");
      }
    })
    .catch((error) => {
      alert("Login failed. Please check your credentials.");
      console.log("error", error);
    });
}

function logout() {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(backendUrl + "logout", requestOptions)
    .then((response) => {
      localStorage.removeItem("token");
      localStorage.removeItem("owner_id");
      localStorage.removeItem("userType");
      window.location.href = "index.html";
    })
    .catch((error) => console.log("error", error));
}

async function signup(event) {
  event.preventDefault();

  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");

  const firstName = document.getElementById("firstname").value;
  const lastName = document.getElementById("lastname").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("signupPassword").value;
  const userType = document.getElementById("userType").value;

  const formData = new FormData();
  formData.append("firstname", firstName);
  formData.append("lastname", lastName);
  formData.append("email", email);
  formData.append("username", username);
  formData.append("password", password);

  let endpoint = "";
  if (userType === "customer") {
    endpoint = backendUrl + "customer";
  } else if (userType === "restaurant owner") {
    endpoint = backendUrl + "restaurantowner";
  }

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formData,
    redirect: "follow",
  };

  try {
    const response = await fetch(endpoint, requestOptions);

    if (!response.ok) {
      const text = await response.text();
      console.log(text);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    alert("Signup successful!");
    window.location.href = "index.html";
    // Handle successful response
  } catch (error) {
    alert("Signup failed. Please try again.");
    console.error("Error:", error);
    // Handle specific error message or show a generic error to the user
  }
}

// Rest of your code remains unchanged...

function checkLoggedIn() {
  const token = localStorage.getItem("token");
  return token !== null && token !== undefined;
}

function handleAccessControl() {
  const currentPage = window.location.pathname.split("/").pop();
  const tokenExists = checkLoggedIn();

  console.log("Token Exists:", tokenExists);
  console.log("Current Page:", currentPage);

  if (!tokenExists && currentPage !== "index.html") {
    console.log("User not logged in. Redirecting to login...");
    window.location.href = "index.html";
  }
}

/*=========================================================================================================================================*/

document.addEventListener("DOMContentLoaded", function () {
  const userType = localStorage.getItem("userType");
  const currentPage = window.location.pathname.split("/").pop();

  console.log("User Type:", userType);
  console.log("Current Page:", currentPage);

  // Define allowed pages for different user types
  const allowedPages = {
    customer: ["main.html", "reservation.html"],
    staff: ["restaurant.html", "owner.html", "restaurantreservations.html"],
    null: ["index.html", "signup.html"],
  };

  // Check if userType is allowed on the current page
  if (
    !allowedPages[userType] ||
    !allowedPages[userType].includes(currentPage)
  ) {
    // Redirect to a default page or display an error message
    window.location.href = getDefaultPageForUser(userType); // Define this function based on your needs
  }
});

// Function to get default page based on userType
function getDefaultPageForUser(userType) {
  if (checkLoggedIn() && userType === "customer") {
    return "main.html"; // Redirect customer to main.html
  } else if (checkLoggedIn() && userType === "staff") {
    return "restaurant.html"; // Redirect staff to restaurant.html
  } else {
    return "index.html"; // Redirect to login page for unknown userType
  }
}

/*=========================================================================================================================================*/
