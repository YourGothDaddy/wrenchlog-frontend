import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ currentUser, onLogout }) => {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 25px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            marginBottom: '20px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    WrenchLog
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {currentUser ? (
                    <>
                        <Link to="/" style={linkStyle}>Garage</Link>
                        <span style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                            Hello, {currentUser.username}
                        </span>
                        <button
                            onClick={onLogout}
                            style={{
                                ...linkStyle,
                                backgroundColor: '#dc3545',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={linkStyle}>Login</Link>
                        <Link to="/register" style={{
                            ...linkStyle,
                            backgroundColor: '#0056b3',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                        }}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const linkStyle = {
    textDecoration: 'none',
    color: '#555',
    fontWeight: '600',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s'
};

export default Navbar;