/*=========================================================================================================================================*/
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
    endpoint = "http://localhost/Final-backend/public/api/customerlogin";
  } else if (userType === "staff") {
    endpoint = "http://localhost/Final-backend/public/api/restaurantownerlogin";
  }
  localStorage.setItem("userType", userType);
  fetch(endpoint, requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json(); // Parse response body as JSON
      } else {
        throw new Error("Login failed");
      }
    })
    .then((data) => {
      if ((data.token, userType == "customer")) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("customer_id", data.customer.id);
        fetchRestaurants(); // Call function to fetch restaurants after successful login
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

  fetch("http://localhost/Final-backend/public/api/logout", requestOptions)
    .then((response) => {
      localStorage.removeItem("token");
      localStorage.removeItem("owner_id");
      localStorage.removeItem("userType");
      window.location.href = "login.html";
    })
    .catch((error) => console.log("error", error));
}

function signup(event) {
  event.preventDefault();

  // Fetch signup data from the form
  const firstName = document.getElementById("firstname").value;
  const lastName = document.getElementById("lastname").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("signupPassword").value;
  const userType = document.getElementById("userType").value;

  // Construct the request body
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");

  const formData = new FormData();
  formData.append("firstname", firstName);
  formData.append("lastname", lastName);
  formData.append("email", email);
  formData.append("username", username);
  formData.append("password", password);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formData,
    redirect: "follow",
  };

  // Choose the endpoint based on the selected role
  let endpoint = "";
  if (userType === "customer") {
    endpoint = "http://localhost/Final-backend/public/api/customer";
  } else if (userType === "restaurant owner") {
    endpoint = "http://localhost/Final-backend/public/api/restaurantowner";
  }

  // Send the signup request to the chosen endpoint
  fetch(endpoint, requestOptions)
    .then((response) => {
      if (response.ok) {
        alert("Signup successful!");
        window.location.href = "login.html"; // Redirect to login page after successful signup
      } else {
        throw new Error("Signup failed");
      }
    })
    .catch((error) => {
      alert("Signup failed. Please try again.");
      console.log("error", error);
    });
}
function checkLoggedIn() {
  const token = localStorage.getItem("token");
  return token !== null && token !== undefined;
}

function handleAccessControl() {
  const currentPage = window.location.pathname.split("/").pop();
  const tokenExists = checkLoggedIn();

  console.log("Token Exists:", tokenExists);
  console.log("Current Page:", currentPage);

  if (!tokenExists && currentPage !== "login.html") {
    console.log("User not logged in. Redirecting to login...");
    window.location.href = "login.html";
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
    null: ["login.html", "signup.html"],
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
  if (userType === "customer") {
    return "main.html"; // Redirect customer to main.html
  } else if (userType === "staff") {
    return "restaurant.html"; // Redirect staff to restaurant.html
  } else {
    return "login.html"; // Redirect to login page for unknown userType
  }
}

/*=========================================================================================================================================*/

/*=============================================CUSTOMERS JAVASCRIPT========================================================================*/

function fetchRestaurants() {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch("http://localhost/Final-backend/public/api/restaurant2", requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch restaurants");
      }
    })
    .then((data) => {
      var restaurantContainer = document.getElementById("restaurantContainer");

      data.forEach((restaurant) => {
        var restaurantCard = document.createElement("div");
        restaurantCard.innerHTML = `
          <div class="card h-100">
            <img class="card-img-top" src="" alt="..." /> <!-- Initially empty -->
            <div class="card-body p-4">
              <div class="text-center">
                <h5 class="fw-bolder">${restaurant.restaurant_name}</h5>
                <p>${restaurant.description}</p>
                <button class="btn btn-primary book-now-btn"
                data-bs-toggle="modal"
                data-bs-target="#bookingModal"
                onclick="bookTable(${restaurant.id})">Book Now</button>
              </div>
            </div>
          </div>`;

        restaurantContainer.appendChild(restaurantCard);

        // Fetch and set the image for each restaurant
        fetchRestaurantImage1(restaurant.id, restaurantCard);
      });
    })
    .catch((error) => {
      console.log("error", error);
    });
}

