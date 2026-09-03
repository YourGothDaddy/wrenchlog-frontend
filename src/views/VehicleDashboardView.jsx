import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import api, { BASE_URL } from '../utils/api'
import { formatDate } from '../utils/dateFormat'
import ElectricalTab from './ElectricalTab'
import DwfViewerModal from '../components/DwfViewerModal'
import useVehicleCatalog from '../hooks/useVehicleCatalog'

function VehicleDashboardView({ vehicles, fetchGarage  }) {
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
    const [folders, setFolders] = useState([])
    const [currentFolderId, setCurrentFolderId] = useState(null)
    const [newFolderName, setNewFolderName] = useState('')

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

    const [showDetailsForm, setShowDetailsForm] = useState(false)
    const [detailsForm, setDetailsForm] = useState({
        vin: '', plateNumber: '', engineCode: '', transmissionType: '', driveType: '',
        color: '', fuelType: '', fuelTankCapacityLiters: '', engineOilCapacityLiters: '',
        engineOilType: '', tireSize: '', purchaseDate: '', purchasePrice: '',
        insuranceExpiryDate: '', vignetteExpiryDate: '', inspectionDueDate: ''
    })

    const [vignetteCheck, setVignetteCheck] = useState(null)

    const [inspectionCheck, setInspectionCheck] = useState(null)
    const [inspectionCaptchaSession, setInspectionCaptchaSession] = useState(null)
    const [inspectionCaptchaCode, setInspectionCaptchaCode] = useState('')
    const [showInspectionCaptcha, setShowInspectionCaptcha] = useState(false)
    const [inspectionCheckLoading, setInspectionCheckLoading] = useState(false)

    const [insuranceCheck, setInsuranceCheck] = useState(null)
    const [insuranceCheckLoading, setInsuranceCheckLoading] = useState(false)

    const [editingOdometer, setEditingOdometer] = useState(false)
    const [odometerValue, setOdometerValue] = useState('')

    const [errorMessage, setErrorMessage] = useState('')

    const [viewingDwfFile, setViewingDwfFile] = useState(null)

    const [showIdentityForm, setShowIdentityForm] = useState(false)

    const {
        makes, models, generations, modifications,
        selectedMake, setSelectedMake,
        selectedModel, setSelectedModel,
        selectedGeneration, setSelectedGeneration,
        selectedModification, setSelectedModification,
        year: identityYear, setYear: setIdentityYear,
        isProductionYearRangeValid,
        resetSelections
    } = useVehicleCatalog(setErrorMessage)

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

    const fetchFiles = (folderId = currentFolderId) => {
        const query = folderId != null ? `?folderId=${folderId}` : ''
        api.get(`/api/vehicles/${id}/files${query}`)
            .then(data => setFiles(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to load files.')
            })
    }

    const fetchFolders = () => {
        api.get(`/api/vehicles/${id}/folders`)
            .then(data => setFolders(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to load folders.')
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

    const fetchVignetteCheck = () => {
        if (!vehicle) return
        api.get(`/api/vehicles/${id}/vignette-check`)
            .then(data => setVignetteCheck(data))
            .catch(err => console.error(err))
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
        if (!window.confirm('Delete this file? This cannot be undone.')) return
        setErrorMessage('')
        api.delete(`/api/vehicles/${id}/files/${fileId}`)
            .then(() => { fetchFiles(); fetchFolders() })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete file.')
            })
    }

    const handleMoveFile = (fileId, targetFolderId) => {
        setErrorMessage('')
        api.patch(`/api/vehicles/${id}/files/${fileId}/folder`, { folderId: targetFolderId })
            .then(() => { fetchFiles(); fetchFolders() })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to move file.')
            })
    }

    const handleCreateFolder = (e) => {
        e.preventDefault()
        if (!newFolderName.trim()) return
        setErrorMessage('')
        api.post(`/api/vehicles/${id}/folders`, { name: newFolderName.trim() })
            .then(() => { setNewFolderName(''); fetchFolders() })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to create folder.')
            })
    }

    const handleRenameFolder = (folder) => {
        const newName = window.prompt('Rename folder:', folder.name)
        if (!newName || !newName.trim() || newName.trim() === folder.name) return

        setErrorMessage('')
        api.put(`/api/vehicles/${id}/folders/${folder.id}`, { name: newName.trim() })
            .then(() => fetchFolders())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to rename folder.')
            })
    }

    const handleDeleteFolder = (folderId) => {
        if (!window.confirm("Delete this folder? Files inside will move back to the root, nothing is deleted.")) {
            return;
        }

        setErrorMessage('')
        api.delete(`/api/vehicles/${id}/folders/${folderId}`)
            .then(() => {
                fetchFolders()
                if (currentFolderId === folderId) setCurrentFolderId(null)
                else fetchFiles()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete folder.')
            })
    }

    const handleOpenFolder = (folderId) => {
        setCurrentFolderId(folderId)
    }

    const handleBackToRoot = () => {
        setCurrentFolderId(null)
    }

    useEffect(() => {
        fetchServiceLogs()
        fetchFiles()
        fetchFolders()
        fetchNotes()
        fetchReminders()
        fetchVignetteCheck()
    }, [id, vehicle])

    useEffect(() => {
        if (vehicle) fetchFiles(currentFolderId)
    }, [currentFolderId])

    const handleAddServiceLog = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const newLog = { description, cost: parseFloat(cost), kilometersAtService: parseInt(kilometersAtService), serviceDate }
        api.post(`/api/services?vehicleId=${id}`, newLog)
            .then(() => {
                setDescription(''); setCost(''); setKilometersAtService(''); setServiceDate('');
                fetchServiceLogs()
                fetchGarage()
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
        request.then(() => { clearReminderForm(); fetchReminders(); fetchVignetteCheck(); })
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
            .then(() => { fetchReminders(); fetchVignetteCheck(); })
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
            .then(() => { fetchReminders(); fetchVignetteCheck(); })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to delete reminder.')
            })
    }

    const handleAdoptBgTollVignette = () => {
        setErrorMessage('')
        const lastServiceAtDate = new Date(vignetteCheck.bgTollExpiryDate)
        lastServiceAtDate.setFullYear(lastServiceAtDate.getFullYear() - 1)
        const payload = {
            title: 'Vignette renewal',
            description: null,
            lastServiceAtOdometer: null,
            intervalOdometer: null,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0],
            sourceType: 'VIGNETTE'
        }
        api.post(`/api/reminders?vehicleId=${id}`, payload)
            .then(() => { fetchReminders(); fetchVignetteCheck(); })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to save vignette reminder.')
            })
    }

    const handleStartInspectionCheck = () => {
        setErrorMessage('')
        setInspectionCheckLoading(true)
        api.post(`/api/vehicles/${id}/inspection-check/start`)
            .then(data => {
                setInspectionCaptchaSession(data)
                setShowInspectionCaptcha(true)
                setInspectionCaptchaCode('')
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to start inspection check.')
            })
            .finally(() => setInspectionCheckLoading(false))
    }

    const handleSubmitInspectionCaptcha = (e) => {
        e.preventDefault()
        if (!inspectionCaptchaCode.trim()) return
        setErrorMessage('')
        setInspectionCheckLoading(true)
        api.post(`/api/vehicles/${id}/inspection-check/submit`, {
            sessionToken: inspectionCaptchaSession.sessionToken,
            captchaCode: inspectionCaptchaCode.trim()
        })
            .then(data => {
                if (data.captchaInvalid) {
                    setErrorMessage('Could not read the captcha. Fetching a new one.')
                    handleStartInspectionCheck()
                    return
                }
                setInspectionCheck(data)
                setShowInspectionCaptcha(false)
                setInspectionCaptchaSession(null)
                setInspectionCaptchaCode('')
                fetchReminders()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to submit inspection check.')
            })
            .finally(() => setInspectionCheckLoading(false))
    }

    const handleCancelInspectionCaptcha = () => {
        setShowInspectionCaptcha(false)
        setInspectionCaptchaSession(null)
        setInspectionCaptchaCode('')
    }

    const handleAdoptRtaInspection = () => {
        setErrorMessage('')
        const lastServiceAtDate = new Date(inspectionCheck.rtaExpiryDate)
        lastServiceAtDate.setFullYear(lastServiceAtDate.getFullYear() - 1)
        const payload = {
            title: 'Inspection due',
            description: null,
            lastServiceAtOdometer: null,
            intervalOdometer: null,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0],
            sourceType: 'INSPECTION',
            verifiedExpiryDate: inspectionCheck.rtaExpiryDate
        }
        api.post(`/api/reminders?vehicleId=${id}`, payload)
            .then(() => { fetchReminders(); setInspectionCheck(null) })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to save inspection reminder.')
            })
    }

    const handleSetInspectionDateToMatchRta = (rem) => {
        if (!inspectionCheck?.rtaExpiryDate) return
        setErrorMessage('')
        const lastServiceAtDate = new Date(inspectionCheck.rtaExpiryDate)
        lastServiceAtDate.setFullYear(lastServiceAtDate.getFullYear() - 1)
        const payload = {
            title: rem.title,
            description: rem.description,
            lastServiceAtOdometer: rem.lastServiceAtOdometer,
            intervalOdometer: rem.intervalOdometer,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0],
            verifiedExpiryDate: inspectionCheck.rtaExpiryDate
        }
        api.put(`/api/reminders/${rem.id}?vehicleId=${id}`, payload)
            .then(() => {
                fetchReminders()
                setInspectionCheck(prev => ({
                    ...prev,
                    match: true,
                    enteredExpiryDate: prev.rtaExpiryDate,
                    message: 'Confirmed by RTA'
                }))
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to update reminder date.')
            })
    }

    const handleCheckInsurance = () => {
        setErrorMessage('')
        setInsuranceCheckLoading(true)
        api.post(`/api/vehicles/${id}/insurance-check`)
            .then(data => {
                setInsuranceCheck(data)
                fetchReminders()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to check insurance status.')
            })
            .finally(() => setInsuranceCheckLoading(false))
    }

    const handleAdoptInsurance = () => {
        setErrorMessage('')
        const lastServiceAtDate = new Date(insuranceCheck.insurerExpiryDate)
        lastServiceAtDate.setFullYear(lastServiceAtDate.getFullYear() - 1)
        const payload = {
            title: 'Insurance renewal',
            description: insuranceCheck.insurerName || null,
            lastServiceAtOdometer: null,
            intervalOdometer: null,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0],
            sourceType: 'INSURANCE',
            verifiedExpiryDate: insuranceCheck.insurerExpiryDate
        }
        api.post(`/api/reminders?vehicleId=${id}`, payload)
            .then(() => { fetchReminders(); setInsuranceCheck(null) })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to save insurance reminder.')
            })
    }

    const handleSetInsuranceDateToMatch = (rem) => {
        if (!insuranceCheck?.insurerExpiryDate) return
        setErrorMessage('')
        const lastServiceAtDate = new Date(insuranceCheck.insurerExpiryDate)
        lastServiceAtDate.setFullYear(lastServiceAtDate.getFullYear() - 1)
        const payload = {
            title: rem.title,
            description: rem.description,
            lastServiceAtOdometer: rem.lastServiceAtOdometer,
            intervalOdometer: rem.intervalOdometer,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0],
            verifiedExpiryDate: insuranceCheck.insurerExpiryDate
        }
        api.put(`/api/reminders/${rem.id}?vehicleId=${id}`, payload)
            .then(() => {
                fetchReminders()
                setInsuranceCheck(prev => ({
                    ...prev,
                    match: true,
                    enteredExpiryDate: prev.insurerExpiryDate,
                    message: 'Confirmed by Guarantee Fund'
                }))
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to update reminder date.')
            })
    }

    const openDetailsForm = () => {
        setDetailsForm({
            vin: vehicle.vin || '', plateNumber: vehicle.plateNumber || '', engineCode: vehicle.engineCode || '',
            transmissionType: vehicle.transmissionType || '', driveType: vehicle.driveType || '',
            color: vehicle.color || '', fuelType: vehicle.fuelType || '',
            fuelTankCapacityLiters: vehicle.fuelTankCapacityLiters || '',
            engineOilCapacityLiters: vehicle.engineOilCapacityLiters || '',
            engineOilType: vehicle.engineOilType || '', tireSize: vehicle.tireSize || '',
            purchaseDate: vehicle.purchaseDate || '', purchasePrice: vehicle.purchasePrice || '',
            insuranceExpiryDate: '', vignetteExpiryDate: '', inspectionDueDate: ''
        })
        setShowDetailsForm(true)
    }

    const handleSaveDetails = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const payload = {
            ...detailsForm,
            fuelTankCapacityLiters: detailsForm.fuelTankCapacityLiters ? parseFloat(detailsForm.fuelTankCapacityLiters) : null,
            engineOilCapacityLiters: detailsForm.engineOilCapacityLiters ? parseFloat(detailsForm.engineOilCapacityLiters) : null,
            purchasePrice: detailsForm.purchasePrice ? parseFloat(detailsForm.purchasePrice) : null,
            transmissionType: detailsForm.transmissionType || null,
            driveType: detailsForm.driveType || null,
            fuelType: detailsForm.fuelType || null,
            purchaseDate: detailsForm.purchaseDate || null,
            insuranceExpiryDate: detailsForm.insuranceExpiryDate || null,
            vignetteExpiryDate: detailsForm.vignetteExpiryDate || null,
            inspectionDueDate: detailsForm.inspectionDueDate || null
        }
        api.put(`/api/vehicles/${id}/details`, payload)
            .then(() => {
                setShowDetailsForm(false)
                fetchGarage()
                fetchReminders()
                fetchVignetteCheck()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to save vehicle details.')
            })
    }

    const handleUpdateOdometer = (e) => {
        e.preventDefault()
        setErrorMessage('')
        api.put(`/api/vehicles/${id}/odometer`, { kilometers: parseInt(odometerValue) })
            .then(() => {
                setEditingOdometer(false)
                fetchGarage()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to update odometer.')
            })
    }

    const openIdentityForm = () => {
        resetSelections()
        setShowIdentityForm(true)
    }

    const handleSaveIdentity = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const payload = {
            make: selectedMake,
            model: `${selectedModel} ${selectedGeneration} (${selectedModification.modification})`,
            year: identityYear && identityYear !== "" ? parseInt(identityYear) : null
        }
        api.put(`/api/vehicles/${id}/identity`, payload)
            .then(() => {
                setShowIdentityForm(false)
                resetSelections()
                fetchGarage()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || 'Failed to update vehicle identity.')
            })
    }

    const renderIdentityYearOptions = () => {
        if (!selectedModification) return <option value="">Choose Modification First</option>

        if (!isProductionYearRangeValid()) {
            return <option value="">No Production Years Available</option>
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

    const isDwfFile = (fileName) => /\.(dwf|dwfx)$/i.test(fileName)

    if (loading) return <div style={{ padding: '10px', fontFamily: 'monospace' }}>Loading workspace...</div>
    if (!vehicle) return <div style={{ padding: '10px', fontFamily: 'monospace' }}><p>Vehicle not found.</p><button onClick={() => navigate('/')}>Back</button></div>

    const baseInputStyle = { padding: '4px', border: '1px solid #777', background: '#fff', fontSize: '12px', fontFamily: 'monospace', width: '100%' };
    const baseButtonStyle = { padding: '4px 12px', background: '#e1e1e1', border: '1px solid #777', cursor: 'pointer', fontSize: '12px', color: '#000', fontWeight: 'bold', fontFamily: 'monospace' };
    const tdStyle = { padding: '5px', border: '1px solid #aaa', fontSize: '12px', textAlign: 'left' };
    const thStyle = { padding: '5px', border: '1px solid #aaa', fontSize: '12px', textAlign: 'left', background: '#eaeaea', color: '#000' };

    return (
        <div style={{ padding: '10px', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff' }}>

            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => navigate('/')} style={baseButtonStyle}>Back to Garage</button>
            </div>

            {errorMessage && (
                <div style={{ border: '1px solid #a00', color: '#a00', padding: '8px', marginBottom: '15px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff' }}>
                    ERROR: {errorMessage}
                </div>
            )}

            <table className="vehicle-info-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '2px solid #000' }}>
                <tbody>
                <tr>
                    <td style={{ ...tdStyle, background: '#f0f0f0', fontWeight: 'bold', width: '15%' }}>VEHICLE:</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        <button
                            onClick={() => showIdentityForm ? setShowIdentityForm(false) : openIdentityForm()}
                            style={{ ...baseButtonStyle, marginLeft: '8px', padding: '1px 4px' }}
                        >
                            {showIdentityForm ? 'Cancel' : 'Edit'}
                        </button>
                    </td>
                    <td style={{ ...tdStyle, background: '#f0f0f0', fontWeight: 'bold', width: '20%' }}>CURRENT ODOMETER:</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', width: '20%' }}>
                        {vehicle.kilometers.toLocaleString()} km
                        <button
                            onClick={() => { setOdometerValue(vehicle.kilometers); setEditingOdometer(true) }}
                            style={{ ...baseButtonStyle, marginLeft: '8px', padding: '1px 4px' }}
                        >
                            Edit
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>

            {showIdentityForm && (
                <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>Edit Vehicle Identity</div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                        Re-select the full make/model/generation/modification/year. This replaces the vehicle's current identity.
                    </div>
                    <form onSubmit={handleSaveIdentity} className="responsive-grid">
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Make</div>
                            <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)} required style={baseInputStyle}>
                                <option value="">Select Make</option>
                                {makes.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Model</div>
                            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedMake} required style={baseInputStyle}>
                                <option value="">Select Model</option>
                                {models.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Generation</div>
                            <select value={selectedGeneration}
                                    onChange={e => setSelectedGeneration(e.target.value)}
                                    disabled={!selectedModel && generations.length <= 1}
                                    required style={baseInputStyle}>
                                {generations.length <= 1 ? (
                                    <option value={selectedGeneration}>No Generation Data</option>
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
                                style={baseInputStyle}
                            >
                                <option value="">Select Modification</option>
                                {modifications.map(m => (
                                    <option key={m.id} value={JSON.stringify(m)}>{m.modification}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Year of Manufacture</div>
                            {isProductionYearRangeValid() ? (
                                <select value={identityYear} onChange={e => setIdentityYear(e.target.value)} disabled={!selectedModification} required style={baseInputStyle}>
                                    {renderIdentityYearOptions()}
                                </select>
                            ) : (
                                <select value="" style={baseInputStyle}>
                                    {renderIdentityYearOptions()}
                                </select>
                            )}
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                            <button type="submit" style={{ ...baseButtonStyle, width: '100%', padding: '6px' }}>Save Vehicle Identity</button>
                        </div>
                    </form>
                </div>
            )}

            {editingOdometer && (
                <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>Edit Odometer</div>
                    <form onSubmit={handleUpdateOdometer} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={odometerValue}
                            onChange={e => setOdometerValue(e.target.value)}
                            required
                            style={{ ...baseInputStyle, width: '140px' }}
                        />
                        <button type="submit" style={{ ...baseButtonStyle, whiteSpace: 'nowrap' }}>Save</button>
                        <button type="button" onClick={() => setEditingOdometer(false)} style={{ ...baseButtonStyle, whiteSpace: 'nowrap' }}>Cancel</button>
                    </form>
                </div>
            )}

            <div className="tab-row" style={{ display: 'flex', borderBottom: '2px solid #000', marginBottom: '15px' }}>
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
                    Notes
                </button>
                <button
                    onClick={() => setActiveTab('electrical')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                        border: '1px solid #000', borderBottom: activeTab === 'electrical' ? '2px solid #fff' : '1px solid #000',
                        backgroundColor: activeTab === 'electrical' ? '#fff' : '#e1e1e1', marginBottom: '-2px', marginRight: '4px'
                    }}
                >
                    Electrical
                </button>
                <button
                    onClick={() => setActiveTab('compliance')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                        border: '1px solid #000', borderBottom: activeTab === 'compliance' ? '2px solid #fff' : '1px solid #000',
                        backgroundColor: activeTab === 'compliance' ? '#fff' : '#e1e1e1', marginBottom: '-2px'
                    }}
                >
                    Compliance
                </button>
            </div>

            {activeTab === 'history' ? (
                <div>
                    <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Maintenance Reminders</span>
                            <button onClick={() => setShowReminderForm(!showReminderForm)} style={baseButtonStyle}>
                                {showReminderForm ? "Hide Form" : "Add Reminder"}
                            </button>
                        </div>

                        {showReminderForm && (
                            <form onSubmit={handleSaveReminder} style={{ border: '1px dashed #000', padding: '8px', marginBottom: '10px', backgroundColor: '#fff' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>New Reminder</div>
                                <div className="responsive-grid" style={{ marginBottom: '8px' }}>
                                    <input type="text" placeholder="Reminder Title" value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} required style={baseInputStyle} />
                                    <input type="text" placeholder="Notes (optional)" value={reminderDesc} onChange={e => setReminderDesc(e.target.value)} style={baseInputStyle} />
                                    <input type="number" placeholder="Last Done At (km)" value={lastServiceOdo} onChange={e => setLastServiceOdo(e.target.value)} style={baseInputStyle} />
                                    <input type="number" placeholder="Repeat Every (km)" value={intervalOdo} onChange={e => setIntervalOdo(e.target.value)} style={baseInputStyle} />
                                    <input type="date" value={lastServiceDate} onChange={e => setLastServiceDate(e.target.value)} style={baseInputStyle} />
                                    <input type="number" placeholder="Repeat Every (Months)" value={intervalMonths} onChange={e => setIntervalMonths(e.target.value)} style={baseInputStyle} />
                                </div>
                                <div className="action-buttons">
                                    <button type="submit" style={baseButtonStyle}>Save Ruleset</button>
                                    <button type="button" onClick={clearReminderForm} style={baseButtonStyle}>Cancel</button>
                                </div>
                            </form>
                        )}

                        {reminders.length === 0 ? (
                            <div style={{ color: '#555', fontSize: '11px' }}>No reminders set yet.</div>
                        ) : (
                            <div className="table-scroll-wrapper">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                    <tr>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Reminder</th>
                                        <th style={thStyle}>Schedule</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {reminders.map(rem => {
                                        const isDue = checkIsDue(rem);
                                        return (
                                            <tr key={rem.id} style={{ backgroundColor: isDue ? '#ffebeb' : '#f7fff7' }}>
                                                <td style={{ ...tdStyle, color: isDue ? '#cc0000' : '#006600', fontWeight: 'bold' }}>
                                                    {isDue ? "DUE NOW" : "OK"}
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ fontWeight: 'bold' }}>{rem.title}</span>
                                                    {rem.description && <div style={{ fontSize: '11px', color: '#555' }}>Note: {rem.description}</div>}
                                                    {rem.sourceType === 'VIGNETTE' && vignetteCheck?.hasLocalReminder && (
                                                        vignetteCheck.bgTollFound ? (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: vignetteCheck.match ? '#006600' : '#cc0000' }}>
                                                                {vignetteCheck.match
                                                                    ? '✓ Confirmed by BGTOLL'
                                                                    : `✗ BGTOLL mismatch (BGTOLL: ${formatDate(vignetteCheck.bgTollExpiryDate)})`}
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', color: '#997a00' }}>
                                                                ? {vignetteCheck.message}
                                                            </div>
                                                        )
                                                    )}
                                                    {rem.sourceType === 'INSPECTION' && (
                                                        inspectionCheck?.hasLocalReminder && inspectionCheck.rtaFound && !inspectionCheck.match ? (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: '#cc0000' }}>
                                                                ✗ RTA mismatch (RTA: {formatDate(inspectionCheck.rtaExpiryDate)})
                                                            </div>
                                                        ) : rem.verifiedExpiryDate && new Date(rem.verifiedExpiryDate) >= new Date(new Date().toDateString()) ? (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: '#006600' }}>
                                                                ✓ Confirmed by RTA until {formatDate(rem.verifiedExpiryDate)}
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', color: '#997a00' }}>
                                                                ? Not verified yet — check under Compliance tab
                                                            </div>
                                                        )
                                                    )}
                                                    {rem.sourceType === 'INSURANCE' && (
                                                        insuranceCheck?.hasLocalReminder && insuranceCheck.insurerFound && !insuranceCheck.match ? (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: '#cc0000' }}>
                                                                ✗ Guarantee Fund mismatch (Guarantee Fund: {formatDate(insuranceCheck.insurerExpiryDate)})
                                                            </div>
                                                        ) : rem.verifiedExpiryDate && new Date(rem.verifiedExpiryDate) >= new Date(new Date().toDateString()) ? (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: '#006600' }}>
                                                                ✓ Confirmed by Guarantee Fund until {formatDate(rem.verifiedExpiryDate)}
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '10px', marginTop: '2px', color: '#997a00' }}>
                                                                ? Not verified yet — check under Compliance tab
                                                            </div>
                                                        )
                                                    )}
                                                </td>
                                                <td style={tdStyle}>
                                                    {['VIGNETTE', 'INSPECTION', 'INSURANCE'].includes(rem.sourceType) && rem.lastServiceAtDate && rem.intervalMonths ? (
                                                        <div style={{ fontWeight: 'bold' }}>
                                                            Valid until: {formatDate(
                                                            new Date(new Date(rem.lastServiceAtDate).setMonth(new Date(rem.lastServiceAtDate).getMonth() + rem.intervalMonths)).toISOString().split('T')[0]
                                                        )}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {rem.intervalOdometer && <div>Odo: Every {rem.intervalOdometer.toLocaleString()} km (Last: {rem.lastServiceAtOdometer?.toLocaleString()} km)</div>}
                                                            {rem.intervalMonths && <div>Time: Every {rem.intervalMonths} Mos (Last: {rem.lastServiceAtDate || "None"})</div>}
                                                        </>
                                                    )}
                                                </td>
                                                <td style={tdStyle}>
                                                    <div className="action-buttons">
                                                        {rem.sourceType === 'INSPECTION' ? (
                                                            inspectionCheck?.hasLocalReminder && inspectionCheck.rtaFound && !inspectionCheck.match && (
                                                                <button onClick={() => handleSetInspectionDateToMatchRta(rem)} style={{ ...baseButtonStyle, background: '#ffe4b3', padding: '2px 4px' }}>
                                                                    Set date to match RTA
                                                                </button>
                                                            )
                                                        ) : rem.sourceType === 'INSURANCE' ? (
                                                            insuranceCheck?.hasLocalReminder && insuranceCheck.insurerFound && !insuranceCheck.match && (
                                                                <button onClick={() => handleSetInsuranceDateToMatch(rem)} style={{ ...baseButtonStyle, background: '#ffe4b3', padding: '2px 4px' }}>
                                                                    Set date to match Insurer
                                                                </button>
                                                            )
                                                        ) : (
                                                            <button onClick={() => handleResetReminder(rem)} style={{ ...baseButtonStyle, background: isDue ? '#ffcccc' : '#ccffcc', padding: '2px 4px' }}>Mark Done</button>
                                                        )}
                                                        <button onClick={() => handleEditReminderSetup(rem)} style={{ ...baseButtonStyle, padding: '2px 4px' }}>Edit</button>
                                                        <button onClick={() => handleDeleteReminder(rem.id)} style={{ ...baseButtonStyle, padding: '2px 4px', color: '#a00' }}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px' }}>VEHICLE SPECIFICATIONS</span>
                            <button onClick={showDetailsForm ? () => setShowDetailsForm(false) : openDetailsForm} style={baseButtonStyle}>
                                {showDetailsForm ? "Cancel" : "Edit Details"}
                            </button>
                        </div>

                        {!showDetailsForm ? (
                            <div className="responsive-grid" style={{ fontSize: '12px' }}>
                                <div>VIN: {vehicle.vin || '—'}</div>
                                <div>Plate: {vehicle.plateNumber || '—'}</div>
                                <div>Engine: {vehicle.engineCode || '—'}</div>
                                <div>Transmission: {vehicle.transmissionType || '—'}</div>
                                <div>Drive: {vehicle.driveType || '—'}</div>
                                <div>Color: {vehicle.color || '—'}</div>
                                <div>Fuel: {vehicle.fuelType || '—'}</div>
                                <div>Tank: {vehicle.fuelTankCapacityLiters ? `${vehicle.fuelTankCapacityLiters} L` : '—'}</div>
                                <div>Oil: {vehicle.engineOilCapacityLiters ? `${vehicle.engineOilCapacityLiters} L ${vehicle.engineOilType || ''}` : '—'}</div>
                                <div>Tires: {vehicle.tireSize || '—'}</div>
                                <div>Purchased: {vehicle.purchaseDate ? formatDate(vehicle.purchaseDate) : '—'}</div>
                                <div>Price: {vehicle.purchasePrice ? `€${vehicle.purchasePrice}` : '—'}</div>
                            </div>
                        ) : (
                            <form onSubmit={handleSaveDetails} className="responsive-grid">
                                <input placeholder="VIN" value={detailsForm.vin} onChange={e => setDetailsForm({...detailsForm, vin: e.target.value})} style={baseInputStyle} />
                                <input placeholder="Plate Number" value={detailsForm.plateNumber} onChange={e => setDetailsForm({...detailsForm, plateNumber: e.target.value})} style={baseInputStyle} />
                                <input placeholder="Engine Code" value={detailsForm.engineCode} onChange={e => setDetailsForm({...detailsForm, engineCode: e.target.value})} style={baseInputStyle} />

                                <select value={detailsForm.transmissionType} onChange={e => setDetailsForm({...detailsForm, transmissionType: e.target.value})} style={baseInputStyle}>
                                    <option value="">Transmission</option>
                                    <option value="MANUAL">Manual</option>
                                    <option value="AUTOMATIC">Automatic</option>
                                    <option value="CVT">CVT</option>
                                    <option value="DCT">DCT</option>
                                    <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
                                </select>

                                <select value={detailsForm.driveType} onChange={e => setDetailsForm({...detailsForm, driveType: e.target.value})} style={baseInputStyle}>
                                    <option value="">Drive Type</option>
                                    <option value="FWD">FWD</option>
                                    <option value="RWD">RWD</option>
                                    <option value="AWD">AWD</option>
                                    <option value="FOUR_WD">4WD</option>
                                </select>

                                <select value={detailsForm.fuelType} onChange={e => setDetailsForm({...detailsForm, fuelType: e.target.value})} style={baseInputStyle}>
                                    <option value="">Fuel Type</option>
                                    <option value="PETROL">Petrol</option>
                                    <option value="DIESEL">Diesel</option>
                                    <option value="ELECTRIC">Electric</option>
                                    <option value="HYBRID">Hybrid</option>
                                    <option value="LPG">LPG</option>
                                    <option value="CNG">CNG</option>
                                </select>

                                <input placeholder="Color" value={detailsForm.color} onChange={e => setDetailsForm({...detailsForm, color: e.target.value})} style={baseInputStyle} />
                                <input type="number" step="0.1" placeholder="Fuel Tank (L)" value={detailsForm.fuelTankCapacityLiters} onChange={e => setDetailsForm({...detailsForm, fuelTankCapacityLiters: e.target.value})} style={baseInputStyle} />
                                <input type="number" step="0.01" placeholder="Oil Capacity (L)" value={detailsForm.engineOilCapacityLiters} onChange={e => setDetailsForm({...detailsForm, engineOilCapacityLiters: e.target.value})} style={baseInputStyle} />
                                <input placeholder="Oil Type (e.g. 5W-30)" value={detailsForm.engineOilType} onChange={e => setDetailsForm({...detailsForm, engineOilType: e.target.value})} style={baseInputStyle} />
                                <input placeholder="Tire Size" value={detailsForm.tireSize} onChange={e => setDetailsForm({...detailsForm, tireSize: e.target.value})} style={baseInputStyle} />

                                <div>
                                    <div style={{ fontSize: '10px' }}>Purchase Date</div>
                                    <input type="date" value={detailsForm.purchaseDate} onChange={e => setDetailsForm({...detailsForm, purchaseDate: e.target.value})} style={baseInputStyle} />
                                </div>
                                <input type="number" step="0.01" placeholder="Purchase Price (€)" value={detailsForm.purchasePrice} onChange={e => setDetailsForm({...detailsForm, purchasePrice: e.target.value})} style={baseInputStyle} />

                                <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #000', marginTop: '4px', paddingTop: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                                    Set dates below to auto-create reminders
                                </div>

                                <div>
                                    <div style={{ fontSize: '10px' }}>Insurance Expiry</div>
                                    <input type="date" value={detailsForm.insuranceExpiryDate} onChange={e => setDetailsForm({...detailsForm, insuranceExpiryDate: e.target.value})} style={baseInputStyle} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px' }}>Vignette Expiry</div>
                                    <input type="date" value={detailsForm.vignetteExpiryDate} onChange={e => setDetailsForm({...detailsForm, vignetteExpiryDate: e.target.value})} style={baseInputStyle} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px' }}>Inspection Due</div>
                                    <input type="date" value={detailsForm.inspectionDueDate} onChange={e => setDetailsForm({...detailsForm, inspectionDueDate: e.target.value})} style={baseInputStyle} />
                                </div>

                                <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                                    <button type="submit" style={{ ...baseButtonStyle, width: '100%', padding: '6px' }}>Save Specifications</button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="responsive-grid" style={{ marginBottom: '15px' }}>
                        <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>Add Service Log</div>
                            <form onSubmit={handleAddServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required style={baseInputStyle} />
                                <input type="number" step="0.01" placeholder="Cost (€)" value={cost} onChange={e => setCost(e.target.value)} required style={baseInputStyle} />
                                <input type="number" placeholder="Odometer (km)" value={kilometersAtService} onChange={e => setKilometersAtService(e.target.value)} required style={baseInputStyle} />
                                <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} required style={baseInputStyle} />
                                <button type="submit" style={baseButtonStyle}>Add Entry</button>
                            </form>
                        </div>

                        <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>Attach a File</div>
                            <input
                                type="file"
                                style={{ fontSize: '11px', width: '100%', marginBottom: '8px', boxSizing: 'border-box' }}
                                onChange={(e) => {
                                    setErrorMessage('')
                                    const formData = new FormData()
                                    formData.append("file", e.target.files[0])
                                    if (currentFolderId != null) formData.append("folderId", currentFolderId)
                                    api.post(`/api/vehicles/${id}/files`, formData)
                                        .then(() => { fetchFiles(); fetchFolders() })
                                        .catch(err => {
                                            console.error(err)
                                            setErrorMessage(err.message || 'Failed to upload file.')
                                        })
                                }}
                            />
                            <div style={{ fontSize: '10px', color: '#666' }}>
                                {currentFolderId != null
                                    ? `Uploading into: ${folders.find(f => f.id === currentFolderId)?.name || 'folder'}`
                                    : 'Upload receipts, manuals, or other documents.'}
                            </div>
                        </div>
                    </div>

                    {modifyModalIsOpen && currentActiveLog && (
                        <div style={{ border: '2px solid #fd7e14', padding: '10px', marginBottom: '15px', backgroundColor: '#fffbe6' }}>
                            <div style={{ fontWeight: 'bold', color: '#fd7e14', marginBottom: '8px' }}>Edit Service Log {currentActiveLog.id}</div>
                            <form onSubmit={handleModifyServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input type="text" value={modalDescription} onChange={e => setModalDescription(e.target.value)} required style={baseInputStyle} />
                                <input type="number" step="0.01" value={modalCost} onChange={e => setModalCost(e.target.value)} required style={baseInputStyle} />
                                <input type="number" value={modalKilometersAtService} onChange={e => setModalKilometersAtService(e.target.value)} required style={baseInputStyle} />
                                <input type="date" value={modalServiceDate} onChange={e => setModalServiceDate(e.target.value)} required style={baseInputStyle} />
                                <div className="action-buttons">
                                    <button type="submit" style={{ ...baseButtonStyle, background: '#fd7e14', color: '#fff' }}>Save Changes</button>
                                    <button type="button" onClick={() => setModifyModal(false)} style={baseButtonStyle}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Service History</div>
                        {serviceLogs.length === 0 ? (
                            <div style={{ border: '1px solid #aaa', padding: '8px', color: '#666' }}>No service history yet.</div>
                        ) : (
                            <div className="table-scroll-wrapper">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                    <tr>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Description</th>
                                        <th style={thStyle}>Odometer</th>
                                        <th style={thStyle}>Cost</th>
                                        <th style={thStyle}>Actions</th>
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
                                                <div className="action-buttons">
                                                    <button onClick={() => handleModifyServiceLogModal(log)} style={{ ...baseButtonStyle, padding: '1px 4px' }}>Edit</button>
                                                    <button onClick={() => handleDeleteServiceLog(log.id)} style={{ ...baseButtonStyle, padding: '1px 4px', color: '#a00' }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold' }}>
                                {currentFolderId != null
                                    ? `DOCUMENT ARCHIVE — ${folders.find(f => f.id === currentFolderId)?.name || ''}`
                                    : 'DOCUMENT ARCHIVE'}
                            </span>
                            {currentFolderId != null && (
                                <button onClick={handleBackToRoot} style={{ ...baseButtonStyle, padding: '2px 8px' }}>
                                    ◄ Back to Documents
                                </button>
                            )}
                        </div>

                        {currentFolderId === null && (
                            <>
                                <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="New folder name"
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        style={{ ...baseInputStyle, flex: 1 }}
                                    />
                                    <button type="submit" style={baseButtonStyle}>New Folder</button>
                                </form>

                                {folders.length > 0 && (
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                                            gap: '10px',
                                            marginBottom: '15px'
                                        }}
                                    >
                                        {folders.map(folder => (
                                            <div
                                                key={folder.id}
                                                onClick={() => handleOpenFolder(folder.id)}
                                                style={{
                                                    border: '1px solid #999',
                                                    background: '#e8e8e8',
                                                    padding: '8px 4px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    userSelect: 'none'
                                                }}
                                                title={`${folder.fileCount} item(s)`}
                                            >
                                                <div style={{ fontSize: '24px', lineHeight: 1 }}>📁</div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    marginTop: '4px',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {folder.name}
                                                </div>
                                                <div style={{ fontSize: '9px', color: '#666' }}>{folder.fileCount} item(s)</div>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRenameFolder(folder) }}
                                                        style={{ ...baseButtonStyle, padding: '0px 3px', fontSize: '9px' }}
                                                    >
                                                        Rename
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id) }}
                                                        style={{ ...baseButtonStyle, padding: '0px 3px', fontSize: '9px', color: '#a00' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {files.length === 0 ? <div style={{ fontSize: '11px', color: '#666' }}>No files here yet.</div> : (
                            <div className="table-scroll-wrapper">
                                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                                    <tbody>
                                    {files.map(file => (
                                        <tr key={file.id}>
                                            <td style={tdStyle}>
                                                <button onClick={() => handleDownload(file.id)} style={{ color: '#0056b3', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {file.fileName}
                                                </button>
                                            </td>
                                            <td style={{ ...tdStyle, width: '15%', color: '#666' }}>{file.fileType}</td>
                                            <td style={{ ...tdStyle, width: '25%', textAlign: 'center' }}>
                                                <div className="action-buttons" style={{ justifyContent: 'center', gap: '4px' }}>
                                                    {isDwfFile(file.fileName) && (
                                                        <button
                                                            onClick={() => setViewingDwfFile(file)}
                                                            style={{ ...baseButtonStyle, padding: '1px 4px' }}
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                    <select
                                                        value=""
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            handleMoveFile(file.id, val === 'root' ? null : Number(val))
                                                        }}
                                                        style={{ fontSize: '10px', fontFamily: 'monospace' }}
                                                    >
                                                        <option value="" disabled>Move to...</option>
                                                        {currentFolderId !== null && <option value="root">Root</option>}
                                                        {folders
                                                            .filter(f => f.id !== currentFolderId)
                                                            .map(f => (
                                                                <option key={f.id} value={f.id}>{f.name}</option>
                                                            ))}
                                                    </select>
                                                    <button onClick={() => handleDeleteFile(file.id)} style={{ ...baseButtonStyle, padding: '1px 4px', color: '#a00' }}>Delete</button>
                                                    {viewingDwfFile && (
                                                        <DwfViewerModal
                                                            vehicleId={id}
                                                            fileId={viewingDwfFile.id}
                                                            fileName={viewingDwfFile.fileName}
                                                            onClose={() => setViewingDwfFile(null)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'notes' ? (
                <div>
                    <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa', marginBottom: '15px' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>
                            {editingNoteId ? "Edit Note" : "New Note"}
                        </div>
                        <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input type="text" placeholder="Note Title" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} required style={baseInputStyle} />
                            <textarea placeholder="Write your note here..." value={noteContent} onChange={e => setNoteContent(e.target.value)} required rows="4" style={{ ...baseInputStyle, resize: 'vertical' }} />
                            <div className="action-buttons">
                                <button type="submit" style={baseButtonStyle}>Save Note</button>
                                {editingNoteId && <button type="button" onClick={() => { setNoteTitle(''); setNoteContent(''); setEditingNoteId(null); }} style={baseButtonStyle}>Cancel</button>}
                            </div>
                        </form>
                    </div>

                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Saved Notes</div>
                    {notes.length === 0 ? (
                        <div style={{ border: '1px solid #aaa', padding: '8px', color: '#666' }}>No notes yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {notes.map(note => (
                                <div key={note.id} style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '6px', borderBottom: '1px dashed #aaa', paddingBottom: '2px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 'bold' }}>{note.title}</span>
                                        <div className="action-buttons">
                                            <button onClick={() => handleEditNoteSetup(note)} style={{ ...baseButtonStyle, padding: '1px 4px' }}>Edit</button>
                                            <button onClick={() => handleDeleteNote(note.id)} style={{ ...baseButtonStyle, padding: '1px 4px', color: '#a00' }}>Delete</button>
                                        </div>
                                    </div>
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '11px', background: '#fcfcfc', padding: '4px', border: '1px solid #eee' }}>{note.content}</pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : activeTab === 'compliance' ? (
                <div>
                    <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px', fontSize: '13px' }}>
                            Vignette (BGTOLL)
                        </div>
                        {!vehicle.plateNumber ? (
                            <div style={{ fontSize: '11px', color: '#666' }}>No plate number on file. Add one under Maintenance → Vehicle Specifications.</div>
                        ) : vignetteCheck ? (
                            <div style={{ fontSize: '12px' }}>
                                {vignetteCheck.bgTollFound ? (
                                    <>
                                        <div>Status: {vignetteCheck.bgTollStatus || 'Active'}</div>
                                        <div>Expires: {formatDate(vignetteCheck.bgTollExpiryDate)}</div>
                                        {vignetteCheck.hasLocalReminder ? (
                                            <div style={{ fontWeight: 'bold', color: vignetteCheck.match ? '#006600' : '#cc0000', marginTop: '4px' }}>
                                                {vignetteCheck.match ? '✓ Matches your saved reminder' : '✗ Does not match your saved reminder'}
                                            </div>
                                        ) : (
                                            <button onClick={handleAdoptBgTollVignette} style={{ ...baseButtonStyle, marginTop: '6px' }}>
                                                Save as Reminder
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ color: '#997a00' }}>{vignetteCheck.message}</div>
                                )}
                            </div>
                        ) : (
                            <div style={{ fontSize: '11px', color: '#666' }}>Checking...</div>
                        )}
                    </div>

                    <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px', fontSize: '13px' }}>
                            Annual Inspection (RTA)
                        </div>

                        {showInspectionCaptcha && inspectionCaptchaSession ? (
                            <div>
                                <div style={{ fontSize: '11px', marginBottom: '8px' }}>Enter the code shown below:</div>
                                <img
                                    src={`data:image/jpeg;base64,${inspectionCaptchaSession.captchaImageBase64}`}
                                    alt="Captcha"
                                    style={{ border: '1px solid #999', marginBottom: '8px', display: 'block' }}
                                />
                                <form onSubmit={handleSubmitInspectionCaptcha} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="Code from image"
                                        value={inspectionCaptchaCode}
                                        onChange={e => setInspectionCaptchaCode(e.target.value)}
                                        style={{ ...baseInputStyle, width: '140px' }}
                                        autoFocus
                                    />
                                    <button type="submit" style={baseButtonStyle} disabled={inspectionCheckLoading}>
                                        {inspectionCheckLoading ? 'Checking...' : 'Submit'}
                                    </button>
                                    <button type="button" onClick={handleCancelInspectionCaptcha} style={baseButtonStyle}>
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div>
                                {!vehicle.plateNumber ? (
                                    <div style={{ fontSize: '11px', color: '#666' }}>No plate number on file. Add one under Maintenance → Vehicle Specifications.</div>
                                ) : (
                                    <>
                                        {inspectionCheck && (
                                            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                                {inspectionCheck.rtaFound ? (
                                                    <>
                                                        <div>Expires: {formatDate(inspectionCheck.rtaExpiryDate)}</div>
                                                        {inspectionCheck.hasLocalReminder ? (
                                                            <div style={{ fontWeight: 'bold', color: inspectionCheck.match ? '#006600' : '#cc0000' }}>
                                                                {inspectionCheck.match ? '✓ Matches your saved reminder' : '✗ Does not match your saved reminder'}
                                                            </div>
                                                        ) : (
                                                            <button onClick={handleAdoptRtaInspection} style={{ ...baseButtonStyle, marginTop: '4px' }}>
                                                                Save as Reminder
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div style={{ color: '#997a00' }}>{inspectionCheck.message}</div>
                                                )}
                                            </div>
                                        )}
                                        <button onClick={handleStartInspectionCheck} style={baseButtonStyle} disabled={inspectionCheckLoading}>
                                            {inspectionCheckLoading ? 'Loading...' : 'Check RTA Inspection Status'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px', fontSize: '13px' }}>
                            Insurance (Guarantee Fund)
                        </div>
                        {!vehicle.plateNumber ? (
                            <div style={{ fontSize: '11px', color: '#666' }}>No plate number on file. Add one under Maintenance → Vehicle Specifications.</div>
                        ) : (
                            <div>
                                {insuranceCheck && (
                                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                        {insuranceCheck.insurerFound ? (
                                            <>
                                                <div>Insurer: {insuranceCheck.insurerName}</div>
                                                <div>Expires: {formatDate(insuranceCheck.insurerExpiryDate)}</div>
                                                {insuranceCheck.hasLocalReminder ? (
                                                    <div style={{ fontWeight: 'bold', color: insuranceCheck.match ? '#006600' : '#cc0000' }}>
                                                        {insuranceCheck.match ? '✓ Matches your saved reminder' : '✗ Does not match your saved reminder'}
                                                    </div>
                                                ) : (
                                                    <button onClick={handleAdoptInsurance} style={{ ...baseButtonStyle, marginTop: '4px' }}>
                                                        Save as Reminder
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div style={{ color: '#997a00' }}>{insuranceCheck.message}</div>
                                        )}
                                    </div>
                                )}
                                <button onClick={handleCheckInsurance} style={baseButtonStyle} disabled={insuranceCheckLoading}>
                                    {insuranceCheckLoading ? 'Checking...' : 'Check Insurance Status'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <ElectricalTab vehicleId={id} setErrorMessage={setErrorMessage} />
            )}
        </div>
    )
}

export default VehicleDashboardView;