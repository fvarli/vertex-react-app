import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { extractApiMessage, extractValidationErrors, isForbidden, isValidationError } from '../lib/api-errors'

describe('api-errors', () => {
  it('reads API message from axios errors', () => {
    const err = new axios.AxiosError('failed', undefined, undefined, undefined, {
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: { message: 'Validation failed.' },
    })

    expect(extractApiMessage(err, 'fallback')).toBe('Validation failed.')
    expect(isValidationError(err)).toBe(true)
    expect(isForbidden(err)).toBe(false)
  })

  it('extracts field validation payload', () => {
    const err = new axios.AxiosError('failed', undefined, undefined, undefined, {
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: { errors: { field: ['message'] } },
    })

    expect(extractValidationErrors(err)).toEqual({ field: ['message'] })
  })
})

