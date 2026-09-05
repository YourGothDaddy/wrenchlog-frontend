import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/dateFormat'
import { baseInputStyle, baseButtonStyle, tdStyle, thStyle } from '../../styles/shared'

function ServiceHistoryPanel({
                                 serviceLogs,
                                 handleDeleteServiceLog, handleModifyServiceLogModal,
                                 modifyModalIsOpen, currentActiveLog,
                                 modalDescription, setModalDescription,
                                 modalCost, setModalCost,
                                 modalKilometersAtService, setModalKilometersAtService,
                                 modalServiceDate, setModalServiceDate,
                                 handleModifyServiceLog, setModifyModal
                             }) {
    const { t } = useTranslation()

    return (
        <>
            {modifyModalIsOpen && currentActiveLog && (
                <div style={{ border: '2px solid #fd7e14', padding: '10px', marginBottom: '15px', backgroundColor: '#fffbe6' }}>
                    <div style={{ fontWeight: 'bold', color: '#fd7e14', marginBottom: '8px' }}>{t('service.editTitle', { id: currentActiveLog.id })}</div>
                    <form onSubmit={handleModifyServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input type="text" value={modalDescription} onChange={e => setModalDescription(e.target.value)} required style={baseInputStyle} />
                        <input type="number" step="0.01" value={modalCost} onChange={e => setModalCost(e.target.value)} required style={baseInputStyle} />
                        <input type="number" value={modalKilometersAtService} onChange={e => setModalKilometersAtService(e.target.value)} required style={baseInputStyle} />
                        <input type="date" value={modalServiceDate} onChange={e => setModalServiceDate(e.target.value)} required style={baseInputStyle} />
                        <div className="action-buttons">
                            <button type="submit" style={{ ...baseButtonStyle, background: '#fd7e14', color: '#fff' }}>{t('service.saveChanges')}</button>
                            <button type="button" onClick={() => setModifyModal(false)} style={baseButtonStyle}>{t('common.cancel')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{t('service.history')}</div>
                {serviceLogs.length === 0 ? (
                    <div style={{ border: '1px solid #aaa', padding: '8px', color: '#666' }}>{t('service.none')}</div>
                ) : (
                    <div className="table-scroll-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr>
                                <th style={thStyle}>{t('service.table.date')}</th>
                                <th style={thStyle}>{t('service.table.description')}</th>
                                <th style={thStyle}>{t('service.table.odometer')}</th>
                                <th style={thStyle}>{t('service.table.cost')}</th>
                                <th style={thStyle}>{t('service.table.actions')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {serviceLogs.map(log => (
                                <tr key={log.id}>
                                    <td style={tdStyle}>{formatDate(log.serviceDate)}</td>
                                    <td style={tdStyle}>{log.description}</td>
                                    <td style={tdStyle}>{log.kilometersAtService.toLocaleString()} km</td>
                                    <td style={tdStyle}>€{log.cost.toFixed(2)}</td>
                                    <td style={tdStyle}>
                                        <div className="action-buttons">
                                            <button onClick={() => handleModifyServiceLogModal(log)} style={{ ...baseButtonStyle, padding: '1px 4px' }}>{t('common.edit')}</button>
                                            <button onClick={() => handleDeleteServiceLog(log.id)} style={{ ...baseButtonStyle, padding: '1px 4px', color: '#a00' }}>{t('common.delete')}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}

export default ServiceHistoryPanel