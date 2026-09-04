import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'

function useServiceLogs(vehicleId, vehicle, setErrorMessage, fetchGarage) {
    const { t } = useTranslation()
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
        api.get(`/api/services?vehicleId=${vehicleId}`)
            .then(logs => { setServiceLogs(logs); setLoading(false); })
            .catch(err => {
                console.error(err)
                setLoading(false)
                setErrorMessage(err.message || t('service.loadFailedDefault'))
            })
    }

    useEffect(() => {
        fetchServiceLogs()
    }, [vehicleId, vehicle])

    const handleAddServiceLog = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const newLog = { description, cost: parseFloat(cost), kilometersAtService: parseInt(kilometersAtService), serviceDate }
        api.post(`/api/services?vehicleId=${vehicleId}`, newLog)
            .then(() => {
                setDescription(''); setCost(''); setKilometersAtService(''); setServiceDate('');
                fetchServiceLogs()
                fetchGarage()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('service.addFailedDefault'))
            })
    }

    const handleDeleteServiceLog = (serviceLogId) => {
        if (!window.confirm(t('service.confirmDelete'))) return

        setErrorMessage('')
        api.delete(`/api/services/${serviceLogId}`)
            .then(() => fetchServiceLogs())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('service.deleteFailedDefault'))
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
        api.put(`/api/services/${currentActiveLog.id}?vehicleId=${vehicleId}`, modifiedServiceLog)
            .then(() => {
                setModifyModal(false)
                fetchServiceLogs()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('service.updateFailedDefault'))
            })
    }

    return {
        serviceLogs, loading,
        description, setDescription,
        cost, setCost,
        kilometersAtService, setKilometersAtService,
        serviceDate, setServiceDate,
        modifyModalIsOpen, setModifyModal, currentActiveLog,
        modalDescription, setModalDescription,
        modalCost, setModalCost,
        modalKilometersAtService, setModalKilometersAtService,
        modalServiceDate, setModalServiceDate,
        handleAddServiceLog, handleDeleteServiceLog,
        handleModifyServiceLogModal, handleModifyServiceLog
    }
}

export default useServiceLogs