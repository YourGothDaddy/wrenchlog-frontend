import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

const LoginForm = ({onLoginSuccess}) => {
    const { t } = useTranslation();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const data = await api.post('/api/auth/login', {
                username: formData.username,
                password: formData.password
            });

            onLoginSuccess(data);

        } catch (error) {
            console.error("Login failed:", error.message);
            setErrorMessage(error.message || t('auth.login.failedDefault'));
        }
    };

    return (
        <div className="auth-form-container">
            <div className="panel-header">
                <div className="panel-header-title">{t('auth.login.title')}</div>
                <div className="panel-header-subtitle">{t('auth.login.subtitle')}</div>
            </div>

            {errorMessage && (
                <div className="status-box status-box-error">
                    {t('common.errorPrefix')} {errorMessage}
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
                    {t('auth.login.submit')}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;