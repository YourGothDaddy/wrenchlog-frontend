import { useParams, useNavigate } from 'react-router-dom'
import {useEffect, useState} from "react";

function VehicleDashboardView( {vehicles} ) {
    const { id } = useParams()
    const navigate = useNavigate()

    const vehicle = vehicles.find(v => v.id === parseInt(id))

    const [serviceLogs, setServiceLogs] = useState([])
    const [loading, setLoading] = useState(true)

    const [description, setDescription] = useState('')
    const [cost, setCost] = useState('')
    const [kilometersAtService, setKilometersAtService] = useState('')
    const [serviceDate, setServiceDate] = useState('')

    const [modifyModalIsOpen, setModifyModal] = useState(false)
    const [currentActiveLog, setCurrentActiveLog] = useState(null)

    const [modalDescription, setModalDescription] = useState('')
    const [modalCost, setModalCost] = useState('')
    const [modalKilometersAtService, setModalKilometersAtService] = useState('')
    const [modalServiceDate, setModalServiceDate] = useState('')

    const fetchServiceLogs = () => {
        if (!vehicle) return

        fetch(`http://localhost:8080/api/services?vehicleId=${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load logs')
                return response.json()
            })
            .then(logs => {
                setServiceLogs(logs)
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching service details:', error)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchServiceLogs()
    }, [id, vehicle])

    const handleAddServiceLog = (e) => {
        e.preventDefault()

        const newLog = {
            description,
            cost: parseFloat(cost),
            kilometersAtService: parseInt(kilometersAtService),
            serviceDate
        }

        fetch(`http://localhost:8080/api/services?vehicleId=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLog)
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to append log record')
                return response.json()
            })
            .then(() => {
                setDescription('')
                setCost('')
                setKilometersAtService('')
                setServiceDate('')
                fetchServiceLogs()
            })
            .catch(error => console.error('Error saving service entry:', error))
    }

    const handleDeleteServiceLog = (serviceLogId) => {
        fetch(`http://localhost:8080/api/services/${serviceLogId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if(!response.ok) throw new Error('Failed to delete log record')
            })
            .then(() => {
                fetchServiceLogs()
            })
            .catch(error => console.error('Error deleting service entry:', error))
    }


    const handleModifyServiceLogModal = (log) => {
        if(modifyModalIsOpen){
            setCurrentActiveLog(null)
            setModalDescription('')
            setModalServiceDate('')
            setModalKilometersAtService('')
            setModalCost('')
            setModifyModal(false)
        }else{
            setCurrentActiveLog(log)
            setModifyModal(true)
        }
    }
    const handleModifyServiceLog = (e) => {
        e.preventDefault()

        const modifiedServiceLog = {
            description: modalDescription === '' ? currentActiveLog.description : modalDescription,
            cost: modalCost === '' ? currentActiveLog.cost : parseFloat(modalCost),
            kilometersAtService: modalKilometersAtService === '' ? currentActiveLog.kilometersAtService : modalKilometersAtService,
            serviceDate: modalServiceDate === '' ? currentActiveLog.serviceDate : modalServiceDate
        }

        fetch(`http://localhost:8080/api/services/${currentActiveLog.id}?id=${id}`,{
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modifiedServiceLog)
        }).then(response => {
            if (!response.ok) throw new Error('Failed to modify log record')
            return response.json()
        }).then(() => {
            setModifyModal(!modifyModalIsOpen)
            fetchServiceLogs()
        }).catch(error => console.error('Error modifying service entry:', error))
    }

    if (loading) return <div style={{ padding: '20px' }}>Loading workspace panel...</div>
    if (!vehicle) return <div style={{ padding: '20px' }}><p>Vehicle not found.</p><button onClick={() => navigate('/')}>Back to Garage</button></div>

    return (
        <div>
            <button onClick={() => navigate('/')} style={{ padding: '5px 10px', marginBottom: '20px', cursor: 'pointer' }}>
                Back to My Garage
            </button>

            <div style={{ border: '2px solid #222', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa', marginBottom: '20px' }}>
                <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                <p><strong>Current Odometer Profile:</strong> {vehicle.kilometers.toLocaleString()} km</p>
            </div>

            <div style={{ backgroundColor: '#eef2f7', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                <h3>Log a New Service / Repair Event</h3>
                <form onSubmit={handleAddServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="Description (e.g. Oil change & filter)" value={description} onChange={e => setDescription(e.target.value)} required />
                    <input type="number" step="0.01" placeholder="Cost (€)" value={cost} onChange={e => setCost(e.target.value)} required />
                    <input type="number" placeholder="Odometer value at service (km)" value={kilometersAtService} onChange={e => setKilometersAtService(e.target.value)} required />
                    <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} required />
                    <button type="submit" style={{ padding: '10px', backgroundColor: '#0056b3', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        Save Repair Log Entry
                    </button>
                </form>
            </div>

            <div>
                <h3>Maintenance History Log Table</h3>
                {serviceLogs.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No maintenance history logs linked to this vehicle yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#222', color: '#fff', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Description</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Odometer</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Cost</th>
                        </tr>
                        </thead>
                        <tbody>
                        {serviceLogs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{log.serviceDate}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{log.description}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{log.kilometersAtService.toLocaleString()} km</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>€{log.cost.toFixed(2)}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}> <button onClick={() => {
                                    handleModifyServiceLogModal(log)
                                }} style={{
                                    backgroundColor: '#fd7e14',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                }} >Modify</button></td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}> <button onClick={() => handleDeleteServiceLog(log.id)} style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                }} >Delete</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modifyModalIsOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>

                    <div style={{
                        backgroundColor: '#eef2f7',
                        padding: '25px',
                        borderRadius: '8px',
                        width: '100%',
                        maxWidth: '450px',
                        boxShadow: '0px 4px 15px rgba(0,0,0,0.2)',
                        position: 'relative'
                    }}>

                        <button
                            onClick={() => handleModifyServiceLogModal()}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'none',
                                border: 'none',
                                fontSize: '18px',
                                cursor: 'pointer',
                                color: '#555'
                            }}
                        >
                            ✕
                        </button>

                        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Modify a Service / Repair Event</h3>

                        <form onSubmit={handleModifyServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="text" placeholder="Description (e.g. Oil change & filter)" value={modalDescription === '' ? currentActiveLog.description : modalDescription} onChange={e => setModalDescription(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            <input type="number" step="0.01" placeholder="Cost (€)" value={modalCost === '' ? currentActiveLog.cost : modalCost} onChange={e => setModalCost(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            <input type="number" placeholder="Odometer value at service (km)" value={modalKilometersAtService === '' ? currentActiveLog.kilometersAtService : modalKilometersAtService} onChange={e => setModalKilometersAtService(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            <input type="date" value={modalServiceDate === '' ? currentActiveLog.serviceDate : modalServiceDate} onChange={e => setModalServiceDate(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#0056b3', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                    Save Repair Log Entry
                                </button>
                                <button type="button" onClick={() => handleModifyServiceLogModal()} style={{ flex: 1, padding: '10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>

    )
}

export default VehicleDashboardView