
// src/components/OAuthCallback.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuth2Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Send the code to your backend to exchange it for tokens
            fetch('http://138.2.87.100:5000/oauth2callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.access_token) {
                        // Store tokens or handle success
                        console.log("Access token:", data.access_token);
                        localStorage.setItem('accessToken', data.access_token); 


                        // Redirect to a different page after successful authentication
                        navigate('/home');
                    } else {
                        console.error("Error exchanging code for tokens:", data);
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    navigate('/');
                });
        }
    }, [navigate]);

    return <div>Loading...</div>;
}

export default OAuth2Callback;