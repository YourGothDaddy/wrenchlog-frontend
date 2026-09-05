import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import api from '../utils/api'
import ElectricalTab from './ElectricalTab'
import { baseButtonStyle } from '../styles/shared'
import useServiceLogs from '../hooks/useServiceLogs'
import useVehicleNotes from '../hooks/useVehicleNotes'
import useVehicleFiles from '../hooks/useVehicleFiles'
import useReminders from '../hooks/useReminders'
import useComplianceChecks from '../hooks/useComplianceChecks'
import useVehicleIdentity from '../hooks/useVehicleIdentity'
import useVehicleDetails from '../hooks/useVehicleDetails'
import VehicleIdentityCard from '../components/vehicle/VehicleIdentityCard'
import RemindersPanel from '../components/vehicle/RemindersPanel'
import VehicleSpecsPanel from '../components/vehicle/VehicleSpecsPanel'
import ServiceHistoryPanel from '../components/vehicle/ServiceHistoryPanel'
import DocumentArchivePanel from '../components/vehicle/DocumentArchivePanel'
import NotesPanel from '../components/vehicle/NotesPanel'
import ComplianceTab from '../components/vehicle/ComplianceTab'
import ServiceLogForm from '../components/vehicle/ServiceLogForm'
import FileUploadCard from '../components/vehicle/FileUploadCard'

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

    if (loading) return <div style={{ padding: '10px', fontFamily: 'monospace' }}>{t('vehicle.loadingWorkspace')}</div>
    if (!vehicle) return <div style={{ padding: '10px', fontFamily: 'monospace' }}><p>{t('vehicle.notFound')}</p><button onClick={() => navigate('/')}>{t('common.back')}</button></div>

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

            <VehicleIdentityCard
                vehicle={vehicle}
                showIdentityForm={showIdentityForm} setShowIdentityForm={setShowIdentityForm} openIdentityForm={openIdentityForm}
                makes={makes} models={models} generations={generations} modifications={modifications}
                selectedMake={selectedMake} setSelectedMake={setSelectedMake}
                selectedModel={selectedModel} setSelectedModel={setSelectedModel}
                selectedGeneration={selectedGeneration} setSelectedGeneration={setSelectedGeneration}
                selectedModification={selectedModification} setSelectedModification={setSelectedModification}
                identityYear={identityYear} setIdentityYear={setIdentityYear}
                isProductionYearRangeValid={isProductionYearRangeValid}
                handleSaveIdentity={handleSaveIdentity} renderIdentityYearOptions={renderIdentityYearOptions}
                editingOdometer={editingOdometer} setEditingOdometer={setEditingOdometer}
                odometerValue={odometerValue} setOdometerValue={setOdometerValue}
                handleUpdateOdometer={handleUpdateOdometer}
            />

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
                    <RemindersPanel
                        reminders={reminders} checkIsDue={checkIsDue}
                        reminderTitle={reminderTitle} setReminderTitle={setReminderTitle}
                        reminderDesc={reminderDesc} setReminderDesc={setReminderDesc}
                        lastServiceOdo={lastServiceOdo} setLastServiceOdo={setLastServiceOdo}
                        intervalOdo={intervalOdo} setIntervalOdo={setIntervalOdo}
                        intervalMonths={intervalMonths} setIntervalMonths={setIntervalMonths}
                        lastServiceDate={lastServiceDate} setLastServiceDate={setLastServiceDate}
                        showReminderForm={showReminderForm} setShowReminderForm={setShowReminderForm}
                        clearReminderForm={clearReminderForm}
                        handleSaveReminderAndRefreshChecks={handleSaveReminderAndRefreshChecks}
                        handleResetReminder={handleResetReminder}
                        handleEditReminderSetup={handleEditReminderSetup}
                        handleDeleteReminder={handleDeleteReminder}
                        vignetteCheck={vignetteCheck} inspectionCheck={inspectionCheck} insuranceCheck={insuranceCheck}
                        handleSetVignetteDateToMatchBgToll={handleSetVignetteDateToMatchBgToll}
                        handleSetInspectionDateToMatchRta={handleSetInspectionDateToMatchRta}
                        handleSetInsuranceDateToMatch={handleSetInsuranceDateToMatch}
                    />

                    <VehicleSpecsPanel
                        vehicle={vehicle}
                        showDetailsForm={showDetailsForm} setShowDetailsForm={setShowDetailsForm}
                        detailsForm={detailsForm} setDetailsForm={setDetailsForm}
                        openDetailsForm={openDetailsForm} handleSaveDetails={handleSaveDetails}
                    />

                    <div className="responsive-grid" style={{ marginBottom: '15px' }}>
                        <ServiceLogForm
                            description={description} setDescription={setDescription}
                            cost={cost} setCost={setCost}
                            kilometersAtService={kilometersAtService} setKilometersAtService={setKilometersAtService}
                            serviceDate={serviceDate} setServiceDate={setServiceDate}
                            handleAddServiceLog={handleAddServiceLog}
                        />

                        <FileUploadCard
                            vehicleId={id} setErrorMessage={setErrorMessage}
                            currentFolderId={currentFolderId} folders={folders}
                            fetchFiles={fetchFiles} fetchFolders={fetchFolders}
                        />
                    </div>

                    <ServiceHistoryPanel
                        serviceLogs={serviceLogs}
                        handleDeleteServiceLog={handleDeleteServiceLog}
                        handleModifyServiceLogModal={handleModifyServiceLogModal}
                        modifyModalIsOpen={modifyModalIsOpen} currentActiveLog={currentActiveLog}
                        modalDescription={modalDescription} setModalDescription={setModalDescription}
                        modalCost={modalCost} setModalCost={setModalCost}
                        modalKilometersAtService={modalKilometersAtService} setModalKilometersAtService={setModalKilometersAtService}
                        modalServiceDate={modalServiceDate} setModalServiceDate={setModalServiceDate}
                        handleModifyServiceLog={handleModifyServiceLog} setModifyModal={setModifyModal}
                    />

                    <DocumentArchivePanel
                        vehicleId={id}
                        files={files} folders={folders} currentFolderId={currentFolderId}
                        newFolderName={newFolderName} setNewFolderName={setNewFolderName}
                        handleDownload={handleDownload} handleDeleteFile={handleDeleteFile} handleMoveFile={handleMoveFile}
                        handleCreateFolder={handleCreateFolder} handleRenameFolder={handleRenameFolder} handleDeleteFolder={handleDeleteFolder}
                        handleOpenFolder={handleOpenFolder} handleBackToRoot={handleBackToRoot}
                    />
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
                <ComplianceTab
                    vehicle={vehicle}
                    vignetteCheck={vignetteCheck} handleAdoptBgTollVignette={handleAdoptBgTollVignette}
                    inspectionCheck={inspectionCheck} inspectionCaptchaSession={inspectionCaptchaSession}
                    inspectionCaptchaCode={inspectionCaptchaCode} setInspectionCaptchaCode={setInspectionCaptchaCode}
                    showInspectionCaptcha={showInspectionCaptcha} inspectionCheckLoading={inspectionCheckLoading}
                    handleStartInspectionCheck={handleStartInspectionCheck}
                    handleSubmitInspectionCaptcha={handleSubmitInspectionCaptcha}
                    handleCancelInspectionCaptcha={handleCancelInspectionCaptcha}
                    handleAdoptRtaInspection={handleAdoptRtaInspection}
                    insuranceCheck={insuranceCheck} insuranceCheckLoading={insuranceCheckLoading}
                    handleCheckInsurance={handleCheckInsurance} handleAdoptInsurance={handleAdoptInsurance}
                />
            ) : (
                <ElectricalTab vehicleId={id} setErrorMessage={setErrorMessage} />
            )}
        </div>
    )
}

export default VehicleDashboardView;