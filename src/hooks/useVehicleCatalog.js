import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'

function useVehicleCatalog(onError) {
    const { t } = useTranslation()
    const [makes, setMakes] = useState([])
    const [models, setModels] = useState([])
    const [generations, setGenerations] = useState([])
    const [modifications, setModifications] = useState([])

    const [selectedMake, setSelectedMake] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedGeneration, setSelectedGeneration] = useState('')
    const [selectedModification, setSelectedModification] = useState(null)
    const [year, setYear] = useState('')

    const reportError = (err, fallbackMessage) => {
        console.error(err)
        if (onError) onError(err.message || fallbackMessage)
    }

    useEffect(() => {
        api.get('/api/catalog/makes')
            .then(data => setMakes(data))
            .catch(err => reportError(err, t('catalog.errors.makes')))
    }, [])

    useEffect(() => {
        if (!selectedMake) { setModels([]); return; }
        api.get(`/api/catalog/models?make=${encodeURIComponent(selectedMake)}`)
            .then(data => {
                setModels(data)
                setGenerations([])
                setModifications([])
                setSelectedModel('')
                setSelectedGeneration('')
                setSelectedModification(null)
                setYear('')
            })
            .catch(err => reportError(err, t('catalog.errors.models')))
    }, [selectedMake])

    useEffect(() => {
        if (!selectedModel) { setGenerations([]); return; }
        api.get(`/api/catalog/generations?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}`)
            .then(data => {
                if (Array.isArray(data)) {
                    const realGenerations = data.filter(gen => gen && gen.trim() !== "" && gen.toUpperCase() !== "N/A");
                    setGenerations(data);

                    if (realGenerations.length === 0 && data.length > 0) {
                        setSelectedGeneration(data[0]);
                    } else {
                        setSelectedGeneration('');
                    }
                } else {
                    setGenerations([]);
                    setSelectedGeneration('')
                }
                setModifications([])
                setSelectedModification(null)
                setYear('')
            })
            .catch(err => {
                setGenerations([]);
                setSelectedGeneration('');
                reportError(err, t('catalog.errors.generations'))
            })
    }, [selectedModel, selectedMake])

    useEffect(() => {
        if (!selectedGeneration) { setModifications([]); return; }

        api.get(`/api/catalog/modifications?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&generation=${encodeURIComponent(selectedGeneration)}`)
            .then(data => {
                setModifications(Array.isArray(data) ? data : []);
                setSelectedModification(null);
                setYear('');
            })
            .catch(err => {
                setModifications([]);
                reportError(err, t('catalog.errors.modifications'))
            });
    }, [selectedGeneration, selectedModel, selectedMake])

    const isProductionYearRangeValid = () => {
        if (!selectedModification) return true;
        return selectedModification.startYear >= 1885;
    }

    const resetSelections = () => {
        setSelectedMake('')
    }

    return {
        makes,
        models,
        generations,
        modifications,
        selectedMake, setSelectedMake,
        selectedModel, setSelectedModel,
        selectedGeneration, setSelectedGeneration,
        selectedModification, setSelectedModification,
        year, setYear,
        isProductionYearRangeValid,
        resetSelections
    }
}

export default useVehicleCatalog