/*=============================================CUSTOMERS JAVASCRIPT========================================================================*/

async function fetchRestaurants() {
  const token = localStorage.getItem("token");

  const requestOptions = {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // Fix the syntax error here
    },
  };

  try {
    const response = await fetch(backendUrl + "restaurant2", requestOptions);

    if (response.ok) {
      const data = await response.json();
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

        fetchRestaurantImage1(restaurant.id, restaurantCard);
      });
    } else {
      throw new Error("Failed to fetch restaurants");
    }
  } catch (error) {
    console.log("error", error);
  }
}

function fetchRestaurantImage1(restaurantId, restaurantCard) {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(`${backendUrl}restaurant/fetchimage/${restaurantId}`, requestOptions)
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
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const userType = localStorage.getItem("userType");
  const currentPage = window.location.pathname.split("/").pop();
  if (userType == "customer" && currentPage == "main.html") {
    fetchRestaurants();
  }
});

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
      fetch(backendUrl + "customerreservation", requestOptions)
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

  fetch(`${backendUrl}customerreservationnn/${customer_id}`, requestOptions)
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
          `${backendUrl}restaurant/${reservation.restaurant_id}`,
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

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage == "reservation.html") {
    fetchReservations();
  }
});
/*=========================================================================================================================================*/

/*=========================================================================================================================================*/

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

  fetch(`${backendUrl}customerreservation/${reservationId}`, requestOptions)
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
            `${backendUrl}customerreservation/${reservationId}`,
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

function deleteReservation(reservationId) {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Bearer " + localStorage.getItem("token"));

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(`${backendUrl}customerreservation/${reservationId}`, requestOptions)
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

      fetch(`${backendUrl}customerreservation/${reservationId}`, requestOptions)
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

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(`${backendUrl}customerreservation/${reservationId}`, requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to fetch reservation details");
      }
    })
    .then((reservation) => {
      fetch(`${backendUrl}customer/${reservation.customer_id}`, requestOptions)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch customer details");
          }
        })
        .then((customer) => {
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

          modalBody.innerHTML = reservationDetailsHTML;
          $("#reservationdetails").modal("show");
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to fetch reservation details. Please try again.");
        });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to fetch reservation details. Please try again.");
    });
}

function closeDetails() {
  $("#reservationdetails").modal("hide");
}
