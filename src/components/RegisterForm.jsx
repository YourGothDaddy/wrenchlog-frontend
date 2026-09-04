import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

const RegisterForm = () => {
    const { t } = useTranslation();
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
            setSuccessMessage(t('auth.register.success'));
            setFormData({ username: '', email: '', password: '' });
        } catch (error) {
            console.error('Registration failed:', error.message);
            setErrorMessage(error.message || t('auth.register.failedDefault'));
        }
    };

    return (
        <div className="auth-form-container">
            <div className="panel-header">
                <div className="panel-header-title">{t('auth.register.title')}</div>
                <div className="panel-header-subtitle">{t('auth.register.subtitle')}</div>
            </div>

            {errorMessage && (
                <div className="status-box status-box-error">
                    {t('common.errorPrefix')} {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="status-box status-box-success">
                    {t('common.okPrefix')} {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <div className="form-label">{t('auth.usernameLabel')}</div>
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
                    <div className="form-label">{t('auth.emailLabel')}</div>
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
                    <div className="form-label">{t('auth.passwordLabel')}</div>
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
                    {t('auth.register.submit')}
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;