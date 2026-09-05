import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/config'
import useReminders from './useReminders'

vi.mock('../utils/api', () => ({
    default: {
        get: vi.fn(() => Promise.resolve([]))
    }
}))

function wrapper({ children }) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

describe('useReminders - checkIsDue', () => {
    const vehicle = { kilometers: 50000 }
    const setErrorMessage = vi.fn()

    function getCheckIsDue() {
        const { result } = renderHook(() => useReminders('1', vehicle, setErrorMessage), { wrapper })
        return result.current.checkIsDue
    }

    it('is not due when neither odometer nor date interval is set', () => {
        const checkIsDue = getCheckIsDue()
        const reminder = { intervalOdometer: null, lastServiceAtOdometer: null, intervalMonths: null, lastServiceAtDate: null }
        expect(checkIsDue(reminder)).toBe(false)
    })

    it('is due when current odometer has passed the interval threshold', () => {
        const checkIsDue = getCheckIsDue()
        const reminder = { intervalOdometer: 10000, lastServiceAtOdometer: 39000, intervalMonths: null, lastServiceAtDate: null }
        // 39000 + 10000 = 49000, vehicle is at 50000 -> due
        expect(checkIsDue(reminder)).toBe(true)
    })

    it('is not due when odometer has not yet reached the interval threshold', () => {
        const checkIsDue = getCheckIsDue()
        const reminder = { intervalOdometer: 10000, lastServiceAtOdometer: 45000, intervalMonths: null, lastServiceAtDate: null }
        // 45000 + 10000 = 55000, vehicle is at 50000 -> not due yet
        expect(checkIsDue(reminder)).toBe(false)
    })

    it('is due when the date interval has elapsed', () => {
        const checkIsDue = getCheckIsDue()
        const twoYearsAgo = new Date()
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
        const reminder = {
            intervalOdometer: null, lastServiceAtOdometer: null,
            intervalMonths: 12, lastServiceAtDate: twoYearsAgo.toISOString().split('T')[0]
        }
        expect(checkIsDue(reminder)).toBe(true)
    })

    it('is not due when the date interval has not yet elapsed', () => {
        const checkIsDue = getCheckIsDue()
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        const reminder = {
            intervalOdometer: null, lastServiceAtOdometer: null,
            intervalMonths: 12, lastServiceAtDate: oneMonthAgo.toISOString().split('T')[0]
        }
        expect(checkIsDue(reminder)).toBe(false)
    })

    it('is due when either the odometer or date threshold alone has passed', () => {
        const checkIsDue = getCheckIsDue()
        const twoYearsAgo = new Date()
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
        const reminder = {
            intervalOdometer: 10000, lastServiceAtOdometer: 45000,
            intervalMonths: 12, lastServiceAtDate: twoYearsAgo.toISOString().split('T')[0]
        }
        // odometer not yet due (55000 threshold, at 50000), but date is due -> overall due
        expect(checkIsDue(reminder)).toBe(true)
    })
})