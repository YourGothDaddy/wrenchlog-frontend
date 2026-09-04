import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../utils/api'

function useVehicleNotes(vehicleId, setErrorMessage) {
    const { t } = useTranslation()
    const [notes, setNotes] = useState([])
    const [noteTitle, setNoteTitle] = useState('')
    const [noteContent, setNoteContent] = useState('')
    const [editingNoteId, setEditingNoteId] = useState(null)

    const fetchNotes = () => {
        api.get(`/api/vehicles/${vehicleId}/notes`)
            .then(data => setNotes(data))
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('notes.loadFailedDefault'))
            })
    }

    useEffect(() => {
        fetchNotes()
    }, [vehicleId])

    const handleSaveNote = (e) => {
        e.preventDefault()
        setErrorMessage('')
        const payload = { title: noteTitle, content: noteContent }
        const isEditing = editingNoteId !== null
        const endpoint = isEditing ? `/api/vehicles/${vehicleId}/notes/${editingNoteId}` : `/api/vehicles/${vehicleId}/notes`

        const request = isEditing ? api.put(endpoint, payload) : api.post(endpoint, payload)
        request.then(() => { setNoteTitle(''); setNoteContent(''); setEditingNoteId(null); fetchNotes(); })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('notes.saveFailedDefault'))
            })
    }

    const handleEditNoteSetup = (note) => {
        setNoteTitle(note.title); setNoteContent(note.content); setEditingNoteId(note.id);
    }

    const handleDeleteNote = (noteId) => {
        if (!window.confirm(t('notes.confirmDelete'))) return

        setErrorMessage('')
        api.delete(`/api/vehicles/${vehicleId}/notes/${noteId}`)
            .then(() => fetchNotes())
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('notes.deleteFailedDefault'))
            })
    }

    return {
        notes,
        noteTitle, setNoteTitle,
        noteContent, setNoteContent,
        editingNoteId, setEditingNoteId,
        handleSaveNote, handleEditNoteSetup, handleDeleteNote
    }
}

export default useVehicleNotes