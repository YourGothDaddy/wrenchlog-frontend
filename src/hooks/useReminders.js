import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'

function useReminders(vehicleId, vehicle, setErrorMessage) {
    const { t } = useTranslation()
    const [reminders, setReminders] = useState([])
    const [reminderTitle, setReminderTitle] = useState('')
    const [reminderDesc, setReminderDesc] = useState('')
    const [lastServiceOdo, setLastServiceOdo] = useState('')
    const [intervalOdo, setIntervalOdo] = useState('')
    const [intervalMonths, setIntervalMonths] = useState('')
    const [lastServiceDate, setLastServiceDate] = useState('')
    const [showReminderForm, setShowReminderForm] = useState(false)
    const [editingReminderId, setEditingReminderId] = useState(null)

    const fetchReminders = () => {
        api.get(`/api/reminders?vehicleId=${vehicleId}`)
            .then(data => setReminders(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.failedDefault'))
            })
    }

    useEffect(() => {
        fetchReminders()
    }, [vehicleId])

    const clearReminderForm = () => {
        setReminderTitle(''); setReminderDesc(''); setLastServiceOdo('');
        setIntervalOdo(''); setIntervalMonths(''); setLastServiceDate('');
        setEditingReminderId(null); setShowReminderForm(false);
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
        const endpoint = isEditing ? `/api/reminders/${editingReminderId}?vehicleId=${vehicleId}` : `/api/reminders?vehicleId=${vehicleId}`

        const request = isEditing ? api.put(endpoint, payload) : api.post(endpoint, payload)
        request.then(() => { clearReminderForm(); fetchReminders(); })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.failedDefault'))
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
        api.put(`/api/reminders/${reminder.id}?vehicleId=${vehicleId}`, payload)
            .then(() => fetchReminders())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.resetFailedDefault'))
            })
    }

    const handleEditReminderSetup = (reminder) => {
        setReminderTitle(reminder.title); setReminderDesc(reminder.description || '');
        setLastServiceOdo(reminder.lastServiceAtOdometer || ''); setIntervalOdo(reminder.intervalOdometer || '');
        setIntervalMonths(reminder.intervalMonths || ''); setLastServiceDate(reminder.lastServiceAtDate || '');
        setEditingReminderId(reminder.id); setShowReminderForm(true);
    }

    const handleDeleteReminder = (reminderId) => {
        if (!window.confirm(t('reminders.confirmDelete'))) return

        setErrorMessage('')
        api.delete(`/api/reminders/${reminderId}`)
            .then(() => fetchReminders())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.deleteFailedDefault'))
            })
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

    return {
        reminders, fetchReminders,
        reminderTitle, setReminderTitle,
        reminderDesc, setReminderDesc,
        lastServiceOdo, setLastServiceOdo,
        intervalOdo, setIntervalOdo,
        intervalMonths, setIntervalMonths,
        lastServiceDate, setLastServiceDate,
        showReminderForm, setShowReminderForm,
        editingReminderId,
        clearReminderForm, handleSaveReminder, handleResetReminder,
        handleEditReminderSetup, handleDeleteReminder, checkIsDue
    }
}

export default useReminders