import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/dateFormat'
import { baseInputStyle, baseButtonStyle } from '../../styles/shared'

function VehicleSpecsPanel({
                               vehicle,
                               showDetailsForm, setShowDetailsForm,
                               detailsForm, setDetailsForm,
                               openDetailsForm, handleSaveDetails
                           }) {
    const { t } = useTranslation()

    return (
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
    )
}

export default VehicleSpecsPanel