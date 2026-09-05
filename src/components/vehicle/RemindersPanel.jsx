import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/dateFormat'
import { baseInputStyle, baseButtonStyle, tdStyle, thStyle } from '../../styles/shared'

function RemindersPanel({
                            reminders, checkIsDue,
                            reminderTitle, setReminderTitle,
                            reminderDesc, setReminderDesc,
                            lastServiceOdo, setLastServiceOdo,
                            intervalOdo, setIntervalOdo,
                            intervalMonths, setIntervalMonths,
                            lastServiceDate, setLastServiceDate,
                            showReminderForm, setShowReminderForm,
                            clearReminderForm, handleSaveReminderAndRefreshChecks, handleResetReminder,
                            handleEditReminderSetup, handleDeleteReminder,
                            vignetteCheck, inspectionCheck, insuranceCheck,
                            handleSetVignetteDateToMatchBgToll, handleSetInspectionDateToMatchRta, handleSetInsuranceDateToMatch
                        }) {
    const { t } = useTranslation()

    return (
        <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{t('reminders.heading')}</span>
                <button onClick={() => setShowReminderForm(!showReminderForm)} style={baseButtonStyle}>
                    {showReminderForm ? t('reminders.hideForm') : t('reminders.addReminder')}
                </button>
            </div>

            {showReminderForm && (
                <form onSubmit={handleSaveReminderAndRefreshChecks} style={{ border: '1px dashed #000', padding: '8px', marginBottom: '10px', backgroundColor: '#fff' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>{t('reminders.newReminder')}</div>
                    <div className="responsive-grid" style={{ marginBottom: '8px' }}>
                        <input type="text" placeholder={t('reminders.titlePlaceholder')} value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} required style={baseInputStyle} />
                        <input type="text" placeholder={t('reminders.notesPlaceholder')} value={reminderDesc} onChange={e => setReminderDesc(e.target.value)} style={baseInputStyle} />
                        <input type="number" placeholder={t('reminders.lastDoneAtKm')} value={lastServiceOdo} onChange={e => setLastServiceOdo(e.target.value)} style={baseInputStyle} />
                        <input type="number" placeholder={t('reminders.repeatEveryKm')} value={intervalOdo} onChange={e => setIntervalOdo(e.target.value)} style={baseInputStyle} />
                        <input type="date" value={lastServiceDate} onChange={e => setLastServiceDate(e.target.value)} style={baseInputStyle} />
                        <input type="number" placeholder={t('reminders.repeatEveryMonths')} value={intervalMonths} onChange={e => setIntervalMonths(e.target.value)} style={baseInputStyle} />
                    </div>
                    <div className="action-buttons">
                        <button type="submit" style={baseButtonStyle}>{t('reminders.saveRuleset')}</button>
                        <button type="button" onClick={clearReminderForm} style={baseButtonStyle}>{t('common.cancel')}</button>
                    </div>
                </form>
            )}

            {reminders.length === 0 ? (
                <div style={{ color: '#555', fontSize: '11px' }}>{t('reminders.none')}</div>
            ) : (
                <div className="table-scroll-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                            <th style={thStyle}>{t('reminders.table.status')}</th>
                            <th style={thStyle}>{t('reminders.table.reminder')}</th>
                            <th style={thStyle}>{t('reminders.table.schedule')}</th>
                            <th style={thStyle}>{t('reminders.table.actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reminders.map(rem => {
                            const isDue = checkIsDue(rem);
                            return (
                                <tr key={rem.id} style={{ backgroundColor: isDue ? '#ffebeb' : '#f7fff7' }}>
                                    <td style={{ ...tdStyle, color: isDue ? '#cc0000' : '#006600', fontWeight: 'bold' }}>
                                        {isDue ? t('reminders.due') : t('reminders.ok')}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: 'bold' }}>{rem.title}</span>
                                        {rem.description && <div style={{ fontSize: '11px', color: '#555' }}>{t('reminders.note', { description: rem.description })}</div>}
                                        {rem.sourceType === 'VIGNETTE' && vignetteCheck?.hasLocalReminder && (
                                            vignetteCheck.bgTollFound ? (
                                                <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: vignetteCheck.match ? '#006600' : '#cc0000' }}>
                                                    {vignetteCheck.match
                                                        ? t('reminders.vignette.confirmed')
                                                        : t('reminders.vignette.mismatch', { date: formatDate(vignetteCheck.bgTollExpiryDate) })}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '10px', marginTop: '2px', color: '#997a00' }}>
                                                    {t('reminders.vignette.unverified', { message: vignetteCheck.message })}
                                                </div>
                                            )
                                        )}
                                        {rem.sourceType === 'INSPECTION' && (
                                            inspectionCheck?.hasLocalReminder && inspectionCheck.rtaFound && !inspectionCheck.match ? (
                                                <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: '#cc0000' }}>
                                                    {t('reminders.inspection.mismatch', { date: formatDate(inspectionCheck.rtaExpiryDate) })}
                                                </div>
                                            ) : rem.verifiedExpiryDate && new Date(rem.verifiedExpiryDate) >= new Date(new Date().toDateString()) ? (
                                                <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: '#006600' }}>
                                                    {t('reminders.inspection.confirmed', { date: formatDate(rem.verifiedExpiryDate) })}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '10px', marginTop: '2px', color: '#997a00' }}>
                                                    {t('reminders.inspection.unverified')}
                                                </div>
                                            )
                                        )}
                                        {rem.sourceType === 'INSURANCE' && (
                                            insuranceCheck?.hasLocalReminder && insuranceCheck.insurerFound && !insuranceCheck.match ? (
                                                <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: '#cc0000' }}>
                                                    {t('reminders.insurance.mismatch', { date: formatDate(insuranceCheck.insurerExpiryDate) })}
                                                </div>
                                            ) : rem.verifiedExpiryDate && new Date(rem.verifiedExpiryDate) >= new Date(new Date().toDateString()) ? (
                                                <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold', color: '#006600' }}>
                                                    {t('reminders.insurance.confirmed', { date: formatDate(rem.verifiedExpiryDate) })}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '10px', marginTop: '2px', color: '#997a00' }}>
                                                    {t('reminders.insurance.unverified')}
                                                </div>
                                            )
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        {['VIGNETTE', 'INSPECTION', 'INSURANCE'].includes(rem.sourceType) && rem.lastServiceAtDate && rem.intervalMonths ? (
                                            <div style={{ fontWeight: 'bold' }}>
                                                {t('reminders.validUntil', {
                                                    date: formatDate(
                                                        new Date(new Date(rem.lastServiceAtDate).setMonth(new Date(rem.lastServiceAtDate).getMonth() + rem.intervalMonths)).toISOString().split('T')[0]
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <>
                                                {rem.intervalOdometer && <div>{t('reminders.odoSchedule', { interval: rem.intervalOdometer.toLocaleString(), last: rem.lastServiceAtOdometer?.toLocaleString() })}</div>}
                                                {rem.intervalMonths && <div>{t('reminders.timeSchedule', { months: rem.intervalMonths, last: rem.lastServiceAtDate || "—" })}</div>}
                                            </>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <div className="action-buttons">
                                            {rem.sourceType === 'INSPECTION' ? (
                                                inspectionCheck?.hasLocalReminder && inspectionCheck.rtaFound && !inspectionCheck.match && (
                                                    <button onClick={() => handleSetInspectionDateToMatchRta(rem)} style={{ ...baseButtonStyle, background: '#ffe4b3', padding: '2px 4px' }}>
                                                        {t('reminders.inspection.setToMatch')}
                                                    </button>
                                                )
                                            ) : rem.sourceType === 'INSURANCE' ? (
                                                insuranceCheck?.hasLocalReminder && insuranceCheck.insurerFound && !insuranceCheck.match && (
                                                    <button onClick={() => handleSetInsuranceDateToMatch(rem)} style={{ ...baseButtonStyle, background: '#ffe4b3', padding: '2px 4px' }}>
                                                        {t('reminders.insurance.setToMatch')}
                                                    </button>
                                                )
                                            ) : rem.sourceType === 'VIGNETTE' ? (
                                                vignetteCheck?.hasLocalReminder && vignetteCheck.bgTollFound && !vignetteCheck.match && (
                                                    <button onClick={() => handleSetVignetteDateToMatchBgToll(rem)} style={{ ...baseButtonStyle, background: '#ffe4b3', padding: '2px 4px' }}>
                                                        {t('reminders.vignette.setToMatch')}
                                                    </button>
                                                )
                                            ) : (
                                                <button onClick={() => handleResetReminder(rem)} style={{ ...baseButtonStyle, background: isDue ? '#ffcccc' : '#ccffcc', padding: '2px 4px' }}>{t('reminders.markDone')}</button>
                                            )}
                                            <button onClick={() => handleEditReminderSetup(rem)} style={{ ...baseButtonStyle, padding: '2px 4px' }}>{t('common.edit')}</button>
                                            <button onClick={() => handleDeleteReminder(rem.id)} style={{ ...baseButtonStyle, padding: '2px 4px', color: '#a00' }}>{t('common.delete')}</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default RemindersPanel