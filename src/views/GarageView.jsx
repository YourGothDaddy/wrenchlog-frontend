import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useVehicleCatalog from '../hooks/useVehicleCatalog'

function GarageView({ vehicles, loading, fetchGarage, username }){
    const navigate = useNavigate()

    const [errorMessage, setErrorMessage] = useState('')
    const [kilometers, setKilometers] = useState('')

    const {
        makes, models, generations, modifications,
        selectedMake, setSelectedMake,
        selectedModel, setSelectedModel,
        selectedGeneration, setSelectedGeneration,
        selectedModification, setSelectedModification,
        year, setYear,
        isProductionYearRangeValid,
        resetSelections
    } = useVehicleCatalog(setErrorMessage)

    const renderYearOptions = () => {
        if (!selectedModification) return <option value="">Choose Modification First</option>

        if (!isProductionYearRangeValid()) {
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
        setErrorMessage('')

        const newVehicle = {
            make: selectedMake,
            model: `${selectedModel} ${selectedGeneration} (${selectedModification.modification})`,
            year: year && year !== "" ? parseInt(year) : null,
            kilometers: parseInt(kilometers),
        }

        api.post('/api/vehicles', newVehicle)
            .then(() => {
                resetSelections()
                setKilometers('')
                fetchGarage()
            })
            .catch(error => {
                console.error(error)
                setErrorMessage(error.message || 'Failed to add vehicle.')
            })
    }

    const handleDeleteVehicle = (vehicleId, e) => {
        e.stopPropagation()

        if (!window.confirm("Delete this vehicle? This cannot be undone.")) {
            return;
        }

        setErrorMessage('')

        api.delete(`/api/vehicles/${vehicleId}`)
            .then(() => {
                fetchGarage()
            })
            .catch(error => {
                console.error(error)
                setErrorMessage(error.message || 'Failed to delete vehicle.')
            })
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
                <div style={{ fontSize: '11px', marginTop: '2px' }}>USER: {username}</div>
            </div>

            {errorMessage && (
                <div style={{ border: '1px solid #a00', color: '#a00', padding: '8px', marginBottom: '15px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff' }}>
                    ERROR: {errorMessage}
                </div>
            )}

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
                            isProductionYearRangeValid() ? (
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
                            <th style={thStyle}>Model, Specifications & Year</th>
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