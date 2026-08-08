export function formatDate(isoDateString) {
    if (!isoDateString) return ''
    const [year, month, day] = isoDateString.split('-')
    return `${month}-${day}-${year}`
}