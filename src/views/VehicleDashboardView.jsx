import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import api, { BASE_URL } from '../utils/api'
import { formatDate } from '../utils/dateFormat'

function VehicleDashboardView({ vehicles, userId }) {
    const { id } = useParams()
    const navigate = useNavigate()

    const vehicle = vehicles.find(v => v.id === parseInt(id))

    const [activeTab, setActiveTab] = useState('history')

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

    const [files, setFiles] = useState([])

    const [notes, setNotes] = useState([])
    const [noteTitle, setNoteTitle] = useState('')
    const [noteContent, setNoteContent] = useState('')
    const [editingNoteId, setEditingNoteId] = useState(null)

    const [reminders, setReminders] = useState([])
    const [reminderTitle, setReminderTitle] = useState('')
    const [reminderDesc, setReminderDesc] = useState('')
    const [lastServiceOdo, setLastServiceOdo] = useState('')
    const [intervalOdo, setIntervalOdo] = useState('')
    const [intervalMonths, setIntervalMonths] = useState('')
    const [lastServiceDate, setLastServiceDate] = useState('')
    const [showReminderForm, setShowReminderForm] = useState(false)
    const [editingReminderId, setEditingReminderId] = useState(null)

    const [errorMessage, setErrorMessage] = useState('')

    const fetchServiceLogs = () => {
        if (!vehicle) return
        api.get(`/api/services?vehicleId=${id}`)
            .then(logs => { setServiceLogs(logs); setLoading(false); })
            .catch(err => {
                console.error(err)
                setLoading(false)
                setErrorMessage(err.message || 'Failed to load service logs.')
            })
    }

    const fetchFiles = () => {
        api.get(`/api/vehicles/${id}/files`)
            .then(data => setFiles(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to load files.')
            })
    }

    const fetchNotes = () => {
        api.get(`/api/vehicles/${id}/notes`)
            .then(data => setNotes(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to load notes.')
            })
    }

    const fetchReminders = () => {
        api.get(`/api/reminders?vehicleId=${id}`)
            .then(data => setReminders(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to load reminders.')
            })
    }

    const handleDownload = async (fileId) => {
        setErrorMessage('')
        try {
            const { token } = await api.get(`/api/vehicles/${id}/files/${fileId}/download-token`);
            window.location.href = `${BASE_URL}/api/vehicles/${id}/files/${fileId}/download?token=${token}`;
        } catch (err) {
            console.error(err)
            setErrorMessage(err.message || 'Failed to download file.')
        }
    };

    const handleDeleteFile = (fileId) => {
        if (!window.confirm("Delete this file? This cannot be undone.")) {
            return;
        }

        setErrorMessage('')

        api.delete(`/api/vehicles/${id}/files/${fileId}`)
            .then(() => fetchFiles())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete file.')
            })
    }

    useEffect(() => {
        fetchServiceLogs()
        fetchFiles()
        fetchNotes()
        fetchReminders()
    }, [id, vehicle])

    const handleAddServiceLog = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const newLog = { description, cost: parseFloat(cost), kilometersAtService: parseInt(kilometersAtService), serviceDate }
        api.post(`/api/services?vehicleId=${id}`, newLog)
            .then(() => {
                setDescription(''); setCost(''); setKilometersAtService(''); setServiceDate('');
                fetchServiceLogs()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to add service log.')
            })
    }

    const handleDeleteServiceLog = (serviceLogId) => {
        if (!window.confirm("Delete this service log entry? This cannot be undone.")) {
            return;
        }

        setErrorMessage('')

        api.delete(`/api/services/${serviceLogId}`)
            .then(() => fetchServiceLogs())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete service log.')
            })
    }

    const handleModifyServiceLogModal = (log) => {
        if (modifyModalIsOpen) {
            setCurrentActiveLog(null); setModalDescription(''); setModalServiceDate('');
            setModalKilometersAtService(''); setModalCost(''); setModifyModal(false)
        } else {
            setCurrentActiveLog(log); setModalDescription(log.description); setModalServiceDate(log.serviceDate);
            setModalKilometersAtService(log.kilometersAtService); setModalCost(log.cost); setModifyModal(true)
        }
    }

    const handleModifyServiceLog = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const modifiedServiceLog = {
            description: modalDescription,
            cost: parseFloat(modalCost),
            kilometersAtService: parseInt(modalKilometersAtService),
            serviceDate: modalServiceDate
        }
        api.put(`/api/services/${currentActiveLog.id}?vehicleId=${id}`, modifiedServiceLog)
            .then(() => {
                setModifyModal(false)
                fetchServiceLogs()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to update service log.')
            })
    }

    const handleSaveNote = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const payload = { title: noteTitle, content: noteContent }
        const isEditing = editingNoteId !== null
        const endpoint = isEditing ? `/api/vehicles/${id}/notes/${editingNoteId}` : `/api/vehicles/${id}/notes`

        const request = isEditing ? api.put(endpoint, payload) : api.post(endpoint, payload)
        request.then(() => { setNoteTitle(''); setNoteContent(''); setEditingNoteId(null); fetchNotes(); })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to save note.')
            })
    }

    const handleEditNoteSetup = (note) => {
        setNoteTitle(note.title); setNoteContent(note.content); setEditingNoteId(note.id);
    }

    const handleDeleteNote = (noteId) => {
        if (!window.confirm("Delete this note? This cannot be undone.")) {
            return;
        }

        setErrorMessage('')

        api.delete(`/api/vehicles/${id}/notes/${noteId}`)
            .then(() => fetchNotes())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete note.')
            })
    }

    const handleSaveReminder = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const payload = {
            title: reminderTitle,
            description: reminderDesc,
            lastServiceAtOdometer: lastServiceOdo ? parseInt(lastServiceOdo) : null,
            intervalOdometer: intervalOdo ? parseInt(intervalOdo) : null,
            intervalMonths: intervalMonths ? parseInt(intervalMonths) : null,
            lastServiceAtDate: lastServiceDate || null
        }
        const isEditing = editingReminderId !== null
        const endpoint = isEditing ? `/api/reminders/${editingReminderId}?vehicleId=${id}` : `/api/reminders?vehicleId=${id}`

        const request = isEditing ? api.put(endpoint, payload) : api.post(endpoint, payload)
        request.then(() => { clearReminderForm(); fetchReminders(); })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to save reminder.')
            })
    }

    const handleResetReminder = (reminder) => {
        setErrorMessage('')
        const today = new Date().toISOString().split('T')[0]
        const payload = {
            title: reminder.title,
            description: reminder.description,
            lastServiceAtOdometer: vehicle.kilometers,
            intervalOdometer: reminder.intervalOdometer,
            intervalMonths: reminder.intervalMonths,
            lastServiceAtDate: today
        }
        api.put(`/api/reminders/${reminder.id}?vehicleId=${id}`, payload)
            .then(() => fetchReminders())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to reset reminder.')
            })
    }

    const handleEditReminderSetup = (reminder) => {
        setReminderTitle(reminder.title); setReminderDesc(reminder.description || '');
        setLastServiceOdo(reminder.lastServiceAtOdometer || ''); setIntervalOdo(reminder.intervalOdometer || '');
        setIntervalMonths(reminder.intervalMonths || ''); setLastServiceDate(reminder.lastServiceAtDate || '');
        setEditingReminderId(reminder.id); setShowReminderForm(true);
    }

    const handleDeleteReminder = (reminderId) => {
        if (!window.confirm("Delete this reminder? This cannot be undone.")) {
            return;
        }

        setErrorMessage('')

        api.delete(`/api/reminders/${reminderId}`)
            .then(() => fetchReminders())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete reminder.')
            })
    }

    const clearReminderForm = () => {
        setReminderTitle(''); setReminderDesc(''); setLastServiceOdo('');
        setIntervalOdo(''); setIntervalMonths(''); setLastServiceDate('');
        setEditingReminderId(null); setShowReminderForm(false);
    }

    const checkIsDue = (reminder) => {
        let odoDue = false; let dateDue = false;
        if (reminder.intervalOdometer && reminder.lastServiceAtOdometer !== null) {
            if (vehicle.kilometers >= (reminder.lastServiceAtOdometer + reminder.intervalOdometer)) odoDue = true;
        }
        if (reminder.intervalMonths && reminder.lastServiceAtDate) {
            const lastDate = new Date(reminder.lastServiceAtDate);
            lastDate.setMonth(lastDate.getMonth() + reminder.intervalMonths);
            if (new Date() >= lastDate) dateDue = true;
        }
        return odoDue || dateDue;
    }

    if (loading) return <div style={{ padding: '10px', fontFamily: 'monospace' }}>Loading workspace...</div>
    if (!vehicle) return <div style={{ padding: '10px', fontFamily: 'monospace' }}><p>Vehicle not found.</p><button onClick={() => navigate('/')}>Back</button></div>

    const baseInputStyle = { padding: '4px', border: '1px solid #777', background: '#fff', fontSize: '12px', fontFamily: 'monospace' };
    const baseButtonStyle = { padding: '4px 8px', background: '#e1e1e1', border: '1px solid #777', cursor: 'pointer', fontSize: '12px', color: '#000', fontWeight: 'bold' };
    const tdStyle = { padding: '5px', border: '1px solid #aaa', fontSize: '12px', textAlign: 'left' };
    const thStyle = { padding: '5px', border: '1px solid #aaa', fontSize: '12px', textAlign: 'left', background: '#eaeaea', color: '#000' };

    return (
        <div style={{ padding: '10px', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff' }}>

            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => navigate('/')} style={baseButtonStyle}>[Return to Garage]</button>
            </div>

            {errorMessage && (
                <div style={{ border: '1px solid #a00', color: '#a00', padding: '8px', marginBottom: '15px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff' }}>
                    ERROR: {errorMessage}
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '2px solid #000' }}>
                <tbody>
                <tr>
                    <td style={{ ...tdStyle, background: '#f0f0f0', fontWeight: 'bold', width: '15%' }}>VEHICLE:</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{vehicle.year} {vehicle.make} {vehicle.model}</td>
                    <td style={{ ...tdStyle, background: '#f0f0f0', fontWeight: 'bold', width: '20%' }}>CURRENT ODOMETER:</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', width: '20%' }}>{vehicle.kilometers.toLocaleString()} km</td>
                </tr>
                </tbody>
            </table>

            <div style={{ display: 'flex', borderBottom: '2px solid #000', marginBottom: '15px' }}>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                        border: '1px solid #000', borderBottom: activeTab === 'history' ? '2px solid #fff' : '1px solid #000',
                        backgroundColor: activeTab === 'history' ? '#fff' : '#e1e1e1', marginBottom: '-2px', marginRight: '4px'
                    }}
                >
                    Maintenance & Records
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                        border: '1px solid #000', borderBottom: activeTab === 'notes' ? '2px solid #fff' : '1px solid #000',
                        backgroundColor: activeTab === 'notes' ? '#fff' : '#e1e1e1', marginBottom: '-2px'
                    }}
                >
                    Diagnostic Scratchpad Notes
                </button>
            </div>

            {activeTab === 'history' ? (
                <div>
                    <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px' }}>SYSTEM MAINTENANCE ALARMS</span>
                            <button onClick={() => setShowReminderForm(!showReminderForm)} style={baseButtonStyle}>
                                {showReminderForm ? "[ Hide Form ]" : "[ Configure New Rule ]"}
                            </button>
                        </div>

                        {showReminderForm && (
                            <form onSubmit={handleSaveReminder} style={{ border: '1px dashed #000', padding: '8px', marginBottom: '10px', backgroundColor: '#fff' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>RULE CONFIGURATION METADATA</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                                    <input type="text" placeholder="Task Title (Required)" value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} required style={baseInputStyle} />
                                    <input type="text" placeholder="Directives / Parts Preferences (Optional)" value={reminderDesc} onChange={e => setReminderDesc(e.target.value)} style={baseInputStyle} />
                                    <input type="number" placeholder="Last Comp Odometer (km)" value={lastServiceOdo} onChange={e => setLastServiceOdo(e.target.value)} style={baseInputStyle} />
                                    <input type="number" placeholder="Interval Metric Limit (km)" value={intervalOdo} onChange={e => setIntervalOdo(e.target.value)} style={baseInputStyle} />
                                    <input type="date" value={lastServiceDate} onChange={e => setLastServiceDate(e.target.value)} style={baseInputStyle} />
                                    <input type="number" placeholder="Interval Metric Limit (Months)" value={intervalMonths} onChange={e => setIntervalMonths(e.target.value)} style={baseInputStyle} />
                                </div>
                                <button type="submit" style={baseButtonStyle}>[ Save Ruleset ]</button>
                                <button type="button" onClick={clearReminderForm} style={{ ...baseButtonStyle, marginLeft: '5px' }}>[ Cancel ]</button>
                            </form>
                        )}

                        {reminders.length === 0 ? (
                            <div style={{ color: '#555', fontSize: '11px' }}>No monitoring thresholds defined.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Reminder Target Task</th>
                                    <th style={thStyle}>Rules & Benchmarks</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reminders.map(rem => {
                                    const isDue = checkIsDue(rem);
                                    return (
                                        <tr key={rem.id} style={{ backgroundColor: isDue ? '#ffebeb' : '#f7fff7' }}>
                                            <td style={{ ...tdStyle, color: isDue ? '#cc0000' : '#006600', fontWeight: 'bold' }}>
                                                {isDue ? "CRITICAL/DUE" : "OPERATIONAL"}
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: 'bold' }}>{rem.title}</span>
                                                {rem.description && <div style={{ fontSize: '11px', color: '#555' }}>Note: {rem.description}</div>}
                                            </td>
                                            <td style={tdStyle}>
                                                {rem.intervalOdometer && <div>Odo: Every {rem.intervalOdometer.toLocaleString()} km (Last: {rem.lastServiceAtOdometer?.toLocaleString()} km)</div>}
                                                {rem.intervalMonths && <div>Time: Every {rem.intervalMonths} months (Last: {rem.lastServiceAtDate ? formatDate(rem.lastServiceAtDate) : "None"})</div>}
                                            </td>
                                            <td style={tdStyle}>
                                                <button onClick={() => handleResetReminder(rem)} style={{ ...baseButtonStyle, background: isDue ? '#ffcccc' : '#ccffcc', padding: '2px 4px' }}>[ Reset Cycle ]</button>
                                                <button onClick={() => handleEditReminderSetup(rem)} style={{ ...baseButtonStyle, marginLeft: '4px', padding: '2px 4px' }}>[ Edit ]</button>
                                                <button onClick={() => handleDeleteReminder(rem.id)} style={{ ...baseButtonStyle, marginLeft: '4px', padding: '2px 4px', color: '#a00' }}>[ Clear ]</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>RECORD REPAIR ENTRY</div>
                            <form onSubmit={handleAddServiceLog} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required style={{ ...baseInputStyle, gridColumn: 'span 2' }} />
                                <input type="number" step="0.01" placeholder="Cost (€)" value={cost} onChange={e => setCost(e.target.value)} required style={baseInputStyle} />
                                <input type="number" placeholder="Odometer (km)" value={kilometersAtService} onChange={e => setKilometersAtService(e.target.value)} required style={baseInputStyle} />
                                <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} required style={baseInputStyle} />
                                <button type="submit" style={baseButtonStyle}>[ Append Data Log ]</button>
                            </form>
                        </div>

                        <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>ATTACH FILE</div>
                            <input
                                type="file"
                                style={{ fontSize: '11px', width: '100%', marginBottom: '8px' }}
                                onChange={(e) => {
                                    setErrorMessage('')
                                    const formData = new FormData()
                                    formData.append("file", e.target.files[0])
                                    api.post(`/api/vehicles/${id}/files`, formData)
                                        .then(() => fetchFiles())
                                        .catch(err => {
                                            console.error(err)
                                            setErrorMessage(err.message || 'Failed to upload file.')
                                        })
                                }}
                            />
                            <div style={{ fontSize: '10px', color: '#666' }}>Upload system receipts or datasheets.</div>
                        </div>
                    </div>

                    {modifyModalIsOpen && currentActiveLog && (
                        <div style={{ border: '2px solid #fd7e14', padding: '10px', marginBottom: '15px', backgroundColor: '#fffbe6' }}>
                            <div style={{ fontWeight: 'bold', color: '#fd7e14', marginBottom: '8px' }}>MODIFY SYSTEM LOG ID: {currentActiveLog.id}</div>
                            <form onSubmit={handleModifyServiceLog} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                <input type="text" value={modalDescription} onChange={e => setModalDescription(e.target.value)} required style={{ ...baseInputStyle, gridColumn: 'span 2' }} />
                                <input type="number" step="0.01" value={modalCost} onChange={e => setModalCost(e.target.value)} required style={baseInputStyle} />
                                <input type="number" value={modalKilometersAtService} onChange={e => setModalKilometersAtService(e.target.value)} required style={baseInputStyle} />
                                <input type="date" value={modalServiceDate} onChange={e => setModalServiceDate(e.target.value)} required style={baseInputStyle} />
                                <div>
                                    <button type="submit" style={{ ...baseButtonStyle, background: '#fd7e14', color: '#fff' }}>[ Apply Edits ]</button>
                                    <button type="button" onClick={() => setModifyModal(false)} style={{ ...baseButtonStyle, marginLeft: '5px' }}>[ Close ]</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>HISTORICAL MAINTENANCE LEDGER</div>
                        {serviceLogs.length === 0 ? (
                            <div style={{ border: '1px solid #aaa', padding: '8px', color: '#666' }}>No entries logged in data matrix.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Work Description</th>
                                    <th style={thStyle}>Odometer Tracking</th>
                                    <th style={thStyle}>Financial Net Cost</th>
                                    <th style={thStyle}>Management System Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {serviceLogs.map(log => (
                                    <tr key={log.id}>
                                        <td style={tdStyle}>{formatDate(log.serviceDate)}</td>
                                        <td style={tdStyle}>{log.description}</td>
                                        <td style={tdStyle}>{log.kilometersAtService.toLocaleString()} km</td>
                                        <td style={tdStyle}>€{log.cost.toFixed(2)}</td>
                                        <td style={tdStyle}>
                                            <button onClick={() => handleModifyServiceLogModal(log)} style={{ ...baseButtonStyle, padding: '1px 4px' }}>[ Modify ]</button>
                                            <button onClick={() => handleDeleteServiceLog(log.id)} style={{ ...baseButtonStyle, marginLeft: '4px', padding: '1px 4px', color: '#a00' }}>[ Delete ]</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '6px' }}>DOCUMENT ARCHIVE</div>
                        {files.length === 0 ? <div style={{ fontSize: '11px', color: '#666' }}>No external binaries stored.</div> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                                <tbody>
                                {files.map(file => (
                                    <tr key={file.id}>
                                        <td style={tdStyle}>
                                            <button onClick={() => handleDownload(file.id)} style={{ color: '#0056b3', textDecoration: 'underline' }}>
                                                {file.fileName}
                                            </button>
                                        </td>
                                        <td style={{ ...tdStyle, width: '15%', color: '#666' }}>{file.fileType}</td>
                                        <td style={{ ...tdStyle, width: '15%', textAlign: 'center' }}>
                                            <button onClick={() => handleDeleteFile(file.id)} style={{ ...baseButtonStyle, padding: '1px 4px', color: '#a00' }}>[ Wipe ]</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa', marginBottom: '15px' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>
                            {editingNoteId ? "AMEND ACTIVE DIAGNOSTIC DATA FIELD" : "INITIALIZE NEW DIAGNOSTIC SCRATCHPAD ROW"}
                        </div>
                        <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input type="text" placeholder="Problem Vector Context Name" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} required style={baseInputStyle} />
                            <textarea placeholder="Log dynamic telemetry tracking configurations or execution testing workflows here..." value={noteContent} onChange={e => setNoteContent(e.target.value)} required rows="4" style={{ ...baseInputStyle, resize: 'vertical' }} />
                            <div>
                                <button type="submit" style={baseButtonStyle}>[ Record Matrix Entry ]</button>
                                {editingNoteId && <button type="button" onClick={() => { setNoteTitle(''); setNoteContent(''); setEditingNoteId(null); }} style={{ ...baseButtonStyle, marginLeft: '5px' }}>[ Abort ]</button>}
                            </div>
                        </form>
                    </div>

                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>STORED RAW DIAGNOSTIC TEXT SCRATCHPAD DATA</div>
                    {notes.length === 0 ? (
                        <div style={{ border: '1px solid #aaa', padding: '8px', color: '#666' }}>Scratchpad environment contains no stored tracking strings.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {notes.map(note => (
                                <div key={note.id} style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #aaa', paddingBottom: '2px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 'bold' }}>PARAM: {note.title}</span>
                                        <div>
                                            <button onClick={() => handleEditNoteSetup(note)} style={{ ...baseButtonStyle, padding: '1px 4px' }}>[ Edit ]</button>
                                            <button onClick={() => handleDeleteNote(note.id)} style={{ ...baseButtonStyle, marginLeft: '4px', padding: '1px 4px', color: '#a00' }}>[ Wipe ]</button>
                                        </div>
                                    </div>
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '11px', background: '#fcfcfc', padding: '4px', border: '1px solid #eee' }}>{note.content}</pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default VehicleDashboardView;