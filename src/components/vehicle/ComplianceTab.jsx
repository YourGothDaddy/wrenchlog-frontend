import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/dateFormat'
import { baseInputStyle, baseButtonStyle } from '../../styles/shared'

function ComplianceTab({
                           vehicle,
                           vignetteCheck, handleAdoptBgTollVignette,
                           inspectionCheck, inspectionCaptchaSession, inspectionCaptchaCode, setInspectionCaptchaCode,
                           showInspectionCaptcha, inspectionCheckLoading,
                           handleStartInspectionCheck, handleSubmitInspectionCaptcha, handleCancelInspectionCaptcha,
                           handleAdoptRtaInspection,
                           insuranceCheck, insuranceCheckLoading,
                           handleCheckInsurance, handleAdoptInsurance
                       }) {
    const { t } = useTranslation()

    return (
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
    )
}

export default ComplianceTab