export const baseInputStyle = {
    padding: '4px',
    border: '1px solid #777',
    background: '#fff',
    fontSize: '12px',
    fontFamily: 'monospace',
    width: '100%'
};

export const baseSelectStyle = baseInputStyle;

export const baseButtonStyle = {
    padding: '4px 12px',
    background: '#e1e1e1',
    border: '1px solid #777',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'monospace'
};

export const smallButtonStyle = {
    ...baseButtonStyle,
    padding: '2px 8px'
};

export const tdStyle = {
    padding: '5px',
    border: '1px solid #aaa',
    fontSize: '12px',
    textAlign: 'left'
};

export const thStyle = {
    padding: '5px',
    border: '1px solid #aaa',
    fontSize: '12px',
    textAlign: 'left',
    background: '#eaeaea',
    color: '#000'
};

export const stickyThStyle = {
    ...thStyle,
    position: 'sticky',
    left: 0,
    zIndex: 2
};

export const stickyTdStyle = {
    ...tdStyle,
    position: 'sticky',
    left: 0,
    zIndex: 1,
    background: '#f0f0f0'
};