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

    const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '11px' };
    const inputStyle = { width: '100%', padding: '6px', boxSizing: 'border-box', border: '1px solid #777', fontFamily: 'monospace', fontSize: '13px', background: '#fff' };

    return (
        <div style={{
            maxWidth: '400px',
            margin: '40px auto',
            padding: '15px',
            border: '2px solid #000',
            backgroundColor: '#fafafa',
            fontFamily: 'monospace',
            color: '#000'
        }}>
            <div style={{ border: '1px solid #000', padding: '8px', marginBottom: '15px', backgroundColor: '#f0f0f0' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold' }}>WRENCHLOG - CREATE ACCOUNT</div>
                <div style={{ fontSize: '11px', marginTop: '2px', color: '#555' }}>Register to start tracking your vehicles</div>
            </div>

            {errorMessage && (
                <div style={{
                    border: '1px solid #a00',
                    color: '#a00',
                    padding: '8px',
                    marginBottom: '15px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: '#fff'
                }}>
                    ERROR: {errorMessage}
                </div>
            )}

            {successMessage && (
                <div style={{
                    border: '1px solid #006600',
                    color: '#006600',
                    padding: '8px',
                    marginBottom: '15px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    backgroundColor: '#fff'
                }}>
                    OK: {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <div style={labelStyle}>Username</div>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>

                <div>
                    <div style={labelStyle}>Email Address</div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>

                <div>
                    <div style={labelStyle}>Password</div>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '6px',
                        background: '#e1e1e1',
                        border: '1px solid #777',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: '#000',
                        marginTop: '6px'
                    }}
                >
                    [ Register ]
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;