import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n/config'
import api from '../utils/api'
import { baseInputStyle, baseButtonStyle } from '../styles/shared'

function SettingsView({ currentUser, onProfileUpdated }) {
    const { t, i18n } = useTranslation()

    const [username, setUsername] = useState(currentUser.username)
    const [email, setEmail] = useState(currentUser.email)
    const [profilePassword, setProfilePassword] = useState('')
    const [profileMessage, setProfileMessage] = useState('')
    const [profileError, setProfileError] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const langButtonStyle = (lang) => ({
        ...baseButtonStyle,
        padding: '3px 8px',
        fontSize: '11px',
        background: i18n.language === lang ? '#000' : '#e1e1e1',
        color: i18n.language === lang ? '#fff' : '#000'
    })

    const handleProfileSubmit = (e) => {
        e.preventDefault()
        setProfileMessage('')
        setProfileError('')
        api.put('/api/settings/profile', { username, email, currentPassword: profilePassword })
            .then(() => {
                setProfileMessage(t('settings.profileUpdated'))
                setProfilePassword('')
                onProfileUpdated({ ...currentUser, username, email })
            })
            .catch(err => setProfileError(err.message || t('settings.updateFailed')))
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        setPasswordMessage('')
        setPasswordError('')
        api.put('/api/settings/password', { currentPassword, newPassword })
            .then(() => {
                setPasswordMessage(t('settings.passwordUpdated'))
                setCurrentPassword('')
                setNewPassword('')
            })
            .catch(err => setPasswordError(err.message || t('settings.updateFailed')))
    }

    return (
        <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' }}>{t('settings.heading')}</div>

            <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>
                    {t('settings.language')}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => changeLanguage('en')} style={langButtonStyle('en')}>EN</button>
                    <button onClick={() => changeLanguage('bg')} style={langButtonStyle('bg')}>BG</button>
                </div>
            </div>

            <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>
                    {t('settings.profile')}
                </div>
                <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input type="text" placeholder={t('settings.username')} value={username} onChange={e => setUsername(e.target.value)} required style={baseInputStyle} />
                    <input type="email" placeholder={t('settings.email')} value={email} onChange={e => setEmail(e.target.value)} required style={baseInputStyle} />
                    <input type="password" placeholder={t('settings.currentPassword')} value={profilePassword} onChange={e => setProfilePassword(e.target.value)} required style={baseInputStyle} />
                    <button type="submit" style={{ ...baseButtonStyle, alignSelf: 'flex-start' }}>{t('settings.saveProfile')}</button>
                    {profileMessage && <div style={{ color: '#006600', fontSize: '11px' }}>{profileMessage}</div>}
                    {profileError && <div style={{ color: '#cc0000', fontSize: '11px' }}>{profileError}</div>}
                </form>
            </div>

            <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>
                    {t('settings.changePassword')}
                </div>
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input type="password" placeholder={t('settings.currentPassword')} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required style={baseInputStyle} />
                    <input type="password" placeholder={t('settings.newPassword')} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} style={baseInputStyle} />
                    <button type="submit" style={{ ...baseButtonStyle, alignSelf: 'flex-start' }}>{t('settings.savePassword')}</button>
                    {passwordMessage && <div style={{ color: '#006600', fontSize: '11px' }}>{passwordMessage}</div>}
                    {passwordError && <div style={{ color: '#cc0000', fontSize: '11px' }}>{passwordError}</div>}
                </form>
            </div>
        </div>
    )
}

export default SettingsView