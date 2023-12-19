async function fetchOwnerRestaurants() {
  try {
    const token = localStorage.getItem("token");
    const owner_id = localStorage.getItem("owner_id");

    const requestOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420",
      },
      redirect: "follow",
    };

    const response = await fetch(
      `${backendUrl}restaurantowned/${owner_id}`,
      requestOptions
    );

    if (response.ok) {
      const data = await response.json();
      const restaurantss = document.getElementById("restaurantss");

      data.forEach((restaurant) => {
        const restaurantInfo = document.createElement("row");
        restaurantInfo.className = "col-12 mt-3";
        restaurantInfo.innerHTML = `
          <div class="row">
            <div class="col">
              <h4><a href="restaurant.html?restaurantId=${restaurant.id}">${restaurant.restaurant_name}</a></h4>
            </div>
            <div class="col text-right">
              <button class="btn btn-primary btn-sm mr-2 ml-auto" onclick="updateRestaurant(event,${restaurant.id})">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteRestaurant(event,${restaurant.id})">Delete</button>
            </div>
          </div>
          <hr>
        `;
        restaurantss.appendChild(restaurantInfo);
      });
    } else {
      throw new Error("Failed to fetch restaurants");
    }
  } catch (error) {
    console.log("error", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const userType = localStorage.getItem("userType");
  const currentPage = window.location.pathname.split("/").pop();
  if (userType === "staff" && currentPage === "owner.html") {
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
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const owner_id = localStorage.getItem("owner_id");
  const token = localStorage.getItem("token");

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    },
    redirect: "follow",
  };

  fetch(`${backendUrl}restaurant/${restaurantId}`, requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch restaurant");
      }
    })
    .then((restaurant) => {
      document.getElementById("restaurantName1").value =
        restaurant.restaurant_name;
      document.getElementById("description1").value = restaurant.description;
      document.getElementById("cuisine1").value = restaurant.cuisine;
      document.getElementById("address1").value = restaurant.address;
      document.getElementById("city1").value = restaurant.city;
      document.getElementById("zipcode1").value = restaurant.zip_code;

      document.getElementById("updateRestaurantForm").style.display = "block";

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
            body: updateData,
            redirect: "follow",
          };

          fetch(`${backendUrl}restaurant/${restaurantId}`, updateOptions)
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

  fetch(`${backendUrl}restaurant`, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      alert("Successfully created restaurant!");
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

    fetch(`${backendUrl}restaurant/` + restaurantId, requestOptions)
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
  const token = localStorage.getItem("token");

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    },
    redirect: "follow",
  };

  // Fetch and display the restaurant image initially
  fetchRestaurantImage();

  fetch(`${backendUrl}restaurant/${restaurantId}`, requestOptions)
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
  const token = localStorage.getItem("token");

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    },
    redirect: "follow",
  };

  const preview = document.getElementById("previewImage");

  fetch(`${backendUrl}restaurant/fetchimage/${restaurantId}`, requestOptions)
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
    fetchRestaurantImage(); // Call fetchRestaurantImage when the page loads
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

  fetch(`${backendUrl}restaurant/image/${restaurantId}`, requestOptions)
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
  var owner_id = localStorage.getItem("owner_id");
  const token = localStorage.getItem("token");

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "69420",
    },
    redirect: "follow",
  };

  fetch(`${backendUrl}customerreservationn/${owner_id}`, requestOptions)
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
          `${backendUrl}customer/${reservation.customer_id}`,
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
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const updateData = new URLSearchParams();
  updateData.append("status", "Accepted");

  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: updateData,
    redirect: "follow",
  };

  fetch(`${backendUrl}reservation/status/${reservationId}`, requestOptions)
    .then((response) => {
      if (response.ok) {
        console.log("Reservation accepted successfully!");
        window.location.reload();
      } else {
        console.error("Failed to accept reservation.");
      }
    })
    .catch((error) => {
      console.error("Error occurred while accepting reservation:", error);
    });
}

function RejectReservation(reservationId) {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const updateData = new URLSearchParams();
  updateData.append("status", "Rejected");

  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: updateData,
    redirect: "follow",
  };

  fetch(`${backendUrl}reservation/status/${reservationId}`, requestOptions)
    .then((response) => {
      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Failed to reject reservation.");
      }
    })
    .catch((error) => {
      console.error("Error occurred while rejecting reservation:", error);
    });
}

/*=========================================================================================================================================*/

/*=============================================END OWNERS JAVASCRIPT========================================================================*/