// Function to fetch and set the image for each restaurant card
function fetchRestaurantImage1(restaurantId, restaurantCard) {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    `http://localhost/Final-backend/public/api/restaurant/fetchimage/${restaurantId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.blob(); // Assuming the image is returned as a blob
      } else {
        throw new Error("Failed to fetch restaurant image");
      }
    })
    .then((imageBlob) => {
      const imageUrl = URL.createObjectURL(imageBlob);
      const imgElement = restaurantCard.querySelector(".card-img-top");
      imgElement.src = imageUrl;
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
      // Handle specific error message or show a default image to the user
    });
}

// Call fetchRestaurants on page load or after login success
document.addEventListener("DOMContentLoaded", function () {
  const userType = localStorage.getItem("userType");
  const currentPage = window.location.pathname.split("/").pop();
  if (userType == "customer" && currentPage == "main.html") {
    fetchRestaurants();
  }
});

/*=========================================================================================================================================*/

function bookTable(restaurantId) {
  document
    .getElementById("bookTableButton")
    .addEventListener("click", function (event) {
      const myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append(
        "Authorization",
        "Bearer " + localStorage.getItem("token")
      );

      var customer_id = localStorage.getItem("customer_id");

      const bookingDate = document.getElementById("bookingDate").value;
      const bookingTime = document.getElementById("bookingTime").value;
      const timeOfDay = document.getElementById("timeOfDay").value;
      const numberOfTables = document.getElementById("numberOfTables").value;
      const numberOfGuests = document.getElementById("numberOfGuests").value;
      const specialRequest = document.getElementById("request").value;

      const formdata = new FormData();
      formdata.append("num_tables", numberOfTables);
      formdata.append("num_guests", numberOfGuests);
      formdata.append("reserve_date", bookingDate);
      formdata.append("reserve_time", bookingTime);
      formdata.append("request_date", bookingDate);
      formdata.append("status", "Pending");
      formdata.append("special_request", specialRequest);
      formdata.append("time_of_day", timeOfDay);
      formdata.append("restaurant_id", restaurantId);

      formdata.append("customer_id", customer_id);
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };
      fetch(
        "http://localhost/Final-backend/public/api/customerreservation",
        requestOptions
      )
        .then((response) => {
          if (response.ok) {
            alert("Reservation created successfully!");
            window.location.reload();
          } else {
            throw new Error("Failed to make reservation");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle the error here, such as showing an error message to the user
        });
    });
}

/*=========================================================================================================================================*/

function fetchReservations() {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var customer_id = localStorage.getItem("customer_id");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    "http://localhost/Final-backend/public/api/customerreservationnn/" +
      customer_id,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch reservations");
      }
    })
    .then((data) => {
      data.forEach((reservation) => {
        // Fetch restaurant name based on reservation's restaurant ID
        fetch(
          `http://localhost/Final-backend/public/api/restaurant/${reservation.restaurant_id}`,
          requestOptions
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Failed to fetch restaurant name");
            }
          })
          .then((restaurantData) => {
            const restaurantName = restaurantData.restaurant_name;

            // Create a table row for the reservation
            var row = document.createElement("tr");
            row.innerHTML = `
              <td>${restaurantName}</td>
              <td>${reservation.reserve_date}</td>
              <td>${reservation.reserve_time} ${reservation.time_of_day}</td>
              <td>${reservation.status}</td>
              <!-- Add other reservation details as needed -->
            `;

            // Determine the container based on the reservation's status
            var containerId = "";
            switch (reservation.status) {
              case "Accepted":
                containerId = "acceptedreservationTableBody";
                // Add buttons for accepted reservations
                row.innerHTML += `
              <td class="text-end">
                <button class="btn btn-primary btn-sm" onclick="displayReservationDetails(${reservation.id})">Details</button>
                <button class="btn btn-danger btn-sm" onclick="cancelReservation(event,${reservation.id})">Cancel</button>
              </td>
            `;
                break;
              case "Pending":
                containerId = "pendingreservationTableBody";
                // Add buttons for pending reservations
                row.innerHTML += `
              <td class="text-end">
                <button class="btn btn-primary btn-sm" onclick="displayReservationDetails(${reservation.id})">Details</button>
                <button class="btn btn-primary btn-sm" onclick="editReservation(event,${reservation.id},${reservation.restaurant_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="cancelReservation(event,${reservation.id})">Cancel</button>
              </td>
            `;
                break;
              case "Rejected":
                containerId = "rejectedreservationTableBody";
                // Add buttons for rejected reservations
                row.innerHTML += `
              <td class="text-end">
                <button class="btn btn-primary btn-sm" onclick="displayReservationDetails(${reservation.id})">Details</button>
                <button class="btn btn-danger btn-sm" onclick="deleteReservation(${reservation.id})">Delete</button>
              </td>
            `;
                break;
              default:
                // For unknown status, you can decide whether to handle differently or skip
                break;
            }

            // Append the row to the corresponding container
            var container = document.getElementById(containerId);
            if (container) {
              container.appendChild(row);
            } else {
              console.log("Container not found for reservation:", reservation);
            }
          });
      });
    })
    .catch((error) => {
      console.error("Error fetching reservations:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage == "reservation.html") {
    fetchReservations();
  }
});
/*=========================================================================================================================================*/

