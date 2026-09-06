import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = ({ currentUser, onLogout }) => {
    const { t } = useTranslation();

    const linkStyle = {
        textDecoration: 'none',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '12px',
        fontFamily: 'monospace'
    };

    const buttonStyle = {
        padding: '4px 12px',
        background: '#e1e1e1',
        border: '1px solid #777',
        cursor: 'pointer',
        fontSize: '12px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#000'
    };

    return (
        <nav style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 15px',
            border: '2px solid #000',
            borderTop: 'none',
            backgroundColor: '#f0f0f0',
            fontFamily: 'monospace'
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold', fontSize: '16px' }}>
                {t('nav.brand')}
            </Link>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                {currentUser ? (
                    <>
                        <Link to="/" style={linkStyle}>{t('nav.garage')}</Link>
                        <Link to="/settings" style={linkStyle}>{t('nav.settings')}</Link>

                        <span style={{ fontSize: '11px', color: '#555' }}>
                            {t('nav.user', { username: currentUser.username })}
                        </span>

                        <button
                            onClick={onLogout}
                            style={{ ...buttonStyle, color: '#a00' }}
                        >
                            {t('nav.logout')}
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={linkStyle}>{t('nav.login')}</Link>
                        <Link to="/register" style={linkStyle}>{t('nav.register')}</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;