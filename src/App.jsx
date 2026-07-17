import { useState, useEffect } from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import GarageView from './views/GarageView'
import VehicleDashboardView from './views/VehicleDashboardView'

import RegisterForm from './components/RegisterForm'
import LoginForm from './components/LoginForm'

import Navbar from './components/Navbar'

import './App.css'

function App(){
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)

    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem('wrenchlog_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [mileage, setMileage] = useState('')

    const fetchGarage = () => {
        if (!currentUser) return;

        setLoading(true);

        fetch(`http://localhost:8080/api/vehicles?username=${currentUser.username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network error');
                }
                return response.json();
            })
            .then(data => {
                setVehicles(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching vehicles:', error);
                setLoading(false);
            })
    }

    useEffect(() => {
        if (currentUser) {
            fetchGarage();
        } else {
            setVehicles([]);
            setLoading(false);
        }
    }, [currentUser])

    const handleLogout = () => {
        localStorage.removeItem('wrenchlog_user');
        setCurrentUser(null);
    };

    return (
        <Router>
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
                        element={!currentUser ? <LoginForm onLoginSuccess={setCurrentUser} /> : <Navigate to="/" replace />}
                    />

                    <Route
                        path="/register"
                        element={!currentUser ? <RegisterForm /> : <Navigate to="/" replace />}
                    />
                </Routes>
            </div>
        </Router>
    )
}

export default App