/*=========================================================================================================================================*/

// Function to update the reservation
function editReservation(event, reservationId, restaurantId) {
  event.preventDefault();

  $("#bookingModal").modal("show");

  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded"); // Set the content type

  var customer_id = localStorage.getItem("customer_id");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    `http://localhost/Final-backend/public/api/customerreservation/${reservationId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch reservation");
      }
    })
    .then((reservation) => {
      // Populate modal fields with current reservation data
      document.getElementById("bookingDate").value = reservation.reserve_date;
      document.getElementById("bookingTime").value = reservation.reserve_time;
      document.getElementById("timeOfDay").value = reservation.time_of_day;
      document.getElementById("numberOfTables").value = reservation.num_tables;
      document.getElementById("numberOfGuests").value = reservation.num_guests;
      document.getElementById("request").value = reservation.special_request;

      // Add event listener for form submission
      document
        .getElementById("bookTableButton")
        .addEventListener("click", (event) => {
          event.preventDefault();

          // Retrieve updated data from modal fields
          const bookingDate = document.getElementById("bookingDate").value;
          const bookingTime = document.getElementById("bookingTime").value;
          const timeOfDay = document.getElementById("timeOfDay").value;
          const numberOfTables =
            document.getElementById("numberOfTables").value;
          const numberOfGuests =
            document.getElementById("numberOfGuests").value;
          const request = document.getElementById("request").value;

          // Construct update request body
          const updateData = new URLSearchParams();
          updateData.append("reserve_date", bookingDate);
          updateData.append("reserve_time", bookingTime);
          updateData.append("time_of_day", timeOfDay);
          updateData.append("num_tables", numberOfTables);
          updateData.append("num_guests", numberOfGuests);
          updateData.append("special_request", request);
          updateData.append("customer_id", customer_id);
          updateData.append("restaurant_id", restaurantId);

          const updateOptions = {
            method: "PUT",
            headers: myHeaders,
            body: updateData,
            redirect: "follow",
          };

          fetch(
            `http://localhost/Final-backend/public/api/customerreservation/${reservationId}`,
            updateOptions
          )
            .then((response) => {
              if (response.ok) {
                alert("Reservation updated successfully!");
                window.location.reload();
                // Additional logic after successful update if needed
                $("#bookingModal").modal("hide"); // Hide the modal after success
              } else {
                if (response.status === 422) {
                  response.json().then((errorData) => {
                    console.log("Error Data:", errorData);
                    alert(
                      "Error updating reservation. Please check the console for details."
                    );
                  });
                } else {
                  throw new Error("Failed to update reservation");
                }
              }
            })
            .catch((error) => {
              alert("Error updating reservation. Please try again.");
              console.error("Error:", error);
              // Handle specific error message or show a generic error to the user
            });
        });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      // Handle specific error message or show a generic error to the user
    });
}

