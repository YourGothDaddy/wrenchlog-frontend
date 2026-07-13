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

    const baseSelectStyle = { padding: '4px', border: '1px solid #777', background: '#fff', fontSize: '12px', fontFamily: 'monospace', width: '100%', boxSizing: 'border-box' };
    const baseInputStyle = { padding: '4px', border: '1px solid #777', background: '#fff', fontSize: '12px', fontFamily: 'monospace', width: '100%', boxSizing: 'border-box' };
    const baseButtonStyle = { padding: '4px 8px', background: '#e1e1e1', border: '1px solid #777', cursor: 'pointer', fontSize: '12px', color: '#000', fontWeight: 'bold', fontFamily: 'monospace' };
    const tdStyle = { padding: '6px', border: '1px solid #aaa', fontSize: '12px', textAlign: 'left', verticalAlign: 'middle' };
    const thStyle = { padding: '6px', border: '1px solid #aaa', fontSize: '12px', textAlign: 'left', background: '#eaeaea', color: '#000', fontWeight: 'bold' };

    return (
        <div style={{ padding: '10px', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff' }}>

            <div style={{ border: '2px solid #000', padding: '8px', marginBottom: '15px', backgroundColor: '#f0f0f0' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>WRENCHLOG - VIRTUAL GARAGE</div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>USER ID: {userId}</div>
            </div>

            <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '10px', fontSize: '13px' }}>Add New Vehicle</div>

                <form onSubmit={handleAddVehicle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Make</div>
                        <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)} required style={baseSelectStyle}>
                            <option value="">Select Make</option>
                            {makes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Model</div>
                        <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedMake} required style={baseSelectStyle}>
                            <option value="">Select Model</option>
                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Generation</div>
                        <select value={selectedGeneration}
                                onChange={e => setSelectedGeneration(e.target.value)}
                                disabled={!selectedModel && generations.length <= 1}
                                required style={baseSelectStyle}>
                            {generations.length <= 1 ? (
                                <option value={selectedGeneration}>No Generation Available</option>
                            ) : (
                                <>
                                    <option value="">Select Generation</option>
                                    {generations.map(g => <option key={g} value={g}>{g}</option>)}
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Engine Modification</div>
                        <select
                            value={selectedModification ? JSON.stringify(selectedModification) : ''}
                            onChange={e => setSelectedModification(e.target.value ? JSON.parse(e.target.value) : null)}
                            disabled={!selectedGeneration}
                            required
                            style={baseSelectStyle}
                        >
                            <option value="">Select Modification</option>
                            {modifications.map(m => (
                                <option key={m.id} value={JSON.stringify(m)}>{m.modification}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Year of Manufacture</div>
                        {
                            checkProductionYearsIsLegit() ? (
                                <select value={year} onChange={e => setYear(e.target.value)} disabled={!selectedModification} required style={baseSelectStyle}>
                                    {renderYearOptions()}
                                </select>
                            ) : (
                                <select value="" style={baseSelectStyle}>
                                    {renderYearOptions()}
                                </select>
                            )
                        }
                    </div>

                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Current Odometer Value (km)</div>
                        <input
                            type="number"
                            placeholder="Input integer string"
                            value={kilometers}
                            onChange={e => setKilometers(e.target.value)}
                            required
                            style={baseInputStyle}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                        <button type="submit" style={{ ...baseButtonStyle, width: '100%', padding: '6px' }}>
                            [ Commit Vehicle to Garage ]
                        </button>
                    </div>
                </form>
            </div>

            {/* Display Section: Active Registries */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>Vehicles</div>
                <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px' }}>Select row to access detailed vehicle information</div>

                {loading ? (
                    <div style={{ border: '1px solid #aaa', padding: '8px', fontSize: '12px' }}>Querying active system registers...</div>
                ) : vehicles.length === 0 ? (
                    <div style={{ border: '1px dashed #777', padding: '12px', fontSize: '12px', color: '#555' }}>
                        Datastore contains zero records. Input metadata above to register local assets.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                        <thead>
                        <tr>
                            <th style={{ ...thStyle, width: '15%' }}>Make</th>
                            <th style style={thStyle}>Model, Specifications & Year</th>
                            <th style={{ ...thStyle, width: '20%' }}>Odometer</th>
                            <th style={{ ...thStyle, width: '15%', textAlign: 'center' }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {vehicles.map(vehicle => (
                            <tr
                                key={vehicle.id}
                                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                                style={{ cursor: 'pointer', backgroundColor: '#fff' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5' }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff' }}
                            >
                                <td style={tdStyle}>{vehicle.make}</td>
                                <td style={{ ...tdStyle, color: '#0056b3', textDecoration: 'underline', fontWeight: 'bold' }}>
                                    {vehicle.model} {vehicle.year}
                                </td>
                                <td style={tdStyle}>{vehicle.kilometers.toLocaleString()} km</td>
                                <td style={{ ...tdStyle, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => handleDeleteVehicle(vehicle.id, e)}
                                        style={{ ...baseButtonStyle, color: '#a00', padding: '2px 6px' }}
                                    >
                                        [ Purge ]
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default GarageView;