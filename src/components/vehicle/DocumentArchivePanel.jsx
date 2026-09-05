import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DwfViewerModal from '../DwfViewerModal'
import { baseInputStyle, baseButtonStyle, tdStyle } from '../../styles/shared'

const isDwfFile = (fileName) => /\.(dwf|dwfx)$/i.test(fileName)

function DocumentArchivePanel({
                                  vehicleId,
                                  files, folders, currentFolderId, newFolderName, setNewFolderName,
                                  handleDownload, handleDeleteFile, handleMoveFile,
                                  handleCreateFolder, handleRenameFolder, handleDeleteFolder,
                                  handleOpenFolder, handleBackToRoot
                              }) {
    const { t } = useTranslation()
    const [viewingDwfFile, setViewingDwfFile] = useState(null)

    return (
        <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>
                    {currentFolderId != null
                        ? t('files.archiveInFolder', { folder: folders.find(f => f.id === currentFolderId)?.name || '' })
                        : t('files.archive')}
                </span>
                {currentFolderId != null && (
                    <button onClick={handleBackToRoot} style={{ ...baseButtonStyle, padding: '2px 8px' }}>
                        {t('files.backToDocuments')}
                    </button>
                )}
            </div>

            {currentFolderId === null && (
                <>
                    <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder={t('files.newFolderPlaceholder')}
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            style={{ ...baseInputStyle, flex: 1 }}
                        />
                        <button type="submit" style={baseButtonStyle}>{t('files.newFolder')}</button>
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
                                    title={t('files.itemCount', { count: folder.fileCount })}
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
                                    <div style={{ fontSize: '9px', color: '#666' }}>{t('files.itemCount', { count: folder.fileCount })}</div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRenameFolder(folder) }}
                                            style={{ ...baseButtonStyle, padding: '0px 3px', fontSize: '9px' }}
                                        >
                                            {t('files.rename')}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id) }}
                                            style={{ ...baseButtonStyle, padding: '0px 3px', fontSize: '9px', color: '#a00' }}
                                        >
                                            {t('common.delete')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {files.length === 0 ? <div style={{ fontSize: '11px', color: '#666' }}>{t('files.none')}</div> : (
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
                                                {t('files.view')}
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
                                            <option value="" disabled>{t('files.moveTo')}</option>
                                            {currentFolderId !== null && <option value="root">{t('files.root')}</option>}
                                            {folders
                                                .filter(f => f.id !== currentFolderId)
                                                .map(f => (
                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                ))}
                                        </select>
                                        <button onClick={() => handleDeleteFile(file.id)} style={{ ...baseButtonStyle, padding: '1px 4px', color: '#a00' }}>{t('common.delete')}</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewingDwfFile && (
                <DwfViewerModal
                    vehicleId={vehicleId}
                    fileId={viewingDwfFile.id}
                    fileName={viewingDwfFile.fileName}
                    onClose={() => setViewingDwfFile(null)}
                />
            )}
        </div>
    )
}

export default DocumentArchivePanel