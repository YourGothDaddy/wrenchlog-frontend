import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function GarageView({ vehicles, loading, fetchGarage, userId }){
    const navigate = useNavigate()
    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [kilometers, setKilometers] = useState('')

    const handleAddVehicle = (e) => {
        e.preventDefault()
        const newVehicle = { make, model, year: parseInt(year), kilometers: parseInt(kilometers), userId}

        fetch('http://localhost:8080/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newVehicle)
        })
            .then(response => {
                if(!response.ok) throw new Error('Failed to add vehicle')
                return response.json()
            })
            .then(() => {
                setMake('')
                setModel('')
                setYear('')
                setKilometers('')
                fetchGarage()
            })
            .catch(error => console.error('Error adding vehicle:', error))
    }

    return (
        <div>
            <h1>wrenchLog - Virtual Garage</h1>
            <p>Welcome back, <strong>{userId}</strong>!</p>
            <hr />

            <div style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                <h3>Add a Vehicle to Your Garage</h3>
                <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="Make" value={make} onChange={e => setMake(e.target.value)} required />
                    <input type="text" placeholder="Model" value={model} onChange={e => setModel(e.target.value)} required />
                    <input type="number" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} required />
                    <input type="number" placeholder="Current Kilometers" value={kilometers} onChange={e => setKilometers(e.target.value)} required />
                    <button type="submit" style={{ padding: '10px', backgroundColor: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Roll Vehicle into Garage
                    </button>
                </form>
            </div>

            <div>
                <h2>My Vehicles</h2>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Click on a vehicle to open its dashboard.</p>
                {loading ? (
                    <p>Loading your garage...</p>
                ) : vehicles.length === 0 ? (
                    <p>Your garage is empty. Time to grab a wrench and add a car!</p>
                ) : (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {vehicles.map(vehicle => (
                            <li
                                key={vehicle.id}
                                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                                style={{ borderBottom: '1px solid #ccc', padding: '15px 10px', cursor: 'pointer', backgroundColor: '#fff' }}
                            >
                                <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong> - {vehicle.kilometers.toLocaleString()} kilometers
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default GarageView