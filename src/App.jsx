import { useState, useEffect } from 'react'
import './App.css'

function App(){
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = 'alexander' //Hardcoded for testing

  useEffect(() => {
    fetch(`http://localhost:8080/api/vehicles?userId${userId}`)
        .then(response => {
          if(!response.ok){
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setVehicles(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching behicles:', error);
          setLoading(false);
        })
  }, [])

  return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>wrenchLog - Virtual Garage</h1>
        <p>Welcome back, <strong>{userId}</strong>!</p>
        <hr />

        {loading ? (
            <p>Loading your garage...</p>
        ) : (
            <div>
              <h2>My Vehicles</h2>
              {vehicles.length === 0 ? (
                  <p>Your garage is empty. Time to grab a wrench and add a car!</p>
              ) : (
                  <ul>
                  </ul>
              )}
            </div>
        )}
      </div>
  )
}

export default App