/*=========================================================================================================================================*/
function deleteReservation(reservationId) {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    `http://localhost/Final-backend/public/api/customerreservation/${reservationId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        alert("Reservation deleted successfully!");
        window.location.reload();
      } else {
        throw new Error("Failed to delete reservation");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error deleting reservation. Please try again.");
    });
}

function cancelReservation(event, reservationId) {
  event.preventDefault();

  // Show the modal when the delete button is clicked
  $("#deleteReservationModal").modal("show");

  const deleteButton = document.getElementById("deleteReservationButton");
  deleteButton.addEventListener("click", function (event) {
    try {
      event.preventDefault();
      console.log("Delete button clicked!");

      const myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append(
        "Authorization",
        "Bearer " + localStorage.getItem("token")
      );

      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow",
      };

      fetch(
        `http://localhost/Final-backend/public/api/customerreservation/${reservationId}`,
        requestOptions
      )
        .then((response) => {
          if (response.ok) {
            alert("Reservation deleted successfully!");
            window.location.reload();
          } else {
            throw new Error("Failed to delete reservation");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error deleting reservation. Please try again.");
        });
    } catch (error) {
      console.error("Error handling delete action:", error);
    }

    // Hide the modal when the delete confirmation button is clicked
    $("#deleteReservationModal").modal("hide");
  });
}

function displayReservationDetails(reservationId) {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  const modalBody = document.querySelector("#reservationdetails .modal-body");

  // Get token from localStorage or wherever it's stored

  // Fetch reservation details
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    `http://localhost/Final-backend/public/api/customerreservation/${reservationId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch reservation details");
      }
    })
    .then((reservation) => {
      fetch(
        `http://localhost/Final-backend/public/api/customer/${reservation.customer_id}`,
        requestOptions
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch restaurant name");
          }
        })
        .then((customer) => {
          // Construct HTML content with fetched reservation details
          const reservationDetailsHTML = `
        <p>Name: ${customer.firstname} ${customer.lastname}</p>
        <p>Email: ${customer.email}</p>
        <p>Number of Table/s: ${reservation.num_tables}</p>
        <p>Number of Guest/s: ${reservation.num_guests}</p>
        <p>Reserve Date: ${reservation.reserve_date}</p>
        <p>Reserve Time: ${reservation.reserve_time} ${reservation.time_of_day}</p>
        <p>Special Request: ${reservation.special_request}</p>
        <p>Status: ${reservation.status}</p>
        <!-- Add other details as needed -->
      `;

          // Set the HTML content in the modal body
          modalBody.innerHTML = reservationDetailsHTML;

          // Show the modal
          $("#reservationdetails").modal("show");
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to fetch reservation details. Please try again.");
        });
    });
}

/*=========================================================================================================================================*/

function closeDetails() {
  $("#reservationdetails").modal("hide");
}

/*=========================================================================================================================================*/

/*=============================================END CUSTOMERS JAVASCRIPT========================================================================*/

/*=============================================OWNERS JAVASCRIPT========================================================================*/

function fetchOwnerRestaurants() {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var owner_id = localStorage.getItem("owner_id");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    "http://localhost/Final-backend/public/api/restaurantowned/" + owner_id,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch restaurants");
      }
    })
    .then((data) => {
      var restaurantss = document.getElementById("restaurantss");

      data.forEach((restaurant) => {
        var restaurantInfo = document.createElement("row");
        restaurantInfo.className = "col-12 mt-3";
        restaurantInfo.innerHTML = `
        <div class = "row">
        <div class = "col">
        <h4><a href="restaurant.html?restaurantId=${restaurant.id}">${restaurant.restaurant_name}</a></h4>

          </div>
          <div class = "col text-right">
          <button class="btn btn-primary btn-sm mr-2 ml-auto" onclick="updateRestaurant(event,${restaurant.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteRestaurant(event,${restaurant.id})">Delete</button>
            </div>
            </div>
          <hr>
        `;
        restaurantss.appendChild(restaurantInfo);
      });
    })
    .catch((error) => {
      console.log("error", error);
    });
}
document.addEventListener("DOMContentLoaded", function () {
  const userType = localStorage.getItem("userType");
  const currentPage = window.location.pathname.split("/").pop();
  if (userType == "staff" && currentPage == "owner.html") {
    fetchOwnerRestaurants();
  }
});
/*=========================================================================================================================================*/

