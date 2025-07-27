const API_BASE = 'https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events';

function loadEvents() {
    fetch(API_BASE, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (response.status === 429) {
            alert('Too many requests! Please wait a moment before trying again.');
            throw new Error('Throttled by API Gateway');
        }
        if (!response.ok) {
            throw new Error('Request failed: ' + response.status);
        }
        return response.json();
    })
    .then(events => {
        try {
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
            logError('Error parsing events data', error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        logError('Failed to load events: ' + error.message);
    });
}

function viewEvent(eventId) {
    window.location.href = 'specific_event_page.html?event_id=' + eventId;
}

function loadEventDetails() {
    var response = "";
    var urlParams = new URLSearchParams(window.location.search);
    var eventId = urlParams.get('event_id');
    if (!eventId) return;

    var request = new XMLHttpRequest();
    request.open("GET", "https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events_type/" + eventId, true);
    request.onload = function() {
        response = JSON.parse(request.responseText);
        // The API returns an array, so get the first item
        var event = response[0];
        
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
    };
    request.send();
}

function editEvent(eventId) {
    window.location.href = `edit_event_page.html?event_id=${eventId}`;
}

function deleteEvent(eventId) {
    console.log('Delete event called with ID:', eventId);
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    const request = new XMLHttpRequest();
    request.open('DELETE', `https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events/${eventId}`, true);
    
    request.onload = function() {
        console.log('Delete response status:', request.status);
        console.log('Delete response:', request.responseText);
        
        if (request.status === 200) {
            alert('Event deleted successfully.');
            window.location.href = 'index_page.html';
        } else {
            alert('Error deleting event. Status: ' + request.status);
        }
    };
    
    request.onerror = function() {
        console.error('Delete request failed');
        alert('Network error while deleting event.');
    };
    
    request.send();
}

function loadEditEvent() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    if (!eventId) return;

    const request = new XMLHttpRequest();
    request.open('GET', `https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events_type/${eventId}`, true);
    request.onload = function() {
        if (request.status === 200) {
            const response = JSON.parse(request.responseText);
            const event = response[0]; // Get first item from array
            document.getElementById('event_name').value = event.event_name;
            document.getElementById('event_time').value = event.event_time.replace(' ', 'T').slice(0, 16);
            document.getElementById('event_location').value = event.event_location;
            document.getElementById('event_description').value = event.event_description;
        }
    };
    request.send();
}

function submitEditEvent(e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    if (!eventId) return;

    const eventData = {
        event_name: document.getElementById('event_name').value,
        event_time: document.getElementById('event_time').value.replace('T', ' '),
        event_location: document.getElementById('event_location').value,
        event_description: document.getElementById('event_description').value
    };

    fetch(`https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (response.status === 429) {
            alert('Too many requests! Please wait a moment before trying again.');
            throw new Error('Throttled by API Gateway');
        }
        if (!response.ok) {
            throw new Error('Request failed: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        alert('Event updated successfully!');
        window.location.href = `specific_event_page.html?event_id=${eventId}`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating event.');
    });
}

function submitCreateEvent(e) {
    e.preventDefault();
    const eventData = {
        event_name: document.getElementById("event_name").value,
        event_time: document.getElementById("event_time").value.replace('T', ' '),
        event_location: document.getElementById("event_location").value,
        event_description: document.getElementById("event_description").value
    };

    if (!eventData.event_name || !eventData.event_time || !eventData.event_location || !eventData.event_description) {
        alert('All fields are required!');
        return;
    }

    fetch("https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events", {
        method: 'POST',
        body: JSON.stringify(eventData),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (response.status === 429) {
            alert('Too many requests! Please wait a moment before trying again.');
            throw new Error('Throttled by API Gateway');
        }
        if (!response.ok) {
            throw new Error('Request failed: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        alert('Event created successfully!');
        window.location.href = "index_page.html";
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error. Unable to create event.');
    });
}

function checkCognitoAuth() {
    const accessToken = localStorage.getItem('cognitoAccessToken');
    if (accessToken) {
        localStorage.setItem('loginType', 'admin');
        document.getElementById('createEventBtn').style.display = 'block';
        document.getElementById('createEventBtn').onclick = () => window.location.href = 'create_event_page.html';
    }
}