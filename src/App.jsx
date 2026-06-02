import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import GarageView from './views/GarageView'
import VehicleDashboardView from './views/VehicleDashboardView'
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
            <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
                <Routes>
                    <Route
                        path="/"
                        element={<GarageView vehicles={vehicles} loading={loading} fetchGarage={fetchGarage} userId={userId} />}
                    />

                    <Route
                        path="/vehicle/:id"
                        element={<VehicleDashboardView vehicles={vehicles} />}
                    />
                </Routes>
            </div>
        </Router>
    )
}

export default App