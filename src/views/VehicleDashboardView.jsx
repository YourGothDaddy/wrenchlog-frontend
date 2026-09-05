import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import api from '../utils/api'
import { formatDate } from '../utils/dateFormat'
import ElectricalTab from './ElectricalTab'
import DwfViewerModal from '../components/DwfViewerModal'
import { baseInputStyle as sharedInputStyle, baseButtonStyle, tdStyle as sharedTdStyle, thStyle as sharedThStyle } from '../styles/shared'
import useServiceLogs from '../hooks/useServiceLogs'
import useVehicleNotes from '../hooks/useVehicleNotes'
import useVehicleFiles from '../hooks/useVehicleFiles'
import useReminders from '../hooks/useReminders'
import useComplianceChecks from '../hooks/useComplianceChecks'
import useVehicleIdentity from '../hooks/useVehicleIdentity.jsx'
import useVehicleDetails from '../hooks/useVehicleDetails'
import NotesPanel from '../components/vehicle/NotesPanel'

function VehicleDashboardView({ vehicles, fetchGarage }) {
    const { t } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()

    const vehicle = vehicles.find(v => v.id === parseInt(id))

    const [activeTab, setActiveTab] = useState('history')

    const [errorMessage, setErrorMessage] = useState('')

    const {
        serviceLogs, loading,
        description, setDescription,
        cost, setCost,
        kilometersAtService, setKilometersAtService,
        serviceDate, setServiceDate,
        modifyModalIsOpen, setModifyModal, currentActiveLog,
        modalDescription, setModalDescription,
        modalCost, setModalCost,
        modalKilometersAtService, setModalKilometersAtService,
        modalServiceDate, setModalServiceDate,
        handleAddServiceLog, handleDeleteServiceLog,
        handleModifyServiceLogModal, handleModifyServiceLog
    } = useServiceLogs(id, vehicle, setErrorMessage, fetchGarage)

    const {
        notes,
        noteTitle, setNoteTitle,
        noteContent, setNoteContent,
        editingNoteId, setEditingNoteId,
        handleSaveNote, handleEditNoteSetup, handleDeleteNote
    } = useVehicleNotes(id, setErrorMessage)

    const {
        files, folders, currentFolderId, newFolderName, setNewFolderName,
        fetchFiles, fetchFolders,
        handleDownload, handleDeleteFile, handleMoveFile,
        handleCreateFolder, handleRenameFolder, handleDeleteFolder,
        handleOpenFolder, handleBackToRoot
    } = useVehicleFiles(id, vehicle, setErrorMessage)

    const {
        reminders, fetchReminders,
        reminderTitle, setReminderTitle,
        reminderDesc, setReminderDesc,
        lastServiceOdo, setLastServiceOdo,
        intervalOdo, setIntervalOdo,
        intervalMonths, setIntervalMonths,
        lastServiceDate, setLastServiceDate,
        showReminderForm, setShowReminderForm,
        clearReminderForm, handleSaveReminder, handleResetReminder,
        handleEditReminderSetup, handleDeleteReminder, checkIsDue
    } = useReminders(id, vehicle, setErrorMessage)

    const {
        vignetteCheck, fetchVignetteCheck,
        handleAdoptBgTollVignette, handleSetVignetteDateToMatchBgToll,
        inspectionCheck, inspectionCaptchaSession, inspectionCaptchaCode, setInspectionCaptchaCode,
        showInspectionCaptcha, inspectionCheckLoading,
        handleStartInspectionCheck, handleSubmitInspectionCaptcha, handleCancelInspectionCaptcha,
        handleAdoptRtaInspection, handleSetInspectionDateToMatchRta,
        insuranceCheck, insuranceCheckLoading,
        handleCheckInsurance, handleAdoptInsurance, handleSetInsuranceDateToMatch
    } = useComplianceChecks(id, setErrorMessage, fetchReminders)

    const {
        showIdentityForm, setShowIdentityForm, openIdentityForm,
        makes, models, generations, modifications,
        selectedMake, setSelectedMake,
        selectedModel, setSelectedModel,
        selectedGeneration, setSelectedGeneration,
        selectedModification, setSelectedModification,
        identityYear, setIdentityYear,
        isProductionYearRangeValid,
        handleSaveIdentity, renderIdentityYearOptions
    } = useVehicleIdentity(id, setErrorMessage, fetchGarage)

    const {
        showDetailsForm, setShowDetailsForm,
        detailsForm, setDetailsForm,
        openDetailsForm, handleSaveDetails
    } = useVehicleDetails(id, vehicle, setErrorMessage, fetchGarage, fetchReminders, fetchVignetteCheck)

    const [editingOdometer, setEditingOdometer] = useState(false)
    const [odometerValue, setOdometerValue] = useState('')

    const [viewingDwfFile, setViewingDwfFile] = useState(null)

    useEffect(() => {
        if (vehicle) fetchVignetteCheck()
    }, [id, vehicle, fetchVignetteCheck])

    const handleUpdateOdometer = (e) => {
        e.preventDefault()
        setErrorMessage('')
        api.put(`/api/vehicles/${id}/odometer`, { kilometers: parseInt(odometerValue) })
            .then(() => {
                setEditingOdometer(false)
                fetchGarage()
            })
            .catch(err => {
                console.error(err)
                setErrorMessage(err.message || t('vehicle.odometerFailedDefault'))
            })
    }

    const handleSaveReminderAndRefreshChecks = (e) => {
        handleSaveReminder(e)
        fetchVignetteCheck()
    }

    const isDwfFile = (fileName) => /\.(dwf|dwfx)$/i.test(fileName)

    if (loading) return <div style={{ padding: '10px', fontFamily: 'monospace' }}>{t('vehicle.loadingWorkspace')}</div>
    if (!vehicle) return <div style={{ padding: '10px', fontFamily: 'monospace' }}><p>{t('vehicle.notFound')}</p><button onClick={() => navigate('/')}>{t('common.back')}</button></div>

    const baseInputStyle = sharedInputStyle;
    const tdStyle = sharedTdStyle;
    const thStyle = sharedThStyle;

    return (
        <div style={{ padding: '10px', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff' }}>

            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => navigate('/')} style={baseButtonStyle}>{t('vehicle.backToGarage')}</button>
            </div>

            {errorMessage && (
                <div style={{ border: '1px solid #a00', color: '#a00', padding: '8px', marginBottom: '15px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff' }}>
                    {t('common.errorPrefix')} {errorMessage}
                </div>
            )}

            <table className="vehicle-info-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '2px solid #000' }}>
                <tbody>
                <tr>
                    <td style={{ ...tdStyle, background: '#f0f0f0', fontWeight: 'bold', width: '15%' }}>{t('vehicle.label')}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        <button
                            onClick={() => showIdentityForm ? setShowIdentityForm(false) : openIdentityForm()}
                            style={{ ...baseButtonStyle, marginLeft: '8px', padding: '1px 4px' }}
                        >
                            {showIdentityForm ? t('common.cancel') : t('common.edit')}
                        </button>
                    </td>
                    <td style={{ ...tdStyle, background: '#f0f0f0', fontWeight: 'bold', width: '20%' }}>{t('vehicle.currentOdometer')}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', width: '20%' }}>
                        {vehicle.kilometers.toLocaleString()} km
                        <button
                            onClick={() => { setOdometerValue(vehicle.kilometers); setEditingOdometer(true) }}
                            style={{ ...baseButtonStyle, marginLeft: '8px', padding: '1px 4px' }}
                        >
                            {t('common.edit')}
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>

            {showIdentityForm && (
                <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>{t('garage.identity.editTitle')}</div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                        {t('garage.identity.editHint')}
                    </div>
                    <form onSubmit={handleSaveIdentity} className="responsive-grid">
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{t('garage.make')}</div>
                            <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)} required style={baseInputStyle}>
                                <option value="">{t('garage.selectMake')}</option>
                                {makes.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{t('garage.model')}</div>
                            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedMake} required style={baseInputStyle}>
                                <option value="">{t('garage.selectModel')}</option>
                                {models.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{t('garage.generation')}</div>
                            <select value={selectedGeneration}
                                    onChange={e => setSelectedGeneration(e.target.value)}
                                    disabled={!selectedModel && generations.length <= 1}
                                    required style={baseInputStyle}>
                                {generations.length <= 1 ? (
                                    <option value={selectedGeneration}>{t('garage.noGenerationData')}</option>
                                ) : (
                                    <>
                                        <option value="">{t('garage.selectGeneration')}</option>
                                        {generations.map(g => <option key={g} value={g}>{g}</option>)}
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{t('garage.modification')}</div>
                            <select
                                value={selectedModification ? JSON.stringify(selectedModification) : ''}
                                onChange={e => setSelectedModification(e.target.value ? JSON.parse(e.target.value) : null)}
                                disabled={!selectedGeneration}
                                required
                                style={baseInputStyle}
                            >
                                <option value="">{t('garage.selectModification')}</option>
                                {modifications.map(m => (
                                    <option key={m.id} value={JSON.stringify(m)}>{m.modification}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{t('garage.year')}</div>
                            {isProductionYearRangeValid() ? (
                                <select value={identityYear} onChange={e => setIdentityYear(e.target.value)} disabled={!selectedModification} required style={baseInputStyle}>
                                    {renderIdentityYearOptions()}
                                </select>
                            ) : (
                                <select value="" style={baseInputStyle}>
                                    {renderIdentityYearOptions()}
                                </select>
                            )}
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                            <button type="submit" style={{ ...baseButtonStyle, width: '100%', padding: '6px' }}>{t('garage.identity.save')}</button>
                        </div>
                    </form>
                </div>
            )}

            {editingOdometer && (
                <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>{t('vehicle.editOdometer')}</div>
                    <form onSubmit={handleUpdateOdometer} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={odometerValue}
                            onChange={e => setOdometerValue(e.target.value)}
                            required
                            style={{ ...baseInputStyle, width: '140px' }}
                        />
                        <button type="submit" style={{ ...baseButtonStyle, whiteSpace: 'nowrap' }}>{t('common.save')}</button>
                        <button type="button" onClick={() => setEditingOdometer(false)} style={{ ...baseButtonStyle, whiteSpace: 'nowrap' }}>{t('common.cancel')}</button>
                    </form>
                </div>
            )}

            <div className="tab-row" style={{ display: 'flex', borderBottom: '2px solid #000', marginBottom: '15px' }}>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                        border: '1px solid #000', borderBottom: activeTab === 'history' ? '2px solid #fff' : '1px solid #000',
                        backgroundColor: activeTab === 'history' ? '#fff' : '#e1e1e1', marginBottom: '-2px', marginRight: '4px'
                    }}
                >
                    {t('vehicle.tabs.history')}
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                        border: '1px solid #000', borderBottom: activeTab === 'notes' ? '2px solid #fff' : '1px solid #000',
                        backgroundColor: activeTab === 'notes' ? '#fff' : '#e1e1e1', marginBottom: '-2px'
                    }}
                >
                    {t('vehicle.tabs.notes')}
                </button>
                <button
                    onClick={() => setActiveTab('electrical')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                        border: '1px solid #000', borderBottom: activeTab === 'electrical' ? '2px solid #fff' : '1px solid #000',
                        backgroundColor: activeTab === 'electrical' ? '#fff' : '#e1e1e1', marginBottom: '-2px', marginRight: '4px'
                    }}
                >
                    {t('vehicle.tabs.electrical')}
                </button>
                <button
                    onClick={() => setActiveTab('compliance')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold',
                        border: '1px solid #000', borderBottom: activeTab === 'compliance' ? '2px solid #fff' : '1px solid #000',
                        backgroundColor: activeTab === 'compliance' ? '#fff' : '#e1e1e1', marginBottom: '-2px'
                    }}
                >
                    {t('vehicle.tabs.compliance')}
                </button>
            </div>

            {activeTab === 'history' ? (
                <div>
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

                    <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{t('specs.heading')}</span>
                            <button onClick={showDetailsForm ? () => setShowDetailsForm(false) : openDetailsForm} style={baseButtonStyle}>
                                {showDetailsForm ? t('common.cancel') : t('specs.editDetails')}
                            </button>
                        </div>

                        {!showDetailsForm ? (
                            <div className="responsive-grid" style={{ fontSize: '12px' }}>
                                <div>{t('specs.vin')}: {vehicle.vin || '—'}</div>
                                <div>{t('specs.plate')}: {vehicle.plateNumber || '—'}</div>
                                <div>{t('specs.engine')}: {vehicle.engineCode || '—'}</div>
                                <div>{t('specs.transmission')}: {vehicle.transmissionType || '—'}</div>
                                <div>{t('specs.drive')}: {vehicle.driveType || '—'}</div>
                                <div>{t('specs.color')}: {vehicle.color || '—'}</div>
                                <div>{t('specs.fuel')}: {vehicle.fuelType || '—'}</div>
                                <div>{t('specs.tank')}: {vehicle.fuelTankCapacityLiters ? `${vehicle.fuelTankCapacityLiters} L` : '—'}</div>
                                <div>{t('specs.oil')}: {vehicle.engineOilCapacityLiters ? `${vehicle.engineOilCapacityLiters} L ${vehicle.engineOilType || ''}` : '—'}</div>
                                <div>{t('specs.tires')}: {vehicle.tireSize || '—'}</div>
                                <div>{t('specs.purchased')}: {vehicle.purchaseDate ? formatDate(vehicle.purchaseDate) : '—'}</div>
                                <div>{t('specs.price')}: {vehicle.purchasePrice ? `€${vehicle.purchasePrice}` : '—'}</div>
                            </div>
                        ) : (
                            <form onSubmit={handleSaveDetails} className="responsive-grid">
                                <input placeholder={t('specs.vinPlaceholder')} value={detailsForm.vin} onChange={e => setDetailsForm({...detailsForm, vin: e.target.value})} style={baseInputStyle} />
                                <input placeholder={t('specs.platePlaceholder')} value={detailsForm.plateNumber} onChange={e => setDetailsForm({...detailsForm, plateNumber: e.target.value})} style={baseInputStyle} />
                                <input placeholder={t('specs.engineCodePlaceholder')} value={detailsForm.engineCode} onChange={e => setDetailsForm({...detailsForm, engineCode: e.target.value})} style={baseInputStyle} />

                                <select value={detailsForm.transmissionType} onChange={e => setDetailsForm({...detailsForm, transmissionType: e.target.value})} style={baseInputStyle}>
                                    <option value="">{t('specs.transmissionOption')}</option>
                                    <option value="MANUAL">{t('specs.manual')}</option>
                                    <option value="AUTOMATIC">{t('specs.automatic')}</option>
                                    <option value="CVT">{t('specs.cvt')}</option>
                                    <option value="DCT">{t('specs.dct')}</option>
                                    <option value="SEMI_AUTOMATIC">{t('specs.semiAutomatic')}</option>
                                </select>

                                <select value={detailsForm.driveType} onChange={e => setDetailsForm({...detailsForm, driveType: e.target.value})} style={baseInputStyle}>
                                    <option value="">{t('specs.driveTypeOption')}</option>
                                    <option value="FWD">{t('specs.fwd')}</option>
                                    <option value="RWD">{t('specs.rwd')}</option>
                                    <option value="AWD">{t('specs.awd')}</option>
                                    <option value="FOUR_WD">{t('specs.fourWd')}</option>
                                </select>

                                <select value={detailsForm.fuelType} onChange={e => setDetailsForm({...detailsForm, fuelType: e.target.value})} style={baseInputStyle}>
                                    <option value="">{t('specs.fuelTypeOption')}</option>
                                    <option value="PETROL">{t('specs.petrol')}</option>
                                    <option value="DIESEL">{t('specs.diesel')}</option>
                                    <option value="ELECTRIC">{t('specs.electric')}</option>
                                    <option value="HYBRID">{t('specs.hybrid')}</option>
                                    <option value="LPG">{t('specs.lpg')}</option>
                                    <option value="CNG">{t('specs.cng')}</option>
                                </select>

                                <input placeholder={t('specs.colorPlaceholder')} value={detailsForm.color} onChange={e => setDetailsForm({...detailsForm, color: e.target.value})} style={baseInputStyle} />
                                <input type="number" step="0.1" placeholder={t('specs.fuelTankPlaceholder')} value={detailsForm.fuelTankCapacityLiters} onChange={e => setDetailsForm({...detailsForm, fuelTankCapacityLiters: e.target.value})} style={baseInputStyle} />
                                <input type="number" step="0.01" placeholder={t('specs.oilCapacityPlaceholder')} value={detailsForm.engineOilCapacityLiters} onChange={e => setDetailsForm({...detailsForm, engineOilCapacityLiters: e.target.value})} style={baseInputStyle} />
                                <input placeholder={t('specs.oilTypePlaceholder')} value={detailsForm.engineOilType} onChange={e => setDetailsForm({...detailsForm, engineOilType: e.target.value})} style={baseInputStyle} />
                                <input placeholder={t('specs.tireSizePlaceholder')} value={detailsForm.tireSize} onChange={e => setDetailsForm({...detailsForm, tireSize: e.target.value})} style={baseInputStyle} />

                                <div>
                                    <div style={{ fontSize: '10px' }}>{t('specs.purchaseDate')}</div>
                                    <input type="date" value={detailsForm.purchaseDate} onChange={e => setDetailsForm({...detailsForm, purchaseDate: e.target.value})} style={baseInputStyle} />
                                </div>
                                <input type="number" step="0.01" placeholder={t('specs.purchasePricePlaceholder')} value={detailsForm.purchasePrice} onChange={e => setDetailsForm({...detailsForm, purchasePrice: e.target.value})} style={baseInputStyle} />

                                <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #000', marginTop: '4px', paddingTop: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                                    {t('specs.reminderDatesHint')}
                                </div>

                                <div>
                                    <div style={{ fontSize: '10px' }}>{t('specs.insuranceExpiry')}</div>
                                    <input type="date" value={detailsForm.insuranceExpiryDate} onChange={e => setDetailsForm({...detailsForm, insuranceExpiryDate: e.target.value})} style={baseInputStyle} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px' }}>{t('specs.vignetteExpiry')}</div>
                                    <input type="date" value={detailsForm.vignetteExpiryDate} onChange={e => setDetailsForm({...detailsForm, vignetteExpiryDate: e.target.value})} style={baseInputStyle} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px' }}>{t('specs.inspectionDue')}</div>
                                    <input type="date" value={detailsForm.inspectionDueDate} onChange={e => setDetailsForm({...detailsForm, inspectionDueDate: e.target.value})} style={baseInputStyle} />
                                </div>

                                <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                                    <button type="submit" style={{ ...baseButtonStyle, width: '100%', padding: '6px' }}>{t('specs.save')}</button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="responsive-grid" style={{ marginBottom: '15px' }}>
                        <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>{t('service.add')}</div>
                            <form onSubmit={handleAddServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input type="text" placeholder={t('service.descriptionPlaceholder')} value={description} onChange={e => setDescription(e.target.value)} required style={baseInputStyle} />
                                <input type="number" step="0.01" placeholder={t('service.costPlaceholder')} value={cost} onChange={e => setCost(e.target.value)} required style={baseInputStyle} />
                                <input type="number" placeholder={t('service.odometerPlaceholder')} value={kilometersAtService} onChange={e => setKilometersAtService(e.target.value)} required style={baseInputStyle} />
                                <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} required style={baseInputStyle} />
                                <button type="submit" style={baseButtonStyle}>{t('service.addEntry')}</button>
                            </form>
                        </div>

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
                                    api.post(`/api/vehicles/${id}/files`, formData)
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
                    </div>

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
                                                    {viewingDwfFile && (
                                                        <DwfViewerModal
                                                            vehicleId={id}
                                                            fileId={viewingDwfFile.id}
                                                            fileName={viewingDwfFile.fileName}
                                                            onClose={() => setViewingDwfFile(null)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'notes' ? (
                <NotesPanel
                    notes={notes}
                    noteTitle={noteTitle} setNoteTitle={setNoteTitle}
                    noteContent={noteContent} setNoteContent={setNoteContent}
                    editingNoteId={editingNoteId} setEditingNoteId={setEditingNoteId}
                    handleSaveNote={handleSaveNote}
                    handleEditNoteSetup={handleEditNoteSetup}
                    handleDeleteNote={handleDeleteNote}
                />
            ) : activeTab === 'compliance' ? (
                <div>
                    <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px', fontSize: '13px' }}>
                            {t('compliance.vignetteTitle')}
                        </div>
                        {!vehicle.plateNumber ? (
                            <div style={{ fontSize: '11px', color: '#666' }}>{t('compliance.noPlate')}</div>
                        ) : vignetteCheck ? (
                            <div style={{ fontSize: '12px' }}>
                                {vignetteCheck.bgTollFound ? (
                                    <>
                                        <div>{t('compliance.status', { status: vignetteCheck.bgTollStatus || 'Active' })}</div>
                                        <div>{t('compliance.expires', { date: formatDate(vignetteCheck.bgTollExpiryDate) })}</div>
                                        {vignetteCheck.hasLocalReminder ? (
                                            <div style={{ fontWeight: 'bold', color: vignetteCheck.match ? '#006600' : '#cc0000', marginTop: '4px' }}>
                                                {vignetteCheck.match ? t('compliance.matches') : t('compliance.mismatch')}
                                            </div>
                                        ) : (
                                            <button onClick={handleAdoptBgTollVignette} style={{ ...baseButtonStyle, marginTop: '6px' }}>
                                                {t('compliance.saveAsReminder')}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ color: '#997a00' }}>{vignetteCheck.message}</div>
                                )}
                            </div>
                        ) : (
                            <div style={{ fontSize: '11px', color: '#666' }}>{t('compliance.checking')}</div>
                        )}
                    </div>

                    <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px', fontSize: '13px' }}>
                            {t('compliance.inspectionTitle')}
                        </div>

                        {showInspectionCaptcha && inspectionCaptchaSession ? (
                            <div>
                                <div style={{ fontSize: '11px', marginBottom: '8px' }}>{t('compliance.captchaHint')}</div>
                                <img
                                    src={`data:image/jpeg;base64,${inspectionCaptchaSession.captchaImageBase64}`}
                                    alt="Captcha"
                                    style={{ border: '1px solid #999', marginBottom: '8px', display: 'block' }}
                                />
                                <form onSubmit={handleSubmitInspectionCaptcha} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder={t('compliance.captchaPlaceholder')}
                                        value={inspectionCaptchaCode}
                                        onChange={e => setInspectionCaptchaCode(e.target.value)}
                                        style={{ ...baseInputStyle, width: '140px' }}
                                        autoFocus
                                    />
                                    <button type="submit" style={baseButtonStyle} disabled={inspectionCheckLoading}>
                                        {inspectionCheckLoading ? t('compliance.checking') : t('compliance.submit')}
                                    </button>
                                    <button type="button" onClick={handleCancelInspectionCaptcha} style={baseButtonStyle}>
                                        {t('common.cancel')}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div>
                                {!vehicle.plateNumber ? (
                                    <div style={{ fontSize: '11px', color: '#666' }}>{t('compliance.noPlate')}</div>
                                ) : (
                                    <>
                                        {inspectionCheck && (
                                            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                                {inspectionCheck.rtaFound ? (
                                                    <>
                                                        <div>{t('compliance.expires', { date: formatDate(inspectionCheck.rtaExpiryDate) })}</div>
                                                        {inspectionCheck.hasLocalReminder ? (
                                                            <div style={{ fontWeight: 'bold', color: inspectionCheck.match ? '#006600' : '#cc0000' }}>
                                                                {inspectionCheck.match ? t('compliance.matches') : t('compliance.mismatch')}
                                                            </div>
                                                        ) : (
                                                            <button onClick={handleAdoptRtaInspection} style={{ ...baseButtonStyle, marginTop: '4px' }}>
                                                                {t('compliance.saveAsReminder')}
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div style={{ color: '#997a00' }}>{inspectionCheck.message}</div>
                                                )}
                                            </div>
                                        )}
                                        <button onClick={handleStartInspectionCheck} style={baseButtonStyle} disabled={inspectionCheckLoading}>
                                            {inspectionCheckLoading ? t('compliance.loadingButton') : t('compliance.checkInspection')}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px', fontSize: '13px' }}>
                            {t('compliance.insuranceTitle')}
                        </div>
                        {!vehicle.plateNumber ? (
                            <div style={{ fontSize: '11px', color: '#666' }}>{t('compliance.noPlate')}</div>
                        ) : (
                            <div>
                                {insuranceCheck && (
                                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                        {insuranceCheck.insurerFound ? (
                                            <>
                                                <div>{t('compliance.insurer', { name: insuranceCheck.insurerName })}</div>
                                                <div>{t('compliance.expires', { date: formatDate(insuranceCheck.insurerExpiryDate) })}</div>
                                                {insuranceCheck.hasLocalReminder ? (
                                                    <div style={{ fontWeight: 'bold', color: insuranceCheck.match ? '#006600' : '#cc0000' }}>
                                                        {insuranceCheck.match ? t('compliance.matches') : t('compliance.mismatch')}
                                                    </div>
                                                ) : (
                                                    <button onClick={handleAdoptInsurance} style={{ ...baseButtonStyle, marginTop: '4px' }}>
                                                        {t('compliance.saveAsReminder')}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div style={{ color: '#997a00' }}>{insuranceCheck.message}</div>
                                        )}
                                    </div>
                                )}
                                <button onClick={handleCheckInsurance} style={baseButtonStyle} disabled={insuranceCheckLoading}>
                                    {insuranceCheckLoading ? t('compliance.checking') : t('compliance.checkInsurance')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <ElectricalTab vehicleId={id} setErrorMessage={setErrorMessage} />
            )}
        </div>
    )
}

export default VehicleDashboardView;