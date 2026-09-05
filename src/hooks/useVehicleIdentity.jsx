import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'
import useVehicleCatalog from './useVehicleCatalog'

function useVehicleIdentity(vehicleId, setErrorMessage, fetchGarage) {
    const { t } = useTranslation()
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
        api.put(`/api/vehicles/${vehicleId}/identity`, payload)
            .then(() => {
                setShowIdentityForm(false)
                resetSelections()
                fetchGarage()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('garage.identity.failedDefault'))
            })
    }

    const renderIdentityYearOptions = () => {
        if (!selectedModification) return <option value="">{t('garage.chooseModificationFirst')}</option>

        if (!isProductionYearRangeValid()) {
            return <option value="">{t('garage.noProductionYears')}</option>
        }

        const start = selectedModification.startYear
        const end = selectedModification.endYear ? selectedModification.endYear : 2026

        const yearOptions = []
        for (let y = start; y <= end; y++) {
            yearOptions.push(y)
        }

        return (
            <>
                <option value="">{t('garage.selectProductionYear')}</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </>
        )
    }

    return {
        showIdentityForm, setShowIdentityForm, openIdentityForm,
        makes, models, generations, modifications,
        selectedMake, setSelectedMake,
        selectedModel, setSelectedModel,
        selectedGeneration, setSelectedGeneration,
        selectedModification, setSelectedModification,
        identityYear, setIdentityYear,
        isProductionYearRangeValid,
        handleSaveIdentity, renderIdentityYearOptions
    }
}

export default useVehicleIdentity