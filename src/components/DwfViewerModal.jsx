import { useEffect, useRef, useState } from 'react'
import { DwfViewer } from 'dwf-viewer'
import { useTranslation } from 'react-i18next'
import api, { BASE_URL } from '../utils/api'

function DwfViewerModal({ vehicleId, fileId, fileName, onClose }) {
    const { t } = useTranslation()
    const containerRef = useRef(null)
    const viewerRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadAndRender() {
            setLoading(true)
            setError('')
            try {
                const { token } = await api.get(`/api/vehicles/${vehicleId}/files/${fileId}/download-token`)
                const response = await fetch(
                    `${BASE_URL}/api/vehicles/${vehicleId}/files/${fileId}/download?token=${token}`
                )
                if (!response.ok) throw new Error(t('dwf.fetchFailedDefault'))
                const blob = await response.blob()

                if (cancelled || !containerRef.current) return

                const viewer = new DwfViewer(containerRef.current, {
                    wasmUrl: '/dwfv-render.wasm',
                    preferWebgl: true,
                    preferWasm: true,
                    lineWeightMode: 'adaptive'
                })
                viewerRef.current = viewer

                await viewer.load(blob, { fileName })

                if (!cancelled) setLoading(false)
            } catch (err) {
                console.error(err)
                if (!cancelled) {
                    setError(err.message || t('dwf.loadFailedDefault'))
                    setLoading(false)
                }
            }
        }

        loadAndRender()

        return () => {
            cancelled = true
            viewerRef.current?.dispose()
            viewerRef.current = null
        }
    }, [vehicleId, fileId, fileName])

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1000,
                display: 'flex', flexDirection: 'column', padding: '20px'
            }}
        >
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '10px', color: '#fff', fontFamily: 'monospace'
            }}>
                <span style={{ fontWeight: 'bold' }}>{fileName}</span>
                <button
                    onClick={onClose}
                    style={{
                        padding: '4px 12px', background: '#e1e1e1', border: '1px solid #777',
                        cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace'
                    }}
                >
                    {t('dwf.close')}
                </button>
            </div>

            {error && (
                <div style={{ color: '#ff6b6b', fontFamily: 'monospace', marginBottom: '10px' }}>
                    {t('common.errorPrefix')} {error}
                </div>
            )}

            {loading && !error && (
                <div style={{ color: '#fff', fontFamily: 'monospace', marginBottom: '10px' }}>
                    {t('dwf.loading')}
                </div>
            )}

            <div
                ref={containerRef}
                style={{
                    flex: 1, backgroundColor: '#fff', border: '1px solid #000',
                    display: loading || error ? 'none' : 'block'
                }}
            />
        </div>
    )
}

export default DwfViewerModal