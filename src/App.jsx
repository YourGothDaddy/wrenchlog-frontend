import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import GarageView from './views/GarageView'
import VehicleDashboardView from './views/VehicleDashboardView'

import RegisterForm from './components/RegisterForm'
import LoginForm from './components/LoginForm'

import Navbar from './components/Navbar'

import api from './utils/api';

import './App.css'

function App(){
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedUser = localStorage.getItem('wrenchlog_user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [mileage, setMileage] = useState('')

    const fetchGarage = async () => {
        try {
            const data = await api.get('/api/vehicles');
            setVehicles(data);
        } catch (error) {
            console.error("Failed to load garage items:", error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchGarage();
        } else {
            setVehicles([]);
        }
    }, [currentUser]);

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('wrenchlog_user', JSON.stringify(userData));
        setCurrentUser(userData);
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.removeItem('wrenchlog_user');
        setCurrentUser(null);
        navigate('/login');
    };

    return (
        <>
            <Navbar currentUser={currentUser} onLogout={handleLogout} />
            <div style={{ padding: '0 20px 20px 20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            currentUser ? (
                                <GarageView vehicles={vehicles} loading={loading} fetchGarage={fetchGarage} userId={currentUser.username} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route
                        path="/vehicle/:id"
                        element={currentUser ? <VehicleDashboardView vehicles={vehicles} userId={currentUser.username} /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path="/login"
                        element={!currentUser ? <LoginForm onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />}
                    />

                    <Route
                        path="/register"
                        element={!currentUser ? <RegisterForm /> : <Navigate to="/" replace />}
                    />
                </Routes>
            </div>
        </>
    )
}

export default App