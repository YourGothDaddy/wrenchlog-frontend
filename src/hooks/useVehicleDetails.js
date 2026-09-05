import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'

function useVehicleDetails(vehicleId, vehicle, setErrorMessage, fetchGarage, fetchReminders, fetchVignetteCheck) {
    const { t } = useTranslation()
    const [showDetailsForm, setShowDetailsForm] = useState(false)
    const [detailsForm, setDetailsForm] = useState({
        vin: '', plateNumber: '', engineCode: '', transmissionType: '', driveType: '',
        color: '', fuelType: '', fuelTankCapacityLiters: '', engineOilCapacityLiters: '',
        engineOilType: '', tireSize: '', purchaseDate: '', purchasePrice: '',
        insuranceExpiryDate: '', vignetteExpiryDate: '', inspectionDueDate: ''
    })

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
        api.put(`/api/vehicles/${vehicleId}/details`, payload)
            .then(() => {
                setShowDetailsForm(false)
                fetchGarage()
                fetchReminders()
                fetchVignetteCheck()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('specs.failedDefault'))
            })
    }

    return {
        showDetailsForm, setShowDetailsForm,
        detailsForm, setDetailsForm,
        openDetailsForm, handleSaveDetails
    }
}

export default useVehicleDetails