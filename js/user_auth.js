// --- Tab Switching Logic ---
function showForm(formName) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    if (formName === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.style.display = 'flex';
        loginForm.style.display = 'none';
    }
}

// --- Login Handler (Your Original Code) ---
function handleLogin(event) {
    event.preventDefault();
    const loginMessage = document.getElementById('loginMessage');
    loginMessage.textContent = 'Logging in...';
    loginMessage.style.color = '#555';

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        loginMessage.textContent = 'Please enter email and password.';
        loginMessage.style.color = 'red';
        return;
    }

    var jsonData = { email, password };
    var request = new XMLHttpRequest();
    request.open("POST", "https://pm1iuvkzx8.execute-api.us-east-1.amazonaws.com/user-login", true);
    request.onload = function() {
        var response = JSON.parse(request.responseText);
        if ((response.Count === 1 && response.Items) || response.success || response.user) {
            if (response.Items && response.Items[0]) {
                sessionStorage.setItem("user", JSON.stringify(response.Items[0]));
            } else if (response.user) {
                sessionStorage.setItem("user", JSON.stringify(response.user));
            }
            loginMessage.textContent = 'Login successful!';
            loginMessage.style.color = 'green';
            setTimeout(() => {
                window.location.href = 'profile_page.html'; // Changed from user_index_page.html
            }, 1000);
        } else {
            loginMessage.textContent = response.message || 'Login failed.';
            loginMessage.style.color = 'red';
        }
    };
    request.onerror = function() {
        loginMessage.textContent = 'Network error.';
        loginMessage.style.color = 'red';
    };
    request.send(JSON.stringify(jsonData));
}

// --- Signup Handler (Your Original Code) ---
function handleSignup(event) {
    event.preventDefault();
    const signupMessage = document.getElementById('signupMessage');
    signupMessage.textContent = '';

    const email = document.getElementById('signupEmail').value.trim();
    const contactno = document.getElementById('signupContact').value.trim();
    const dob = document.getElementById('signupDOB').value;
    const fullname = document.getElementById('signupFullname').value.trim();
    const gender = document.getElementById('signupGender').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (!email || !contactno || !dob || !fullname || !gender || !password || !confirmPassword) {
        signupMessage.textContent = 'Please fill all fields.';
        signupMessage.style.color = 'red';
        return;
    }
    if (password !== confirmPassword) {
        signupMessage.textContent = 'Passwords do not match.';
        signupMessage.style.color = 'red';
        return;
    }

    var jsonData = { email, contactno, dob, fullname, gender, password };
    var request = new XMLHttpRequest();
    request.open("POST", "https://pm1iuvkzx8.execute-api.us-east-1.amazonaws.com/user-register", true);
    request.onload = function() {
        var response = JSON.parse(request.responseText);
        if (response.message === "user added" || response.success) {
            signupMessage.textContent = 'Signup successful! You can now log in.';
            signupMessage.style.color = 'green';
            showForm('login'); // Switch to login form on success
        } else {
            signupMessage.textContent = response.message || 'Signup failed.';
            signupMessage.style.color = 'red';
        }
    };
    request.onerror = function() {
        signupMessage.textContent = 'Network error.';
        signupMessage.style.color = 'red';
    };
    request.send(JSON.stringify(jsonData));
}

// Show correct form on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#signup') {
        showForm('signup');
    } else {
        showForm('login');
    }
});