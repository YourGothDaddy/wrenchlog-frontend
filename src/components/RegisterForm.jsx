import React, { useState } from 'react';
import api from '../utils/api';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await api.post('/api/auth/register', formData);
            setSuccessMessage('Account created successfully! You can now log in.');
            setFormData({ username: '', email: '', password: '' });
        } catch (error) {
            console.error('Registration failed:', error.message);
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="auth-form-container">
            <div className="panel-header">
                <div className="panel-header-title">WRENCHLOG - CREATE ACCOUNT</div>
                <div className="panel-header-subtitle">Register to start tracking your vehicles</div>
            </div>

            {errorMessage && (
                <div className="status-box status-box-error">
                    ERROR: {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="status-box status-box-success">
                    OK: {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <div className="form-label">Username</div>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div>
                    <div className="form-label">Email Address</div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div>
                    <div className="form-label">Password</div>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <button type="submit" className="form-button">
                    [ Register ]
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;