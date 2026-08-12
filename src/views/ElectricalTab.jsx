import { useState, useEffect } from 'react'
import api from '../utils/api'

const baseInputStyle = { padding: '4px', border: '1px solid #777', background: '#fff', fontSize: '12px', fontFamily: 'monospace' }
const baseButtonStyle = { padding: '4px 12px', background: '#e1e1e1', border: '1px solid #777', cursor: 'pointer', fontSize: '12px', color: '#000', fontWeight: 'bold', fontFamily: 'monospace' }
const smallButtonStyle = { ...baseButtonStyle, padding: '2px 8px' }
const tdStyle = { padding: '5px', border: '1px solid #aaa', fontSize: '12px', textAlign: 'left' }
const thStyle = { padding: '5px', border: '1px solid #aaa', fontSize: '12px', textAlign: 'left', background: '#eaeaea', color: '#000' }
const stickyThStyle = { ...thStyle, position: 'sticky', left: 0, zIndex: 2 }
const stickyTdStyle = { ...tdStyle, position: 'sticky', left: 0, zIndex: 1, background: '#f0f0f0' }

function ElectricalTab({ vehicleId, setErrorMessage }) {
    const [components, setComponents] = useState([])
    const [selectedComponentId, setSelectedComponentId] = useState(null)
    const [componentDetail, setComponentDetail] = useState(null)

    const [showNewComponentForm, setShowNewComponentForm] = useState(false)
    const [newComponentName, setNewComponentName] = useState('')
    const [newComponentDescription, setNewComponentDescription] = useState('')

    const [showNewPinForm, setShowNewPinForm] = useState(false)
    const [newPinName, setNewPinName] = useState('')
    const [newPinRange, setNewPinRange] = useState('')

    const [showNewSessionForm, setShowNewSessionForm] = useState(false)
    const [newSessionLabel, setNewSessionLabel] = useState('')
    const [newSessionNotes, setNewSessionNotes] = useState('')

    const [editingCell, setEditingCell] = useState(null)
    const [editValue, setEditValue] = useState('')
    const [editUnit, setEditUnit] = useState('')

    const [editingComponentId, setEditingComponentId] = useState(null)
    const [editComponentName, setEditComponentName] = useState('')
    const [editComponentDescription, setEditComponentDescription] = useState('')

    const fetchComponents = () => {
        api.get(`/api/vehicles/${vehicleId}/electrical/components`)
            .then(data => setComponents(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to load electrical components.')
            })
    }

    const fetchComponentDetail = (componentId) => {
        api.get(`/api/vehicles/${vehicleId}/electrical/components/${componentId}`)
            .then(data => setComponentDetail(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to load component detail.')
            })
    }

    useEffect(() => {
        fetchComponents()
    }, [vehicleId])

    useEffect(() => {
        if (selectedComponentId) {
            fetchComponentDetail(selectedComponentId)
        } else {
            setComponentDetail(null)
        }
    }, [selectedComponentId])

    const handleCreateComponent = (e) => {
        e.preventDefault()
        setErrorMessage('')
        api.post(`/api/vehicles/${vehicleId}/electrical/components`, { name: newComponentName, description: newComponentDescription })
            .then(() => {
                setNewComponentName('')
                setNewComponentDescription('')
                setShowNewComponentForm(false)
                fetchComponents()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to create component.')
            })
    }

    const handleDeleteComponent = (componentId) => {
        if (!window.confirm('Delete this component and all its pins and sessions? This cannot be undone.')) return
        setErrorMessage('')
        api.delete(`/api/vehicles/${vehicleId}/electrical/components/${componentId}`)
            .then(() => {
                if (selectedComponentId === componentId) setSelectedComponentId(null)
                fetchComponents()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete component.')
            })
    }

    const openComponentEditor = (component) => {
        setEditingComponentId(component.id)
        setEditComponentName(component.name)
        setEditComponentDescription(component.description || '')
    }

    const handleUpdateComponent = (e) => {
        e.preventDefault()
        setErrorMessage('')
        api.put(`/api/vehicles/${vehicleId}/electrical/components/${editingComponentId}`,
            { name: editComponentName, description: editComponentDescription })
            .then(() => {
                setEditingComponentId(null)
                fetchComponents()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to update component.')
            })
    }

    const handleCreatePin = (e) => {
        e.preventDefault()
        setErrorMessage('')
        api.post(`/api/vehicles/${vehicleId}/electrical/components/${selectedComponentId}/pins`, { name: newPinName, expectedRange: newPinRange })
            .then(() => {
                setNewPinName('')
                setNewPinRange('')
                setShowNewPinForm(false)
                fetchComponentDetail(selectedComponentId)
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to add pin.')
            })
    }

    const handleDeletePin = (pinId) => {
        if (!window.confirm('Delete this pin? This cannot be undone.')) return
        setErrorMessage('')
        api.delete(`/api/vehicles/${vehicleId}/electrical/components/${selectedComponentId}/pins/${pinId}`)
            .then(() => fetchComponentDetail(selectedComponentId))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete pin. It may already have readings recorded against it.')
            })
    }

    const handleMovePin = (pinId, direction) => {
        setErrorMessage('')
        api.put(`/api/vehicles/${vehicleId}/electrical/components/${selectedComponentId}/pins/${pinId}/move?direction=${direction}`, {})
            .then(() => fetchComponentDetail(selectedComponentId))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to reorder pin.')
            })
    }

    const handleCreateSession = (e) => {
        e.preventDefault()
        setErrorMessage('')
        api.post(`/api/vehicles/${vehicleId}/electrical/components/${selectedComponentId}/sessions`, { label: newSessionLabel, notes: newSessionNotes })
            .then(() => {
                setNewSessionLabel('')
                setNewSessionNotes('')
                setShowNewSessionForm(false)
                fetchComponentDetail(selectedComponentId)
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to create session.')
            })
    }

    const handleDeleteSession = (sessionId) => {
        if (!window.confirm('Delete this session and all its readings? This cannot be undone.')) return
        setErrorMessage('')
        api.delete(`/api/vehicles/${vehicleId}/electrical/components/${selectedComponentId}/sessions/${sessionId}`)
            .then(() => fetchComponentDetail(selectedComponentId))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete session.')
            })
    }

    const openCellEditor = (sessionId, pinId, existingReading) => {
        setEditingCell({ sessionId, pinId })
        setEditValue(existingReading ? existingReading.value || '' : '')
        setEditUnit(existingReading ? existingReading.unit || '' : '')
    }

    const handleSaveReading = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const { sessionId, pinId } = editingCell
        api.put(`/api/vehicles/${vehicleId}/electrical/components/${selectedComponentId}/sessions/${sessionId}/readings/${pinId}`,
            { value: editValue, unit: editUnit })
            .then(() => {
                setEditingCell(null)
                fetchComponentDetail(selectedComponentId)
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to save reading.')
            })
    }

    const getReading = (session, pinId) => session.readings.find(r => r.pinId === pinId)

    if (!selectedComponentId) {
        return (
            <div>
                <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Electrical Components</span>
                        <button onClick={() => setShowNewComponentForm(!showNewComponentForm)} style={baseButtonStyle}>
                            {showNewComponentForm ? 'Hide Form' : 'Add Component'}
                        </button>
                    </div>

                    {showNewComponentForm && (
                        <form onSubmit={handleCreateComponent} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                            <input placeholder="Component Name (e.g. MAF Sensor)" value={newComponentName} onChange={e => setNewComponentName(e.target.value)} required style={{ ...baseInputStyle, flex: '1 1 200px' }} />
                            <input placeholder="Description (optional)" value={newComponentDescription} onChange={e => setNewComponentDescription(e.target.value)} style={{ ...baseInputStyle, flex: '1 1 200px' }} />
                            <button type="submit" style={baseButtonStyle}>Save</button>
                        </form>
                    )}

                    {components.length === 0 ? (
                        <div style={{ fontSize: '12px', color: '#666' }}>No electrical components tracked yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {components.map(c => (
                                <div key={c.id} style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#fff' }}>
                                    {editingComponentId === c.id ? (
                                        <form onSubmit={handleUpdateComponent} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'flex-start' }}>
                                            <input
                                                value={editComponentName}
                                                onChange={e => setEditComponentName(e.target.value)}
                                                required
                                                style={{ ...baseInputStyle, flex: '1 1 200px' }}
                                            />
                                            <input
                                                value={editComponentDescription}
                                                onChange={e => setEditComponentDescription(e.target.value)}
                                                placeholder="Description (optional)"
                                                style={{ ...baseInputStyle, flex: '1 1 200px' }}
                                            />
                                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                <button type="submit" style={{ ...smallButtonStyle, whiteSpace: 'nowrap' }}>Save</button>
                                                <button type="button" onClick={() => setEditingComponentId(null)} style={{ ...smallButtonStyle, whiteSpace: 'nowrap' }}>Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', wordBreak: 'break-word' }}>{c.name}</div>
                                                {c.description && (
                                                    <div style={{ fontSize: '11px', color: '#555', wordBreak: 'break-word' }}>{c.description}</div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                <button onClick={() => setSelectedComponentId(c.id)} style={smallButtonStyle}>Open</button>
                                                <button onClick={() => openComponentEditor(c)} style={smallButtonStyle}>Edit</button>
                                                <button onClick={() => handleDeleteComponent(c.id)} style={{ ...smallButtonStyle, color: '#a00' }}>Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (!componentDetail) {
        return <div style={{ fontSize: '12px' }}>Loading component...</div>
    }

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => setSelectedComponentId(null)} style={baseButtonStyle}>Back to Components</button>
            </div>

            <div style={{ border: '2px solid #000', padding: '8px', marginBottom: '15px', backgroundColor: '#f0f0f0' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{componentDetail.name}</div>
                {componentDetail.description && <div style={{ fontSize: '11px', marginTop: '2px', color: '#555' }}>{componentDetail.description}</div>}
            </div>

            <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Pins</span>
                    <button onClick={() => setShowNewPinForm(!showNewPinForm)} style={baseButtonStyle}>
                        {showNewPinForm ? 'Hide Form' : 'Add Pin'}
                    </button>
                </div>

                {showNewPinForm && (
                    <form onSubmit={handleCreatePin} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        <input placeholder="Pin Name (e.g. Ground)" value={newPinName} onChange={e => setNewPinName(e.target.value)} required style={{ ...baseInputStyle, flex: '1 1 150px' }} />
                        <input placeholder="Expected Range (optional, e.g. 0.5V - 4.5V)" value={newPinRange} onChange={e => setNewPinRange(e.target.value)} style={{ ...baseInputStyle, flex: '1 1 200px' }} />
                        <button type="submit" style={baseButtonStyle}>Save</button>
                    </form>
                )}

                {componentDetail.pins.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#666' }}>No pins defined yet. Add pins before creating sessions.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {componentDetail.pins.map((p, index) => (
                            <div key={p.id} style={{ border: '1px solid #000', padding: '4px 8px', backgroundColor: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: '#555', minWidth: '28px' }}>#{index + 1}</span>
                                <span style={{ flex: 1 }}><strong>{p.name}</strong>{p.expectedRange ? ` (${p.expectedRange})` : ''}</span>
                                <button onClick={() => handleMovePin(p.id, 'up')} disabled={index === 0} style={{ ...smallButtonStyle, padding: '1px 6px' }}>Up</button>
                                <button onClick={() => handleMovePin(p.id, 'down')} disabled={index === componentDetail.pins.length - 1} style={{ ...smallButtonStyle, padding: '1px 6px' }}>Down</button>
                                <button onClick={() => handleDeletePin(p.id)} style={{ ...smallButtonStyle, padding: '1px 6px', color: '#a00' }}>Delete</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Sessions</span>
                    <button
                        onClick={() => setShowNewSessionForm(!showNewSessionForm)}
                        disabled={componentDetail.pins.length === 0}
                        style={baseButtonStyle}
                    >
                        {showNewSessionForm ? 'Hide Form' : 'New Session'}
                    </button>
                </div>

                {componentDetail.pins.length === 0 && (
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Add at least one pin before creating a session.</div>
                )}

                {showNewSessionForm && (
                    <form onSubmit={handleCreateSession} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        <input placeholder="Session Label (e.g. Cold Start)" value={newSessionLabel} onChange={e => setNewSessionLabel(e.target.value)} required style={{ ...baseInputStyle, flex: '1 1 200px' }} />
                        <input placeholder="Notes (optional)" value={newSessionNotes} onChange={e => setNewSessionNotes(e.target.value)} style={{ ...baseInputStyle, flex: '1 1 200px' }} />
                        <button type="submit" style={baseButtonStyle}>Save</button>
                    </form>
                )}

                {componentDetail.sessions.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#666' }}>No sessions recorded yet.</div>
                ) : (
                    <div style={{ overflowX: 'auto', border: '1px solid #aaa' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr>
                                <th style={stickyThStyle}>Pin</th>
                                {componentDetail.sessions.map(s => (
                                    <th key={s.id} style={thStyle}>
                                        <div>{s.label}</div>
                                        <div style={{ fontWeight: 'normal', fontSize: '10px', color: '#555' }}>
                                            {new Date(s.sessionDate).toLocaleString()}
                                        </div>
                                        {s.notes && (
                                            <div style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '10px', color: '#777', maxWidth: '160px', whiteSpace: 'normal' }}>
                                                {s.notes}
                                            </div>
                                        )}
                                        <button onClick={() => handleDeleteSession(s.id)} style={{ ...smallButtonStyle, padding: '1px 6px', marginTop: '4px', color: '#a00' }}>Delete</button>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {componentDetail.pins.map((pin, pinIndex) => (
                                <tr key={pin.id}>
                                    <td style={stickyTdStyle}>
                                        <span style={{ color: '#555', marginRight: '4px' }}>#{pinIndex + 1}</span>
                                        <strong>{pin.name}</strong>
                                        {pin.expectedRange && <div style={{ fontWeight: 'normal', fontSize: '10px', color: '#555' }}>{pin.expectedRange}</div>}
                                    </td>
                                    {componentDetail.sessions.map(session => {
                                        const reading = getReading(session, pin.id)
                                        const isEditing = editingCell && editingCell.sessionId === session.id && editingCell.pinId === pin.id
                                        return (
                                            <td key={session.id} style={{ ...tdStyle, minWidth: '140px' }}>
                                                {isEditing ? (
                                                    <form onSubmit={handleSaveReading} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <input
                                                            placeholder="Value"
                                                            value={editValue}
                                                            onChange={e => setEditValue(e.target.value)}
                                                            style={{ ...baseInputStyle, width: '100%' }}
                                                            autoFocus
                                                        />
                                                        <input
                                                            placeholder="Unit (optional)"
                                                            value={editUnit}
                                                            onChange={e => setEditUnit(e.target.value)}
                                                            style={{ ...baseInputStyle, width: '100%' }}
                                                        />
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <button type="submit" style={{ ...smallButtonStyle, whiteSpace: 'nowrap' }}>Save</button>
                                                            <button type="button" onClick={() => setEditingCell(null)} style={{ ...smallButtonStyle, whiteSpace: 'nowrap' }}>Cancel</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div onClick={() => openCellEditor(session.id, pin.id, reading)} style={{ cursor: 'pointer', minHeight: '18px' }}>
                                                        {reading && reading.value
                                                            ? `${reading.value}${reading.unit ? ' ' + reading.unit : ''}`
                                                            : <span style={{ color: '#999' }}>—</span>}
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ElectricalTab