import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function GarageView({ vehicles, loading, fetchGarage, userId }){
    const navigate = useNavigate()

    const [makes, setMakes] = useState([])
    const [models, setModels] = useState([])
    const [generations, setGenerations] = useState([])
    const [modifications, setModifications] = useState([])

    const [selectedMake, setSelectedMake] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedGeneration, setSelectedGeneration] = useState('')
    const [selectedModification, setSelectedModification] = useState(null)

    const [year, setYear] = useState('')
    const [kilometers, setKilometers] = useState('')

    useEffect(() => {
        fetch('http://localhost:8080/api/catalog/makes')
            .then(res => {
                if(!res.ok) throw new Error(`HTTP error fetching makes: ${res.status}`);
                return res.json()
            })
            .then(data => setMakes(data))
            .catch(err => console.error('Error fetching makes:', err))
    }, [])

    useEffect(() => {
        if (!selectedMake) { setModels([]); return; }
        fetch(`http://localhost:8080/api/catalog/models?make=${encodeURIComponent(selectedMake)}`)
            .then(res => {
                if(!res.ok) throw new Error(`HTTP error fetching models: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setModels(data)
                setGenerations([])
                setModifications([])
                setSelectedModel('')
                setSelectedGeneration('')
                setSelectedModification(null)
                setYear('')
            })
    }, [selectedMake])

    useEffect(() => {
        if (!selectedModel) { setGenerations([]); return; }
        fetch(`http://localhost:8080/api/catalog/generations?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}`)
            .then(res => {
                if(!res.ok) throw new Error(`HTTP error fetching models: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if(Array.isArray(data)){
                    const realGenerations = data.filter(gen => gen && gen.trim() !== "" && gen.toUpperCase() !== "N/A");
                    setGenerations(data);

                    if(realGenerations.length === 0 && data.length > 0){
                        setSelectedGeneration(data[0]);
                    }else {
                        setSelectedGeneration('');
                    }
                }else{
                    setGenerations([]);
                    setSelectedGeneration('')
                }
                setModifications([])
                setSelectedModification(null)
                setYear('')
            })
            .catch(err => {
                console.error('Error fetching generations:', err);
                setGenerations([]);
                setSelectedGeneration('');
            })
    }, [selectedModel, selectedMake])

    useEffect(() => {
        if (!selectedGeneration) { setModifications([]); return; }

        fetch(`http://localhost:8080/api/catalog/modifications?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&generation=${encodeURIComponent(selectedGeneration)}`)
            .then(res => {
                if (!res.ok) throw new Error("Server returned an error");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setModifications(data);
                } else {
                    setModifications([]);
                }
                setSelectedModification(null);
                setYear('');
            })
            .catch(err => {
                console.error('Error fetching modifications:', err);
                setModifications([]);
            });
    }, [selectedGeneration, selectedModel, selectedMake])

    const checkProductionYearsIsLegit = () => {
        if(selectedModification){
            const startYear = selectedModification.startYear;
            return startYear >= 1885;
        }else{
            return true;
        }
    }

    const renderYearOptions = () => {
        if (!selectedModification) return <option value="">Choose Modification First</option>

        if(!checkProductionYearsIsLegit()){
            return <option value="">No available production years</option>
        }

        const start = selectedModification.startYear
        const end = selectedModification.endYear ? selectedModification.endYear : 2026

        const yearOptions = []
        for (let y = start; y <= end; y++) {
            yearOptions.push(y)
        }

        return (
            <>
                <option value="">Select Production Year</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </>
        )
    }

    const handleAddVehicle = (e) => {
        e.preventDefault()

        const newVehicle = {
            make: selectedMake,
            model: `${selectedModel} ${selectedGeneration} (${selectedModification.modification})`,
            year: year && year !== "" ? parseInt(year): null,
            kilometers: parseInt(kilometers),
            userId
        }

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
                setSelectedMake('')
                setKilometers('')
                fetchGarage()
            })
            .catch(error => console.error('Error adding vehicle:', error))
    }

    const handleDeleteVehicle = (vehicleId, e) => {
        e.stopPropagation()

        fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if(!response.ok) throw new Error('Failed to delete vehicle record')
            })
            .then(() => {
                fetchGarage()
            })
            .catch(error => console.error('Error deleting vehicle entry:', error))
    }

    return (
        <div>
            <h1>wrenchLog - Virtual Garage</h1>
            <p>Welcome back, <strong>{userId}</strong>!</p>
            <hr />

            <div style={{ backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
                <h3>Add a Vehicle to Your Garage</h3>
                <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)} required style={{ padding: '8px' }}>
                        <option value="">Select Make</option>
                        {makes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedMake} required style={{ padding: '8px' }}>
                        <option value="">Select Model</option>
                        {models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select value={selectedGeneration}
                            onChange={e => setSelectedGeneration(e.target.value)}
                            disabled={!selectedModel && generations.length <= 1}
                            required style={{ padding: '8px' }}>
                        {generations.length <= 1 ? (
                            <option value={selectedGeneration}>No Generation Available</option>
                        ) : (
                            <>
                                <option value="">Select Generation</option>
                                {generations.map(g => <option key={g} value={g}>{g}</option>)}
                            </>
                        )}
                    </select>

                    <select
                        value={selectedModification ? JSON.stringify(selectedModification) : ''}
                        onChange={e => setSelectedModification(e.target.value ? JSON.parse(e.target.value) : null)}
                        disabled={!selectedGeneration}
                        required
                        style={{ padding: '8px' }}
                    >
                        <option value="">Select Modification</option>
                        {modifications.map(m => (
                            <option key={m.id} value={JSON.stringify(m)}>{m.modification}</option>
                        ))}
                    </select>

                    {
                        checkProductionYearsIsLegit() ? (
                            <select value={year} onChange={e => setYear(e.target.value)} disabled={!selectedModification} required style={{ padding: '8px' }}>
                                {renderYearOptions()}
                            </select>
                        ) : (
                            <select value="" style={{ padding: '8px' }}>
                                {renderYearOptions()}
                            </select>
                        )
                    }

                    <input
                        type="number"
                        placeholder="Current Kilometers"
                        value={kilometers}
                        onChange={e => setKilometers(e.target.value)}
                        required
                        style={{ padding: '8px' }}
                    />

                    <button type="submit" style={{ padding: '10px', backgroundColor: '#222', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        Roll Vehicle into Garage
                    </button>
                </form>
            </div>

            <div>
                <h2>My Vehicles</h2>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Click on a vehicle to open its dashboard</p>
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
                                style={{
                                    borderBottom: '1px solid #ccc',
                                    padding: '15px 10px',
                                    cursor: 'pointer',
                                    backgroundColor: '#fff',
                                    display: 'flex',
                                    justifyContent: 'between',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ flexGrow: 1 }}>
                                    <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong> - {vehicle.kilometers.toLocaleString()} kilometers
                                </span>
                                <button
                                    onClick={(e) => handleDeleteVehicle(vehicle.id, e)}
                                    style={{
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        marginLeft: '15px'
                                    }}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default GarageView;