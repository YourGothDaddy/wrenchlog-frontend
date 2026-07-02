import React, { useState } from 'react';

const LoginForm = ({onLoginSuccess}) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(async (response) => {
                if (response.status === 200) {
                    const userData = await response.json();

                    localStorage.setItem('wrenchlog_user', JSON.stringify(userData));

                    onLoginSuccess(userData);
                } else if (response.status === 401) {
                    const textError = await response.text();
                    setErrorMessage(textError);
                } else {
                    setErrorMessage('Something went wrong on the server. Please try again.');
                }
            })
            .catch(error => {
                console.error('Login network error:', error);
                setErrorMessage('Unable to connect to the server. Check if your backend is running.');
            });
    };

    return (
        <div style={{
            maxWidth: '400px',
            margin: '40px auto',
            padding: '25px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            backgroundColor: '#ffffff',
            fontFamily: 'sans-serif'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Sign In</h2>

            {errorMessage && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '0.9em',
                    border: '1px solid #f5c6cb'
                }}>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            boxSizing: 'border-box',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            boxSizing: 'border-box',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '1em'
                    }}
                >
                    Sign In
                </button>
            </form>
        </div>
    );
};

export default LoginForm;