const API_BASE = 'https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events';

// Fetch and display all events
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
        let html = '';
        events.forEach(event => {
            html += `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${event.event_name}</h5>
                        <p class="card-text text-muted small">
                            ${formatDateTime(event.event_time)}<br>
                            ${event.event_location}
                        </p>
                        <button class="btn btn-details mt-auto" onclick="viewEvent('${event.event_id}')">View Details</button>
                    </div>
                </div>
            </div>
            `;
        });
        document.getElementById('eventsRow').innerHTML = html;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('eventsRow').innerHTML = '<div class="col-12"><p class="text-center text-danger">Failed to load events. Please try again later.</p></div>';
    });
}

function formatDateTime(dt) {
    const d = new Date(dt);
    return d.toLocaleString();
}

function viewEvent(eventId) {
    window.location.href = `user_specific_event_page.html?event_id=${eventId}`;
}

// Load user profile and events for user_profile.html
function loadUserProfile() {
    // Get user info from sessionStorage
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user.email) return;
    document.getElementById('profileName').textContent = user.fullname || '<User>';
    document.getElementById('profileEmail').textContent = user.email || '<User@email.com>';

    // Always use email for fetching applications
    const fetchUrl = `https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/application-event/${encodeURIComponent(user.email)}`;

    fetch(fetchUrl, {
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
    .then(async data => {
        // Support both array and { Items: [...] } response
        const applications = Array.isArray(data) ? data : (data.Items || []);
        document.getElementById('totalEvents').textContent = applications.length;
        // Fetch event details for each application
        const eventIds = applications.map(app => app.event_id);
        const eventsRes = await fetch('https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/events', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (eventsRes.status === 429) {
            throw new Error('Throttled by API Gateway');
        }
        if (!eventsRes.ok) {
            throw new Error('Failed to fetch events: ' + eventsRes.status);
        }
        
        const allEvents = await eventsRes.json();
        // Map event_id to event details
        const eventsMap = {};
        allEvents.forEach(ev => { eventsMap[ev.event_id] = ev; });
        // Merge application info with event details
        const userEvents = applications.map(app => ({
            ...app,
            event_name: eventsMap[app.event_id]?.event_name || app.event_name || app.name,
            event_time: eventsMap[app.event_id]?.event_time || app.event_time || '',
            event_location: eventsMap[app.event_id]?.event_location || app.event_location || '',
        }));
        renderUserEvents(userEvents);
    })
    .catch(error => {
        console.error('Error loading user profile:', error);
        document.getElementById('totalEvents').textContent = '0';
        document.getElementById('userEventsList').innerHTML = '<div class="text-danger">Failed to load events. Please try again later.</div>';
    });
}

function renderUserEvents(events) {
    const list = document.getElementById('userEventsList');
    if (!events.length) {
        list.innerHTML = '<div class="text-muted">No events found.</div>';
        return;
    }
    list.innerHTML = events.map(event => `
        <div class="event-box">
            <h5>${event.event_name || event.name}</h5>
            <div>Date & Time: ${event.event_time || ''}</div>
            <div>Location: ${event.event_location || ''}</div>
            <div class="event-actions">
                <button class="btn btn-secondary btn-sm" onclick="editUserEvent('${event.event_id}')">Edit Details</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUserEvent('${event.event_id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function editUserEvent(eventId) {
    // Redirect to the edit application page for this event
                window.location.href = `edit_application_page.html?event_id=${eventId}`;
}

function deleteApplication(email, event_id) {
    fetch("https://ge1parm0ce.execute-api.us-east-1.amazonaws.com/application/" + email + "/" + event_id, {
        method: 'DELETE',
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
    .then(response => {
        if (response.message == "application deleted") {
            alert('Application deleted successfully.');
            location.reload();
        } else {
            alert('Error. Unable to delete application.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error. Unable to delete application.');
    });
}

function deleteUserEvent(eventId) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user.email) return alert('User not logged in or missing email.');
    deleteApplication(encodeURIComponent(user.email), eventId);
}


// Auto-load profile if on user_profile.html
if (window.location.pathname.endsWith('user_profile_page.html')) {
    document.addEventListener('DOMContentLoaded', loadUserProfile);
}


document.addEventListener('DOMContentLoaded', loadEvents); 