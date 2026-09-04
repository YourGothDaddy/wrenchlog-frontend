import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api, { BASE_URL } from '../utils/api'

function useVehicleFiles(vehicleId, vehicle, setErrorMessage) {
    const { t } = useTranslation()
    const [files, setFiles] = useState([])
    const [folders, setFolders] = useState([])
    const [currentFolderId, setCurrentFolderId] = useState(null)
    const [newFolderName, setNewFolderName] = useState('')

    const fetchFiles = (folderId = currentFolderId) => {
        const query = folderId != null ? `?folderId=${folderId}` : ''
        api.get(`/api/vehicles/${vehicleId}/files${query}`)
            .then(data => setFiles(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('files.loadFailedDefault'))
            })
    }

    const fetchFolders = () => {
        api.get(`/api/vehicles/${vehicleId}/folders`)
            .then(data => setFolders(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('files.loadFoldersFailedDefault'))
            })
    }

    useEffect(() => {
        fetchFiles()
        fetchFolders()
    }, [vehicleId])

    useEffect(() => {
        if (vehicle) fetchFiles(currentFolderId)
    }, [currentFolderId])

    const handleDownload = async (fileId) => {
        setErrorMessage('')
        try {
            const { token } = await api.get(`/api/vehicles/${vehicleId}/files/${fileId}/download-token`);
            window.location.href = `${BASE_URL}/api/vehicles/${vehicleId}/files/${fileId}/download?token=${token}`;
        } catch (err) {
            console.error(err)
            setErrorMessage(err.message || t('files.downloadFailedDefault'))
        }
    };

    const handleDeleteFile = (fileId) => {
        if (!window.confirm(t('files.confirmDelete'))) return
        setErrorMessage('')
        api.delete(`/api/vehicles/${vehicleId}/files/${fileId}`)
            .then(() => { fetchFiles(); fetchFolders() })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('files.deleteFailedDefault'))
            })
    }

    const handleMoveFile = (fileId, targetFolderId) => {
        setErrorMessage('')
        api.patch(`/api/vehicles/${vehicleId}/files/${fileId}/folder`, { folderId: targetFolderId })
            .then(() => { fetchFiles(); fetchFolders() })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('files.moveFailedDefault'))
            })
    }

    const handleCreateFolder = (e) => {
        e.preventDefault()
        if (!newFolderName.trim()) return
        setErrorMessage('')
        api.post(`/api/vehicles/${vehicleId}/folders`, { name: newFolderName.trim() })
            .then(() => { setNewFolderName(''); fetchFolders() })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('files.createFolderFailedDefault'))
            })
    }

    const handleRenameFolder = (folder) => {
        const newName = window.prompt(t('files.renamePrompt'), folder.name)
        if (!newName || !newName.trim() || newName.trim() === folder.name) return

        setErrorMessage('')
        api.put(`/api/vehicles/${vehicleId}/folders/${folder.id}`, { name: newName.trim() })
            .then(() => fetchFolders())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('files.renameFolderFailedDefault'))
            })
    }

    const handleDeleteFolder = (folderId) => {
        if (!window.confirm(t('files.confirmDeleteFolder'))) return

        setErrorMessage('')
        api.delete(`/api/vehicles/${vehicleId}/folders/${folderId}`)
            .then(() => {
                fetchFolders()
                if (currentFolderId === folderId) setCurrentFolderId(null)
                else fetchFiles()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('files.deleteFolderFailedDefault'))
            })
    }

    const handleOpenFolder = (folderId) => {
        setCurrentFolderId(folderId)
    }

    const handleBackToRoot = () => {
        setCurrentFolderId(null)
    }

    return {
        files, folders, currentFolderId, newFolderName, setNewFolderName,
        fetchFiles, fetchFolders,
        handleDownload, handleDeleteFile, handleMoveFile,
        handleCreateFolder, handleRenameFolder, handleDeleteFolder,
        handleOpenFolder, handleBackToRoot
    }
}

export default useVehicleFiles