function showAddModal() {
  // Show the modal
  $("#addRestaurantModal").modal("show");
}

/*=========================================================================================================================================*/

// Call the fetchRestaurants function when the page loads

/*=========================================================================================================================================*/

function updateRestaurant(event, restaurantId) {
  event.preventDefault();

  $("#updateRestaurantModal").modal("show");

  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded"); // Set the content type

  const owner_id = localStorage.getItem("owner_id");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    `http://localhost/Final-backend/public/api/restaurant/${restaurantId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch restaurant");
      }
    })
    .then((restaurant) => {
      // Populate form fields with current restaurant data
      document.getElementById("restaurantName1").value =
        restaurant.restaurant_name;
      document.getElementById("description1").value = restaurant.description;
      document.getElementById("cuisine1").value = restaurant.cuisine;
      document.getElementById("address1").value = restaurant.address;
      document.getElementById("city1").value = restaurant.city;
      document.getElementById("zipcode1").value = restaurant.zip_code;

      // Show the form after populating data
      document.getElementById("updateRestaurantForm").style.display = "block";

      // Add event listener for form submission
      document
        .getElementById("updateRestaurantForm")
        .addEventListener("submit", (event) => {
          event.preventDefault();

          const restaurantName =
            document.getElementById("restaurantName1").value;
          const description = document.getElementById("description1").value;
          const cuisine = document.getElementById("cuisine1").value;
          const address = document.getElementById("address1").value;
          const city = document.getElementById("city1").value;
          const zipcode = document.getElementById("zipcode1").value;

          const updateData = new URLSearchParams();
          updateData.append("restaurant_name", restaurantName);
          updateData.append("description", description);
          updateData.append("cuisine", cuisine);
          updateData.append("address", address);
          updateData.append("city", city);
          updateData.append("zip_code", zipcode);
          updateData.append("owner_id", owner_id);

          const updateOptions = {
            method: "PUT",
            headers: myHeaders,
            body: updateData, // Use URLSearchParams object as the body
            redirect: "follow",
          };

          fetch(
            `http://localhost/Final-backend/public/api/restaurant/${restaurantId}`,
            updateOptions
          )
            .then((response) => {
              if (response.ok) {
                alert("Restaurant updated successfully!");
                // Additional logic after successful update if needed
              } else {
                if (response.status === 422) {
                  response.json().then((errorData) => {
                    console.log("Error Data:", errorData);
                    alert(
                      "Error updating restaurant. Please check the console for details."
                    );
                  });
                } else {
                  throw new Error("Failed to update restaurant");
                }
              }
            })
            .catch((error) => {
              alert("Error updating restaurant. Please try again.");
              console.error("Error:", error);
              // Handle specific error message or show a generic error to the user
            });
        });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      // Handle specific error message or show a generic error to the user
    });
}

/*=========================================================================================================================================*/

function showUpdateModal() {
  // Clear previous input values in the modal
  // Add code to clear the form fields in the modal

  // Show the modal
  $("#updateRestaurantModal").modal("show");
}

function createRestaurant(event) {
  event.preventDefault();

  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var owner_id = localStorage.getItem("owner_id");

  // Get the restaurant details from the form
  const restaurantName = document.getElementById("restaurantName").value;
  const description = document.getElementById("description").value;
  const cuisine = document.getElementById("cuisine").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const zipcode = document.getElementById("zipcode").value;

  // Prepare the form data
  const formData = new FormData();
  formData.append("restaurant_name", restaurantName);
  formData.append("description", description);
  formData.append("cuisine", cuisine);
  formData.append("address", address);
  formData.append("city", city);
  formData.append("zip_code", zipcode);
  formData.append("owner_id", owner_id);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formData,
    redirect: "follow",
  };

  fetch("http://localhost/Final-backend/public/api/restaurant", requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      alert("Successfull!");
      window.location.reload();
      // Handle successful response
    })
    .catch((error) => {
      console.error("Error:", error);
      // Handle specific error message or show a generic error to the user
    });
}

