const API_BASE = 'https://pm1iuvkzx8.execute-api.us-east-1.amazonaws.com/events';
const APPLICATION_API = 'https://pm1iuvkzx8.execute-api.us-east-1.amazonaws.com/application';
const APPLICATION_EVENT_API = 'https://pm1iuvkzx8.execute-api.us-east-1.amazonaws.com/application-event';

// Load event details and setup apply button

function getUser() {
    return JSON.parse(sessionStorage.getItem('user'));
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, setting up event details...');
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event_id');
    console.log('Event ID:', eventId);
    if (!eventId) return;

    // Fetch event details
    const res = await fetch(API_BASE, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (res.status === 429) {
        alert('Too many requests! Please wait a moment before trying again.');
        return;
    }
    if (!res.ok) {
        console.error('Failed to fetch events:', res.status);
        return;
    }
    
    const events = await res.json();
    const event = events.find(e => e.event_id == eventId);
    if (!event) return;

    document.getElementById('eventName').textContent = event.event_name;
    document.getElementById('eventTime').textContent = formatDateTime(event.event_time);
    document.getElementById('eventLocation').textContent = event.event_location;
    document.getElementById('eventDescription').textContent = event.event_description;

    // Setup Apply button
    const applyBtn = document.getElementById('applyBtn');
    console.log('Apply button found:', applyBtn);
    if (applyBtn) {
        applyBtn.style.display = 'inline-block';
        applyBtn.onclick = function() { 
            console.log('Apply button clicked!');
            applyForEvent(eventId, event); 
        };
        console.log('Apply button event listener added');
    } else {
        console.error('Apply button not found!');
    }
});

function formatDateTime(dt) {
    const d = new Date(dt);
    return d.toLocaleString();
}

async function applyForEvent(eventId, event) {
    console.log('applyForEvent called with eventId:', eventId);
    const user = getUser();
    console.log('User data:', user);
    
    if (!user || !user.email) {
        alert('You need to be logged in to apply for events!');
        window.location.href = 'user_auth_page.html';
        return;
    }
    
    // Build application data
    const jsonData = {
        email: user.email,
        event_id: Number(eventId),
        name: user.fullname || '',
        contactno: user.contactno || ''
    };
    console.log('Sending application data:', jsonData);
    
    try {
        const res = await fetch(APPLICATION_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        });
        console.log('Response status:', res.status);
        
        if (res.status === 429) {
            alert('Too many requests! Please wait a moment before trying again.');
            return;
        }
        
        const data = await res.json();
        console.log('Response data:', data);
        
        if (res.ok) {
            alert('Application submitted successfully!');
            // Optionally redirect or update UI
        } else {
            alert(data.message || 'Application failed.');
        }
    } catch (err) {
        console.error('Error applying for event:', err);
        alert('Network error: ' + err.message);
    }
}
// Add edit and delete application functions as needed, using the endpoints from Postman. 