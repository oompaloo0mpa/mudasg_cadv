
const clientId = '5k7vaogaak4jl1ahvjptb024vf';
const userPoolId = 'us-east-1_XoGK4XDqP';
const cognitoEndpoint = 'https://cognito-idp.us-east-1.amazonaws.com/';

const loginForm = document.getElementById('loginForm');
const resultDiv = document.getElementById('result');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    resultDiv.textContent = 'Logging in...';

    const body = {
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password
        },
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId
    };

    try {
        const response = await fetch(cognitoEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (response.ok) {
            resultDiv.textContent = 'Login successful!';
            console.log('Tokens:', data.AuthenticationResult);

            // tokens for admin auth
            localStorage.setItem('cognitoAccessToken', data.AuthenticationResult.AccessToken);
            localStorage.setItem('cognitoIdToken', data.AuthenticationResult.IdToken);
            localStorage.setItem('cognitoRefreshToken', data.AuthenticationResult.RefreshToken);

            // remove any previous user info
            localStorage.removeItem('userType');

            // to main page
            window.location.href = 'index_page.html';
        } else {
            resultDiv.textContent = 'Login failed: ' + (data.message || JSON.stringify(data));
        }
    } catch (err) {
        resultDiv.textContent = 'Error: ' + err.message;
    }
}); 