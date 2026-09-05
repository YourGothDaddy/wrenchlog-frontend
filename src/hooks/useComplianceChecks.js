import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'

function useComplianceChecks(vehicleId, setErrorMessage, fetchReminders) {
    const { t } = useTranslation()

    const [vignetteCheck, setVignetteCheck] = useState(null)

    const [inspectionCheck, setInspectionCheck] = useState(null)
    const [inspectionCaptchaSession, setInspectionCaptchaSession] = useState(null)
    const [inspectionCaptchaCode, setInspectionCaptchaCode] = useState('')
    const [showInspectionCaptcha, setShowInspectionCaptcha] = useState(false)
    const [inspectionCheckLoading, setInspectionCheckLoading] = useState(false)

    const [insuranceCheck, setInsuranceCheck] = useState(null)
    const [insuranceCheckLoading, setInsuranceCheckLoading] = useState(false)

    const fetchVignetteCheck = useCallback(() => {
        api.get(`/api/vehicles/${vehicleId}/vignette-check`)
            .then(data => setVignetteCheck(data))
            .catch(err => console.error(err))
    }, [vehicleId])

    const handleAdoptBgTollVignette = () => {
        setErrorMessage('')
        const lastServiceAtDate = new Date(vignetteCheck.bgTollExpiryDate)
        lastServiceAtDate.setFullYear(lastServiceAtDate.getFullYear() - 1)
        const payload = {
            title: t('reminders.adoptTitles.vignette'),
            description: null,
            lastServiceAtOdometer: null,
            intervalOdometer: null,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0],
            sourceType: 'VIGNETTE'
        }
        api.post(`/api/reminders?vehicleId=${vehicleId}`, payload)
            .then(() => { fetchReminders(); fetchVignetteCheck(); })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.adoptVignetteFailedDefault'))
            })
    }

    const handleSetVignetteDateToMatchBgToll = (rem) => {
        if (!vignetteCheck?.bgTollExpiryDate) return
        setErrorMessage('')
        const lastServiceAtDate = new Date(vignetteCheck.bgTollExpiryDate)
        lastServiceAtDate.setFullYear(lastServiceAtDate.getFullYear() - 1)
        const payload = {
            title: rem.title,
            description: rem.description,
            lastServiceAtOdometer: rem.lastServiceAtOdometer,
            intervalOdometer: rem.intervalOdometer,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0]
        }
        api.put(`/api/reminders/${rem.id}?vehicleId=${vehicleId}`, payload)
            .then(() => {
                fetchReminders()
                setVignetteCheck(prev => ({
                    ...prev,
                    match: true,
                    enteredExpiryDate: prev.bgTollExpiryDate,
                    message: t('reminders.vignette.confirmed')
                }))
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.updateDateFailedDefault'))
            })
    }

    const handleStartInspectionCheck = () => {
        setErrorMessage('')
        setInspectionCheckLoading(true)
        api.post(`/api/vehicles/${vehicleId}/inspection-check/start`)
            .then(data => {
                setInspectionCaptchaSession(data)
                setShowInspectionCaptcha(true)
                setInspectionCaptchaCode('')
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('compliance.startFailedDefault'))
            })
            .finally(() => setInspectionCheckLoading(false))
    }

    const handleSubmitInspectionCaptcha = (e) => {
        e.preventDefault()
        if (!inspectionCaptchaCode.trim()) return
        setErrorMessage('')
        setInspectionCheckLoading(true)
        api.post(`/api/vehicles/${vehicleId}/inspection-check/submit`, {
            sessionToken: inspectionCaptchaSession.sessionToken,
            captchaCode: inspectionCaptchaCode.trim()
        })
            .then(data => {
                if (data.captchaInvalid) {
                    setErrorMessage(t('compliance.captchaInvalid'))
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
                setErrorMessage(err.message || t('compliance.submitFailedDefault'))
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
            title: t('reminders.adoptTitles.inspection'),
            description: null,
            lastServiceAtOdometer: null,
            intervalOdometer: null,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0],
            sourceType: 'INSPECTION',
            verifiedExpiryDate: inspectionCheck.rtaExpiryDate
        }
        api.post(`/api/reminders?vehicleId=${vehicleId}`, payload)
            .then(() => { fetchReminders(); setInspectionCheck(null) })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.adoptInspectionFailedDefault'))
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
        api.put(`/api/reminders/${rem.id}?vehicleId=${vehicleId}`, payload)
            .then(() => {
                fetchReminders()
                setInspectionCheck(prev => ({
                    ...prev,
                    match: true,
                    enteredExpiryDate: prev.rtaExpiryDate,
                    message: t('reminders.inspection.confirmed', { date: '' })
                }))
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.updateDateFailedDefault'))
            })
    }

    const handleCheckInsurance = () => {
        setErrorMessage('')
        setInsuranceCheckLoading(true)
        api.post(`/api/vehicles/${vehicleId}/insurance-check`)
            .then(data => {
                setInsuranceCheck(data)
                fetchReminders()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('compliance.checkInsuranceFailedDefault'))
            })
            .finally(() => setInsuranceCheckLoading(false))
    }

    const handleAdoptInsurance = () => {
        setErrorMessage('')
        const lastServiceAtDate = new Date(insuranceCheck.insurerExpiryDate)
        lastServiceAtDate.setFullYear(lastServiceAtDate.getFullYear() - 1)
        const payload = {
            title: t('reminders.adoptTitles.insurance'),
            description: insuranceCheck.insurerName || null,
            lastServiceAtOdometer: null,
            intervalOdometer: null,
            intervalMonths: 12,
            lastServiceAtDate: lastServiceAtDate.toISOString().split('T')[0],
            sourceType: 'INSURANCE',
            verifiedExpiryDate: insuranceCheck.insurerExpiryDate
        }
        api.post(`/api/reminders?vehicleId=${vehicleId}`, payload)
            .then(() => { fetchReminders(); setInsuranceCheck(null) })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.adoptInsuranceFailedDefault'))
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
        api.put(`/api/reminders/${rem.id}?vehicleId=${vehicleId}`, payload)
            .then(() => {
                fetchReminders()
                setInsuranceCheck(prev => ({
                    ...prev,
                    match: true,
                    enteredExpiryDate: prev.insurerExpiryDate,
                    message: t('reminders.insurance.confirmed', { date: '' })
                }))
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('reminders.updateDateFailedDefault'))
            })
    }

    return {
        vignetteCheck, fetchVignetteCheck,
        handleAdoptBgTollVignette, handleSetVignetteDateToMatchBgToll,
        inspectionCheck, inspectionCaptchaSession, inspectionCaptchaCode, setInspectionCaptchaCode,
        showInspectionCaptcha, inspectionCheckLoading,
        handleStartInspectionCheck, handleSubmitInspectionCaptcha, handleCancelInspectionCaptcha,
        handleAdoptRtaInspection, handleSetInspectionDateToMatchRta,
        insuranceCheck, insuranceCheckLoading,
        handleCheckInsurance, handleAdoptInsurance, handleSetInsuranceDateToMatch
    }
}

export default useComplianceChecks