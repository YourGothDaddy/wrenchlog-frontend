import { useTranslation } from 'react-i18next'
import api from '../../utils/api'

function FileUploadCard({ vehicleId, setErrorMessage, currentFolderId, folders, fetchFiles, fetchFolders }) {
    const { t } = useTranslation()

    return (
        <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>{t('files.attach')}</div>
            <input
                type="file"
                style={{ fontSize: '11px', width: '100%', marginBottom: '8px', boxSizing: 'border-box' }}
                onChange={(e) => {
                    setErrorMessage('')
                    const formData = new FormData()
                    formData.append("file", e.target.files[0])
                    if (currentFolderId != null) formData.append("folderId", currentFolderId)
                    api.post(`/api/vehicles/${vehicleId}/files`, formData)
                        .then(() => { fetchFiles(); fetchFolders() })
                        .catch(err => {
                            console.error(err)
                            setErrorMessage(err.message || t('files.uploadFailedDefault'))
                        })
                }}
            />
            <div style={{ fontSize: '10px', color: '#666' }}>
                {currentFolderId != null
                    ? t('files.uploadingInto', { folder: folders.find(f => f.id === currentFolderId)?.name || '' })
                    : t('files.uploadHint')}
            </div>
        </div>
    )
}

export default FileUploadCard