import { useParams, useNavigate } from 'react-router-dom'
import {useEffect, useState} from "react";

function VehicleDashboardView( {vehicles, userId} ) {
    const { id } = useParams()
    const navigate = useNavigate()

    const vehicle = vehicles.find(v => v.id === parseInt(id))

    const [activeTab, setActiveTab] = useState('history');

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

    const fetchFiles = () => {
        fetch(`http://localhost:8080/api/vehicles/${id}/files`)
            .then(res => res.json())
            .then(data => setFiles(data))
            .catch(err => console.error("Error fetching files:", err));
    };

    const fetchNotes = () => {
        fetch(`http://localhost:8080/api/vehicles/${id}/notes`)
            .then(res => res.json())
            .then(data => setNotes(data))
            .catch(err => console.error("Error loading diagnostic notes:", err));
    };

    const fetchReminders = () => {
        fetch(`http://localhost:8080/api/reminders?vehicleId=${id}`)
            .then(res => res.json())
            .then(data => setReminders(data))
            .catch(err => console.error("Error loading reminders:", err));
    };

    const handleDeleteFile = (fileId) => {

        fetch(`http://localhost:8080/api/vehicles/${id}/files/${fileId}?userId=${userId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.status === 204) {
                    fetchFiles();
                } else if (response.status === 403) {
                    alert("Access Denied: You do not have permission to delete this file.");
                } else {
                    throw new Error(`Failed to delete file. Status: ${response.status}`);
                }
            })
            .catch(error => console.error('Error deleting document:', error));
    };

    useEffect(() => {
        fetchServiceLogs()
        fetchFiles()
        fetchNotes()
        fetchReminders()
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

    const handleSaveNote = (e) => {
        e.preventDefault();
        const payload = { title: noteTitle, content: noteContent };

        const isEditing = editingNoteId !== null;
        const endpoint = isEditing
            ? `http://localhost:8080/api/vehicles/${id}/notes/${editingNoteId}`
            : `http://localhost:8080/api/vehicles/${id}/notes`;

        fetch(endpoint, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error("Could not process note action.");
                return res.json();
            })
            .then(() => {
                setNoteTitle('');
                setNoteContent('');
                setEditingNoteId(null);
                fetchNotes();
            })
            .catch(err => console.error(err));
    };

    const handleEditNoteSetup = (note) => {
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setEditingNoteId(note.id);
    };

    const handleDeleteNote = (noteId) => {
        fetch(`http://localhost:8080/api/vehicles/${id}/notes/${noteId}`, { method: 'DELETE' })
            .then(res => res.status === 204 ? fetchNotes() : alert("Error wiping note"))
            .catch(err => console.error(err));
    };

    const handleSaveReminder = (e) => {
        e.preventDefault();
        const payload = {
            title: reminderTitle,
            description: reminderDesc,
            lastServiceAtOdometer: lastServiceOdo ? parseInt(lastServiceOdo) : null,
            intervalOdometer: intervalOdo ? parseInt(intervalOdo) : null,
            intervalMonths: intervalMonths ? parseInt(intervalMonths) : null,
            lastServiceAtDate: lastServiceDate || null
        };

        const isEditing = editingReminderId !== null;
        const endpoint = isEditing
            ? `http://localhost:8080/api/reminders/${editingReminderId}?vehicleId=${id}`
            : `http://localhost:8080/api/reminders?vehicleId=${id}`;

        fetch(endpoint, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error("Could not process reminder action.");
                return res.json();
            })
            .then(() => {
                clearReminderForm();
                fetchReminders();
            })
            .catch(err => console.error(err));
    };

    const handleResetReminder = (reminder) => {
        const today = new Date().toISOString().split('T')[0];
        const payload = {
            title: reminder.title,
            description: reminder.description,
            lastServiceAtOdometer: vehicle.kilometers, // Resets to vehicle's current odometer
            intervalOdometer: reminder.intervalOdometer,
            intervalMonths: reminder.intervalMonths,
            lastServiceAtDate: today // Resets to today's date
        };

        fetch(`http://localhost:8080/api/reminders/${reminder.id}?vehicleId=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to reset reminder interval thresholds.");
                return res.json();
            })
            .then(() => fetchReminders())
            .catch(err => console.error(err));
    };

    const handleEditReminderSetup = (reminder) => {
        setReminderTitle(reminder.title);
        setReminderDesc(reminder.description || '');
        setLastServiceOdo(reminder.lastServiceAtOdometer || '');
        setIntervalOdo(reminder.intervalOdometer || '');
        setIntervalMonths(reminder.intervalMonths || '');
        setLastServiceDate(reminder.lastServiceAtDate || '');
        setEditingReminderId(reminder.id);
        setShowReminderForm(true); // Open drawer to show edited values
    };

    const handleDeleteReminder = (reminderId) => {
        fetch(`http://localhost:8080/api/reminders/${reminderId}`, { method: 'DELETE' })
            .then(res => res.status === 204 ? fetchReminders() : alert("Failed to clear reminder row."))
            .catch(err => console.error(err));
    };

    const clearReminderForm = () => {
        setReminderTitle('');
        setReminderDesc('');
        setLastServiceOdo('');
        setIntervalOdo('');
        setIntervalMonths('');
        setLastServiceDate('');
        setEditingReminderId(null);
        setShowReminderForm(false);
    };

    const checkIsDue = (reminder) => {
        let odoDue = false;
        let dateDue = false;

        if (reminder.intervalOdometer && reminder.lastServiceAtOdometer !== null) {
            const nextOdoDue = reminder.lastServiceAtOdometer + reminder.intervalOdometer;
            if (vehicle.kilometers >= nextOdoDue) odoDue = true;
        }

        if (reminder.intervalMonths && reminder.lastServiceAtDate) {
            const lastDate = new Date(reminder.lastServiceAtDate);
            lastDate.setMonth(lastDate.getMonth() + reminder.intervalMonths);
            const today = new Date();
            if (today >= lastDate) dateDue = true;
        }

        return odoDue || dateDue;
    };

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

            <div style={{ display: 'flex', borderBottom: '2px solid #ccc', marginBottom: '25px', gap: '5px' }}>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        border: '1px solid #ccc',
                        borderBottom: activeTab === 'history' ? '3px solid #0056b3' : '1px solid transparent',
                        backgroundColor: activeTab === 'history' ? '#eef2f7' : '#fff',
                        borderRadius: '4px 4px 0 0',
                    }}
                >
                    Maintenance & Records
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    style={{
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        border: '1px solid #ccc',
                        borderBottom: activeTab === 'notes' ? '3px solid #0056b3' : '1px solid transparent',
                        backgroundColor: activeTab === 'notes' ? '#eef2f7' : '#fff',
                        borderRadius: '4px 4px 0 0',
                    }}
                >
                    Diagnostic Scratchpad Notes
                </button>
            </div>

            {activeTab === 'history' ? (
                <div>
                    <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0 }}>Active Service Reminders & Maintenance Alarms</h3>
                            <button
                                onClick={() => { if (showReminderForm) clearReminderForm(); else setShowReminderForm(true); }}
                                style={{ padding: '6px 12px', backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
                            >
                                {showReminderForm ? "Close Drawer ✕" : "Configure New Alarm Rule"}
                            </button>
                        </div>

                        {showReminderForm && (
                            <div style={{ backgroundColor: '#fdfefe', border: '1px solid #ccc', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                                <h4>{editingReminderId ? "Modify Reminder Parameter Setup" : "Create New Recurrent Service Interval Rule"}</h4>
                                <form onSubmit={handleSaveReminder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <input type="text" placeholder="Reminder Task Name (e.g., Engine Oil Change, Brake Pads)" value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <input type="text" placeholder="Instructions/Part Brand Preferences (Optional)" value={reminderDesc} onChange={e => setReminderDesc(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Last Completed Odometer (Omit if time-only)</label>
                                        <input type="number" placeholder="e.g. 340000" value={lastServiceOdo} onChange={e => setLastServiceOdo(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Interval Limit (Odometer Value)</label>
                                        <input type="number" placeholder="e.g. 10000" value={intervalOdo} onChange={e => setIntervalOdo(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Last Completed Date (Omit if mileage-only)</label>
                                        <input type="date" value={lastServiceDate} onChange={e => setLastServiceDate(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Interval Limit (Time Months)</label>
                                        <input type="number" placeholder="e.g. 12" value={intervalMonths} onChange={e => setIntervalMonths(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '5px' }}>
                                        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                                            {editingReminderId ? "Apply Modifications" : "Initialize Tracking Rule"}
                                        </button>
                                        <button type="button" onClick={clearReminderForm} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {reminders.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>No automated recurrent notifications or intervals defined for this vehicle.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                {reminders.map(rem => {
                                    const isDue = checkIsDue(rem);
                                    return (
                                        <div
                                            key={rem.id}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '6px',
                                                borderLeft: isDue ? '6px solid #dc3545' : '6px solid #28a745',
                                                backgroundColor: isDue ? '#fdf2f2' : '#f4fbf7',
                                                borderTop: '1px solid #ddd', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd',
                                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <h4 style={{ margin: '0 0 5px 0', color: isDue ? '#b91c1c' : '#15803d' }}>
                                                        {isDue ? "OVERDUE: " : "OK: "} {rem.title}
                                                    </h4>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => handleEditReminderSetup(rem)} style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Edit</button>
                                                        <span style={{ color: '#ccc' }}>|</span>
                                                          <button onClick={() => handleDeleteReminder(rem.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Remove</button>
                                                    </div>
                                                </div>
                                                {rem.description && <p style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#555', fontStyle: 'italic' }}>{rem.description}</p>}

                                                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: '1.2rem' }}>
                                                    {rem.intervalOdometer && (
                                                        <div>Odometer Rule: Every {rem.intervalOdometer.toLocaleString()} km (Last done: {rem.lastServiceAtOdometer?.toLocaleString()} km)</div>
                                                    )}
                                                    {rem.intervalMonths && (
                                                        <div>Timeframe Rule: Every {rem.intervalMonths} months (Last done: {rem.lastServiceAtDate || "N/A"})</div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleResetReminder(rem)}
                                                style={{
                                                    marginTop: '12px', padding: '6px',
                                                    backgroundColor: isDue ? '#dc3545' : '#28a745',
                                                    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                                                }}
                                            >
                                                Mark Done & Reset Cycle
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ backgroundColor: '#eef2f7', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                        <h3>Log a New Service / Repair Event</h3>
                        <form onSubmit={handleAddServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="text" placeholder="Description (e.g. Oil change & filter)" value={description} onChange={e => setDescription(e.target.value)} required />
                            <input type="number" step="0.01" placeholder="Cost (€)" value={cost} onChange={e => setCost(e.target.value)} required />
                            <input type="number" placeholder="Odometer value at service (km)" value={kilometersAtService} onChange={setKilometersAtService ? e => setKilometersAtService(e.target.value) : undefined} required />
                            <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} required />
                            <button type="submit" style={{ padding: '10px', backgroundColor: '#0056b3', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                Save Repair Log Entry
                            </button>
                        </form>
                    </div>

                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ddd' }}>
                        <h3>Upload Vehicle Documents</h3>
                        <input
                            type="file"
                            onChange={(e) => {
                                const formData = new FormData();
                                formData.append("file", e.target.files[0]);
                                fetch(`http://localhost:8080/api/vehicles/${id}/files`, { method: 'POST', body: formData })
                                    .then(res => res.ok ? fetchFiles() : alert("Upload failed"))
                                    .catch(err => console.error(err));
                            }}
                        />
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
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}><button onClick={() => handleModifyServiceLogModal(log)} style={{ backgroundColor: '#fd7e14', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Modify</button></td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}><button onClick={() => handleDeleteServiceLog(log.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div style={{ marginTop: '25px' }}>
                        <h3>Vehicle Documents</h3>
                        {files.length === 0 ? <p style={{ color: '#666', fontStyle: 'italic' }}>No files uploaded yet.</p> : (
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                {files.map(file => (
                                    <li key={file.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                                        <a href={`http://localhost:8080/api/vehicles/${id}/files/${file.id}/download`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#0056b3', fontWeight: 'bold' }}>{file.fileName}</a>
                                        <span style={{ color: '#666', fontSize: '0.85em', marginLeft: '10px' }}>({file.fileType})</span>
                                        <button onClick={() => handleDeleteFile(file.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', marginLeft: 'auto' }}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ backgroundColor: '#fcf8e3', border: '1px solid #fbeed5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                        <h3>{editingNoteId ? "Rewrite Active Diagnostic Entry" : "⚡ Initialize Troubleshooting Scratchpad"}</h3>
                        <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="text" placeholder="Problem Context Name" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            <textarea placeholder="Map testing theories..." value={noteContent} onChange={e => setNoteContent(e.target.value)} required rows="5" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace', resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#d9534f', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>{editingNoteId ? "Apply Modifications" : "Post to Scratchpad"}</button>
                                {editingNoteId && <button type="button" onClick={() => { setNoteTitle(''); setNoteContent(''); setEditingNoteId(null); }} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Cancel Edit</button>}
                            </div>
                        </form>
                    </div>

                    <div>
                        <h3>Active Troubleshooting Scratchpads</h3>
                        {notes.length === 0 ? <p style={{ color: '#666', fontStyle: 'italic' }}>No active diagnostic issues are currently open for this vehicle.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                                {notes.map(note => (
                                    <div key={note.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', backgroundColor: '#fff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>
                                            <h4 style={{ margin: 0, color: '#a94442' }}>{note.title}</h4>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => handleEditNoteSetup(note)} style={{ backgroundColor: '#f0ad4e', color: 'white', border: 'none', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }}>Update</button>
                                                <button onClick={() => handleDeleteNote(note.id)} style={{ backgroundColor: '#bb2124', color: 'white', border: 'none', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }}>Resolve / Delete</button>
                                            </div>
                                        </div>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'sans-serif', color: '#333', lineHeight: '1.4rem' }}>{note.content}</pre>
                                        <small style={{ display: 'block', color: '#999', marginTop: '10px', textAlign: 'right' }}>Log Event Stamp: {new Date(note.createdAt).toLocaleString()}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {modifyModalIsOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#eef2f7', padding: '25px', borderRadius: '8px', width: '100%', maxWidth: '450px', position: 'relative' }}>
                        <button onClick={() => handleModifyServiceLogModal()} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#555' }}>✕</button>
                        <h3>Modify a Service / Repair Event</h3>
                        <form onSubmit={handleModifyServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="text" placeholder="Description" value={modalDescription === '' ? currentActiveLog.description : modalDescription} onChange={e => setModalDescription(e.target.value)} required />
                            <input type="number" step="0.01" placeholder="Cost" value={modalCost === '' ? currentActiveLog.cost : modalCost} onChange={e => setModalCost(e.target.value)} required />
                            <input type="number" placeholder="Odometer" value={modalKilometersAtService === '' ? currentActiveLog.kilometersAtService : modalKilometersAtService} onChange={e => setModalKilometersAtService(e.target.value)} required />
                            <input type="date" value={modalServiceDate === '' ? currentActiveLog.serviceDate : modalServiceDate} onChange={e => setModalServiceDate(e.target.value)} required />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#0056b3', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Save</button>
                                <button type="button" onClick={() => handleModifyServiceLogModal()} style={{ flex: 1, padding: '10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VehicleDashboardView;