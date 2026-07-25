import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ currentUser, onLogout }) => {
    const linkStyle = {
        textDecoration: 'none',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '12px',
        fontFamily: 'monospace'
    };

    const buttonStyle = {
        padding: '4px 8px',
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
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 15px',
            border: '2px solid #000',
            borderTop: 'none',
            backgroundColor: '#f0f0f0',
            fontFamily: 'monospace'
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold', fontSize: '16px' }}>
                WRENCHLOG
            </Link>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {currentUser ? (
                    <>
                        <Link to="/" style={linkStyle}>[ Garage ]</Link>

                        <span style={{ fontSize: '11px', color: '#555' }}>
                            USER: {currentUser.username}
                        </span>

                        <button
                            onClick={onLogout}
                            style={{ ...buttonStyle, color: '#a00' }}
                        >
                            [ Logout ]
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={linkStyle}>[ Login ]</Link>
                        <Link to="/register" style={linkStyle}>[ Register ]</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;