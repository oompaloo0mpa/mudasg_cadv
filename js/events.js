const API_BASE = 'https://ge1parm0ce.execute-api.us-east-1.amazonaws.com';

function loadEvents() {
    const request = new XMLHttpRequest();
    request.open('GET', `${API_BASE}/events`, true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    request.onload = function() {
        if (request.status === 429) {
            alert('Too many requests! Please wait a moment before trying again.');
            return;
        }
        if (request.status === 200) {
            try {
                const events = JSON.parse(request.responseText);
                let eventsContainer = document.getElementById('eventsContainer');
                eventsContainer.innerHTML = '';
                
                for (let i = 0; i < events.length; i++) {
                    const event = events[i];
                    const eventCard =
                        '<div class="col-md-4 mb-4">' +
                        '<div class="card h-100">' +
                        '<div class="card-body d-flex flex-column">' +
                        '<h5 class="card-title">' + event.event_name + '</h5>' +
                        '<p class="card-text text-muted small">' + new Date(event.event_time).toLocaleString() + '<br>' + event.event_location + '</p>' +
                        '<button class="btn btn-details mt-auto" onclick="viewEvent(\'' + event.event_id + '\')">View Details</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    eventsContainer.innerHTML += eventCard;
                }
            } catch (error) {
                console.error('Error parsing events data:', error);
            }
        } else {
            console.error('Failed to load events. Status:', request.status);
        }
    };
    
    request.onerror = function() {
        console.error('Network error loading events');
    };
    
    request.send();
}

function viewEvent(eventId) {
    window.location.href = 'specific_event_page.html?event_id=' + eventId;
}

function loadEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    if (!eventId) return;

    const request = new XMLHttpRequest();
    request.open('GET', `${API_BASE}/events_type/${eventId}`, true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    request.onload = function() {
        if (request.status === 200) {
            try {
                const events = JSON.parse(request.responseText);
                const event = Array.isArray(events) ? events[0] : events;
                
                if (!event) {
                    console.error('Event not found');
                    document.getElementById("eventName").textContent = 'Event not found';
                    return;
                }
                
                document.getElementById("eventName").textContent = event.event_name;
                document.getElementById("eventTime").textContent = new Date(event.event_time).toLocaleString();
                document.getElementById("eventLocation").textContent = event.event_location;
                document.getElementById("eventDescription").textContent = event.event_description;

                var btns = document.getElementById("eventButtons");
                var loginType = localStorage.getItem("loginType");
                if (loginType === "admin") {
                    btns.innerHTML =
                        '<button class="edit_btn" onclick="editEvent(\'' + event.event_id + '\')">Edit Event</button>' +
                        '<button class="delete_btn" onclick="deleteEvent(\'' + event.event_id + '\')">Delete Event</button>';
                }
            } catch (error) {
                console.error('Error parsing event details:', error);
                document.getElementById("eventName").textContent = 'Error loading event';
            }
        } else {
            console.error('Failed to load event details. Status:', request.status);
            document.getElementById("eventName").textContent = 'Error loading event';
        }
    };
    
    request.onerror = function() {
        console.error('Network error loading event details');
        document.getElementById("eventName").textContent = 'Network error';
    };
    
    request.send();
}

function editEvent(eventId) {
    window.location.href = `edit_event_page.html?event_id=${eventId}`;
}

function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    var response = "";
    var request = new XMLHttpRequest();
    
    request.open("DELETE", "https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events/" + eventId, true);
    
    request.onload = function() {
        response = JSON.parse(request.responseText);
        
        if (response.affectedRows == 1) {
            alert('Event deleted successfully.');
            window.location.href = 'index_page.html';
        }
        else {
            alert('Error. Unable to delete event.');
        }
    };
    
    request.send();
}

function loadEditEvent() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    if (!eventId) return;

    const request = new XMLHttpRequest();
    request.open('GET', `${API_BASE}/events_type/${eventId}`, true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    request.onload = function() {
        if (request.status === 200) {
            try {
                const events = JSON.parse(request.responseText);
                const event = Array.isArray(events) ? events[0] : events;
                
                if (event) {
                    document.getElementById('event_name').value = event.event_name;
                    document.getElementById('event_time').value = event.event_time.replace(' ', 'T').slice(0, 16);
                    document.getElementById('event_location').value = event.event_location;
                    document.getElementById('event_description').value = event.event_description;
                }
            } catch (error) {
                console.error('Error parsing edit event data:', error);
            }
        }
    };
    
    request.onerror = function() {
        console.error('Network error loading edit event');
    };
    
    request.send();
}

function submitEditEvent(e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    if (!eventId) return;

    var response = "";
    var jsonData = new Object();
    jsonData.event_name = document.getElementById('event_name').value;
    jsonData.event_time = document.getElementById('event_time').value.replace('T', ' ');
    jsonData.event_location = document.getElementById('event_location').value;
    jsonData.event_description = document.getElementById('event_description').value;
    
    if (jsonData.event_name == "" || jsonData.event_time == "" || jsonData.event_location == "" || jsonData.event_description == "") {
        alert('All fields are required!'); return;
    }
    
    var request = new XMLHttpRequest();
    
    request.open("PUT", "https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events/" + eventId, true);
    
    request.onload = function() {
        response = JSON.parse(request.responseText);

        if (response.affectedRows == 1) {
            alert('Event updated successfully!');
            window.location.href = `specific_event_page.html?event_id=${eventId}`;
        }
        else {
            alert('Error. Unable to update event.');
        }
    };
    
    request.send(JSON.stringify(jsonData));
}

function submitCreateEvent(e) {
    e.preventDefault();
    
    var response = "";
    var jsonData = new Object();
    jsonData.event_name = document.getElementById("event_name").value;
    jsonData.event_time = document.getElementById("event_time").value.replace('T', ' ');
    jsonData.event_location = document.getElementById("event_location").value;
    jsonData.event_description = document.getElementById("event_description").value;
    
    if (jsonData.event_name == "" || jsonData.event_time == "" || jsonData.event_location == "" || jsonData.event_description == "") {
        alert('All fields are required!'); return;
    }
    
    var request = new XMLHttpRequest();
    
    request.open("POST", "https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events", true);
    
    request.onload = function() {
        response = JSON.parse(request.responseText);
        
        if (response.affectedRows == 1) {
            alert('Event created successfully!');
            window.location.href = "index_page.html";
        }
        else {
            alert('Error. Unable to create event.');
        }
    };
    
    request.send(JSON.stringify(jsonData));
}

function checkCognitoAuth() {
    const accessToken = localStorage.getItem('cognitoAccessToken');
    if (accessToken) {
        localStorage.setItem('loginType', 'admin');
        document.getElementById('createEventBtn').style.display = 'block';
        document.getElementById('createEventBtn').onclick = () => window.location.href = 'create_event_page.html';
    }
}