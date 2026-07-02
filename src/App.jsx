import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import GarageView from './views/GarageView'
import VehicleDashboardView from './views/VehicleDashboardView'

import RegisterForm from './components/RegisterForm'
import Navbar from './components/Navbar'

import './App.css'

function App(){
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = 'alexander' //Hardcoded for testing

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')

  const fetchGarage = () => {
    fetch(`http://localhost:8080/api/vehicles?userId=${userId}`)
        .then(response => {
          if(!response.ok){
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
    fetchGarage()
  }, [])

    return (
        <Router>
            <Navbar />
            <div style={{ padding: '0 20px 20px 20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
                <Routes>
                    <Route
                        path="/"
                        element={<GarageView vehicles={vehicles} loading={loading} fetchGarage={fetchGarage} userId={userId} />}
                    />

                    <Route
                        path="/vehicle/:id"
                        element={<VehicleDashboardView vehicles={vehicles} />}
                    />

                    <Route
                        path="/register"
                        element={<RegisterForm />}
                    />
                </Routes>
            </div>
        </Router>
    )
}

export default App