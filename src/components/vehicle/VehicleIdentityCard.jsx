import { useTranslation } from 'react-i18next'
import { baseInputStyle, baseButtonStyle, tdStyle } from '../../styles/shared'

function VehicleIdentityCard({
                                 vehicle,
                                 showIdentityForm, setShowIdentityForm, openIdentityForm,
                                 makes, models, generations, modifications,
                                 selectedMake, setSelectedMake,
                                 selectedModel, setSelectedModel,
                                 selectedGeneration, setSelectedGeneration,
                                 selectedModification, setSelectedModification,
                                 identityYear, setIdentityYear,
                                 isProductionYearRangeValid,
                                 handleSaveIdentity, renderIdentityYearOptions,
                                 editingOdometer, setEditingOdometer,
                                 odometerValue, setOdometerValue,
                                 handleUpdateOdometer
                             }) {
    const { t } = useTranslation()

    return (
        <>
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
        </>
    )
}

export default VehicleIdentityCard