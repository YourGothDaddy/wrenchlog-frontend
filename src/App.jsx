import { useState, useEffect } from 'react'
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

  const handleAddVehicle = (e) => {
    e.preventDefault()

    const newVehicle = {
      make: make,
      model: model,
      year: parseInt(year),
      mileage: parseInt(mileage),
      userId: userId
    }

    fetch('http://localhost:8080/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newVehicle)
    })
        .then(response => {
          if(!response.ok) throw new Error('failed to add vehicle')
          return response.json()
        })
        .then(() => {
          setMake('')
          setModel('')
          setYear('')
          setMileage('')
          fetchGarage()
        })
        .catch(error => console.error('Error adding vehicle:', error))
  }

  return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
        <h1>wrenchLog - Virtual Garage</h1>
        <p>Welcome back, <strong>{userId}</strong>!</p>
        <hr />

        <div style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>Add a Vehicle to Your Garage</h3>
          <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Make (e.g. Honda)" value={make} onChange={e => setMake(e.target.value)} required />
            <input type="text" placeholder="Model (e.g. Civic)" value={model} onChange={e => setModel(e.target.value)} required />
            <input type="number" placeholder="Year (e.g. 2018)" value={year} onChange={e => setYear(e.target.value)} required />
            <input type="number" placeholder="Current Mileage" value={mileage} onChange={e => setMileage(e.target.value)} required />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Roll Vehicle into Garage
            </button>
          </form>
        </div>

        {/* Displaying the List */}
        <div>
          <h2>My Vehicles</h2>
          {loading ? (
              <p>Loading your garage...</p>
          ) : vehicles.length === 0 ? (
              <p>Your garage is empty. Time to grab a wrench and add a car!</p>
          ) : (
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {vehicles.map(vehicle => (
                    <li key={vehicle.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                      <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong> — {vehicle.mileage.toLocaleString()} miles
                    </li>
                ))}
              </ul>
          )}
        </div>
      </div>
  )
}

export default App