/*=========================================================================================================================================*/

function deleteRestaurant(event, restaurantId) {
  event.preventDefault();

  // Show the modal when the delete button is clicked
  $("#deleteRestaurantModal").modal("show");

  const deleteButton = document.getElementById("deletebutton");
  deleteButton.addEventListener("click", function (event) {
    try {
      event.preventDefault();
      console.log("Delete button clicked!");

      // Call deleteRestaurant function with appropriate parameters
      deleteRestaurant(event, restaurantId); // Ensure 'restaurantId' is defined here
    } catch (error) {
      console.error("Error handling delete action:", error); // Log any caught errors
    }
    // Hide the modal when the delete confirmation button is clicked
    $("#deleteRestaurantModal").modal("hide");

    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append(
      "Authorization",
      "Bearer " + localStorage.getItem("token")
    );

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      "http://localhost/Final-backend/public/api/restaurant/" + restaurantId,
      requestOptions
    )
      .then((response) => {
        if (response.ok) {
          alert("Restaurant deleted successfully!");
          window.location.reload();
        } else {
          throw new Error("Failed to delete restaurant");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error deleting restaurant. Please try again.");
      });
  });
}

/*=========================================================================================================================================*/

function showDeleteModal() {
  // Clear previous input values in the modal
  // Add code to clear the form fields in the modal

  // Show the modal
  $("#deleteRestaurantModal").modal("show");
}

/*=========================================================================================================================================*/

function closeDeleteModal() {
  $("#deleteRestaurantModal").modal("hide");
  $("#deleteReservationModal").modal("hide");
}

/*=========================================================================================================================================*/

function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/*=========================================================================================================================================*/

function showRestaurant() {
  var restaurantId = getUrlParameter("restaurantId");
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  // Fetch and display the restaurant image initially
  fetchRestaurantImage();

  fetch(
    `http://localhost/Final-backend/public/api/restaurant/${restaurantId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch restaurant details");
      }
    })
    .then((restaurant) => {
      // Create HTML content to display restaurant details
      const detailsHTML = `
        <h3>${restaurant.restaurant_name}</h3>
        <p><strong>Description:</strong> ${restaurant.description}</p>
        <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
        <p><strong>Address:</strong> ${restaurant.address}, ${restaurant.city}, ${restaurant.zip_code}</p>
        <!-- Add other details as needed -->
      `;

      // Display restaurant details in the #displayDetails element
      document.getElementById("displayDetails").innerHTML = detailsHTML;
    })
    .catch((error) => {
      console.error("Error:", error);
      // Handle specific error message or show a generic error to the user
    });
}

// Function to fetch and display the restaurant image
function fetchRestaurantImage() {
  var restaurantId = getUrlParameter("restaurantId");
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const preview = document.getElementById("previewImage");

  fetch(
    `http://localhost/Final-backend/public/api/restaurant/fetchimage/${restaurantId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.blob(); // Assuming the image is returned as a blob
      } else {
        throw new Error("Failed to fetch restaurant image");
      }
    })
    .then((imageBlob) => {
      URL.revokeObjectURL(preview.src); // Revoke previous object URL
      const imageUrl = URL.createObjectURL(imageBlob);
      preview.src = imageUrl;
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
      // Handle specific error message or show a default image to the user
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "restaurant.html") {
    showRestaurant();
  }
});

// Rest of your functions (previewFile, uploadImage, etc.)

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "restaurant.html") {
    showRestaurant();
  }
});

