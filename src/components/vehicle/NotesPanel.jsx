import { useTranslation } from 'react-i18next'
import { baseInputStyle, baseButtonStyle } from '../../styles/shared'

function NotesPanel({
                        notes,
                        noteTitle, setNoteTitle,
                        noteContent, setNoteContent,
                        editingNoteId, setEditingNoteId,
                        handleSaveNote, handleEditNoteSetup, handleDeleteNote
                    }) {
    const { t } = useTranslation()

    return (
        <div>
            <div style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa', marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '8px' }}>
                    {editingNoteId ? t('notes.edit') : t('notes.new')}
                </div>
                <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input type="text" placeholder={t('notes.titlePlaceholder')} value={noteTitle} onChange={e => setNoteTitle(e.target.value)} required style={baseInputStyle} />
                    <textarea placeholder={t('notes.contentPlaceholder')} value={noteContent} onChange={e => setNoteContent(e.target.value)} required rows="4" style={{ ...baseInputStyle, resize: 'vertical' }} />
                    <div className="action-buttons">
                        <button type="submit" style={baseButtonStyle}>{t('notes.save')}</button>
                        {editingNoteId && <button type="button" onClick={() => { setNoteTitle(''); setNoteContent(''); setEditingNoteId(null); }} style={baseButtonStyle}>{t('common.cancel')}</button>}
                    </div>
                </form>
            </div>

            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{t('notes.heading')}</div>
            {notes.length === 0 ? (
                <div style={{ border: '1px solid #aaa', padding: '8px', color: '#666' }}>{t('notes.none')}</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notes.map(note => (
                        <div key={note.id} style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '6px', borderBottom: '1px dashed #aaa', paddingBottom: '2px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 'bold' }}>{note.title}</span>
                                <div className="action-buttons">
                                    <button onClick={() => handleEditNoteSetup(note)} style={{ ...baseButtonStyle, padding: '1px 4px' }}>{t('common.edit')}</button>
                                    <button onClick={() => handleDeleteNote(note.id)} style={{ ...baseButtonStyle, padding: '1px 4px', color: '#a00' }}>{t('common.delete')}</button>
                                </div>
                            </div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '11px', background: '#fcfcfc', padding: '4px', border: '1px solid #eee' }}>{note.content}</pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default NotesPanel