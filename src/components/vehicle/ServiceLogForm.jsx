import { useTranslation } from 'react-i18next'
import { baseInputStyle, baseButtonStyle } from '../../styles/shared'

function ServiceLogForm({
                            description, setDescription,
                            cost, setCost,
                            kilometersAtService, setKilometersAtService,
                            serviceDate, setServiceDate,
                            handleAddServiceLog
                        }) {
    const { t } = useTranslation()

    return (
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
    )
}

export default ServiceLogForm