function previewFile() {
  const preview = document.getElementById("previewImage");
  const fileInput = document.getElementById("imageInput");
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onloadend = function () {
    preview.src = reader.result;
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}

function uploadImage() {
  var fileInput = document.getElementById("imageInput");
  var restaurantId = getUrlParameter("restaurantId");

  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var formdata = new FormData();
  formdata.append("image", fileInput.files[0]);
  formdata.append("_method", "PUT");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  fetch(
    `http://localhost/Final-backend/public/api/restaurant/image/${restaurantId}`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      window.location.reload();
      showRestaurant(); // Fetch and display updated restaurant details including the image
    })
    .catch((error) => console.log("error", error));
}

/*=========================================================================================================================================*/

function fetchReservations1() {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var owner_id = localStorage.getItem("owner_id");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  fetch(
    "http://localhost/Final-backend/public/api/customerreservationn/" +
      owner_id,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch reservations");
      }
    })
    .then((data) => {
      data.forEach((reservation) => {
        // Fetch restaurant name based on reservation's restaurant ID
        fetch(
          `http://localhost/Final-backend/public/api/customer/${reservation.customer_id}`,
          requestOptions
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Failed to fetch restaurant name");
            }
          })
          .then((customer) => {
            // Create a new row for each reservation
            var row = document.createElement("tr");

            // Populate the table row with reservation and restaurant data
            row.innerHTML = `
              <td>${customer.firstname} ${customer.lastname}</td>
              <td>${reservation.reserve_date}</td>
              <td>${reservation.reserve_time} ${reservation.time_of_day}</td>
              <td>${reservation.status}</td>
              <td class="text-end">
                ${
                  reservation.status === "Accepted"
                    ? `<button class="btn btn-primary btn-sm" onclick="displayReservationDetails(${reservation.id})">Details</button>
                       <button class="btn btn-danger btn-sm" onclick="RejectReservation(${reservation.id})">Reject</button>`
                    : reservation.status === "Pending"
                    ? `<button class="btn btn-primary btn-sm" onclick="displayReservationDetails(${reservation.id})">Details</button>
                       <button class="btn btn-success btn-sm" onclick="AcceptReservation(${reservation.id})">Accept</button>
                       <button class="btn btn-danger btn-sm" onclick="RejectReservation(${reservation.id})">Reject</button>`
                    : ""
                }
              </td>
            `;
            // Decide which table to append the row based on reservation status
            if (reservation.status === "Accepted") {
              var acceptedreservationTableBody = document.getElementById(
                "acceptedreservationTableBody"
              );
              acceptedreservationTableBody.appendChild(row);
            } else if (reservation.status === "Pending") {
              var pendingreservationTableBody = document.getElementById(
                "pendingreservationTableBody"
              );
              pendingreservationTableBody.appendChild(row);
            }
          });
      });
    })
    .catch((error) => {
      console.log("Error fetching reservations:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage == "restaurantreservations.html") {
    fetchReservations1();
  }
});

/*=========================================================================================================================================*/

function AcceptReservation(reservationId) {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded"); // Set the content type

  const updateData = new URLSearchParams();
  updateData.append("status", "Accepted");

  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: updateData,
    redirect: "follow",
  };

  fetch(
    `http://localhost/Final-backend/public/api/reservation/status/${reservationId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        console.log("Reservation accepted successfully!");
        window.location.reload();
        // Handle success (e.g., update UI, show a message)
      } else {
        console.error("Failed to accept reservation.");
        // Handle error (e.g., show error message)
      }
    })
    .catch((error) => {
      console.error("Error occurred while accepting reservation:", error);
      // Handle error (e.g., show error message)
    });
}
function RejectReservation(reservationId) {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded"); // Set the content type

  const updateData = new URLSearchParams();
  updateData.append("status", "Rejected");

  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: updateData,
    redirect: "follow",
  };

  fetch(
    `http://localhost/Final-backend/public/api/reservation/status/${reservationId}`,
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        window.location.reload();
        // Handle success (e.g., update UI, show a message)
      } else {
        console.error("Failed to Reject reservation.");
        // Handle error (e.g., show error message)
      }
    })
    .catch((error) => {
      console.error("Error occurred while rejecting reservation:", error);
      // Handle error (e.g., show error message)
    });
}

/*=========================================================================================================================================*/

/*=============================================END OWNERS JAVASCRIPT========================================================================*/
