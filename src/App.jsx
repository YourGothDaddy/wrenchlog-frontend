import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import GarageView from './views/GarageView'
import VehicleDashboardView from './views/VehicleDashboardView'

import RegisterForm from './components/RegisterForm'
import LoginForm from './components/LoginForm'

import Navbar from './components/Navbar'

import api from './utils/api';

import SettingsView from './views/SettingsView'

import './App.css'

function App(){
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [vehicles, setVehicles] = useState([])
    const [authChecked, setAuthChecked] = useState(false)
    const [garageLoading, setGarageLoading] = useState(true)

    useEffect(() => {
        api.get('/api/auth/me')
            .then(userData => setCurrentUser(userData))
            .catch(() => setCurrentUser(null))
            .finally(() => setAuthChecked(true));
    }, []);

    const fetchGarage = async () => {
        setGarageLoading(true);
        try {
            const data = await api.get('/api/vehicles');
            setVehicles(data);
        } catch (error) {
            console.error("Failed to load garage items:", error);
        } finally {
            setGarageLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchGarage();
        } else {
            setVehicles([]);
            setGarageLoading(false);
        }
    }, [currentUser]);


    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData);
        navigate('/');
    };

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout', {});
        } catch (e) {
            console.error('Logout request failed:', e);
        }
        setCurrentUser(null);
        navigate('/login');
    };

    if (!authChecked) {
        return null;
    }

    return (
        <>
            <Navbar currentUser={currentUser} onLogout={handleLogout} />
            <div style={{ padding: '0 20px 20px 20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            currentUser ? (
                                <GarageView vehicles={vehicles} loading={garageLoading} fetchGarage={fetchGarage} username={currentUser.username} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route
                        path="/vehicle/:id"
                        element={currentUser ? <VehicleDashboardView vehicles={vehicles} fetchGarage={fetchGarage} /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path="/login"
                        element={!currentUser ? <LoginForm onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />}
                    />

                    <Route
                        path="/register"
                        element={!currentUser ? <RegisterForm /> : <Navigate to="/" replace />}
                    />

                    <Route
                        path="/settings"
                        element={currentUser ? <SettingsView currentUser={currentUser} onProfileUpdated={setCurrentUser} /> : <Navigate to="/login" replace />}
                    />
                </Routes>
            </div>
        </>
    )
}

export default App