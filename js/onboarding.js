function goToUserLogin() {
    window.location.href = 'user_auth_page.html';
}

function goToUserSignup() {
    window.location.href = 'user_auth_page.html#signup';
}

function goToAdminLogin() {
    window.location.href = 'cognito_login_page.html'; 
}

function loadEventDetails() {
    var response = "";

    var urlParams = new URLSearchParams(window.location.search);
    var eventId = urlParams.get('event_id');
    if (!eventId) return;

    var request = new XMLHttpRequest();
    request.open("GET", "https://pm1iuvkzx8.execute-api.us-east-1.amazonaws.com/events/" + eventId, true);

    request.onload = function() {
        response = JSON.parse(request.responseText);

        document.getElementById("eventName").textContent = response.event_name;
        document.getElementById("eventTime").textContent = new Date(response.event_time).toLocaleString();
        document.getElementById("eventLocation").textContent = response.event_location;
        document.getElementById("eventDescription").textContent = response.event_description;

        var btns = document.getElementById("eventButtons");
        var loginType = localStorage.getItem("loginType");
        if (loginType === "admin") {
            btns.innerHTML =
                '<button class="edit_btn" onclick="editEvent(\'' + response.event_id + '\')">Edit Event</button>' +
                '<button class="delete_btn" onclick="deleteEvent(\'' + response.event_id + '\')">Delete Event</button>';
        }
    };

    request.send();
}