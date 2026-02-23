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

  it('prefers field error over generic message on 422', () => {
    const err = new axios.AxiosError('failed', undefined, undefined, undefined, {
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: {
        message: 'Validation failed.',
        errors: { status: ['Future appointments cannot be marked as done or no_show.'] },
      },
    })

    expect(extractApiMessage(err, 'fallback')).toBe('Future appointments cannot be marked as done or no_show.')
  })

  it('falls back to message when 422 errors object is empty', () => {
    const err = new axios.AxiosError('failed', undefined, undefined, undefined, {
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: { message: 'Validation failed.', errors: {} },
    })

    expect(extractApiMessage(err, 'fallback')).toBe('Validation failed.')
  })

  it('does not prefer field errors for non-422 status codes', () => {
    const err = new axios.AxiosError('failed', undefined, undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: {
        message: 'Bad request.',
        errors: { field: ['Should not be returned.'] },
      },
    })

    expect(extractApiMessage(err, 'fallback')).toBe('Bad request.')
  })
})

