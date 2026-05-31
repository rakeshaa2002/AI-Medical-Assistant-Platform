import { useCallback, useState } from 'react'
import { validate } from '../utils/validators'

/**
 * Minimal form state manager with schema validation.
 *
 * const form = useForm(initialValues, schema)
 * <input name="email" value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} />
 * form.handleSubmit(async (values) => { ... })
 *
 * @param {Object} initialValues
 * @param {Object} schema  { field: [validatorFns] } from utils/validators
 */
export default function useForm(initialValues, schema = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const runValidation = useCallback(
    (vals) => (Object.keys(schema).length ? validate(vals, schema) : {}),
    [schema]
  )

  const handleChange = useCallback(
    (e) => {
      const { name, type, value, checked, files } = e.target
      const next = type === 'checkbox' ? checked : type === 'file' ? files[0] : value
      setValues((prev) => {
        const updated = { ...prev, [name]: next }
        // Re-validate the touched field live for instant feedback.
        setErrors(runValidation(updated))
        return updated
      })
    },
    [runValidation]
  )

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
  }, [])

  const setValue = useCallback(
    (name, value) =>
      setValues((prev) => {
        const updated = { ...prev, [name]: value }
        setErrors(runValidation(updated))
        return updated
      }),
    [runValidation]
  )

  const handleSubmit = useCallback(
    (onValid) => async (e) => {
      e?.preventDefault?.()
      const validationErrors = runValidation(values)
      setErrors(validationErrors)
      setTouched(Object.keys(schema).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
      if (Object.keys(validationErrors).length === 0) {
        await onValid(values)
      }
    },
    [values, schema, runValidation]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isValid = Object.keys(runValidation(values)).length === 0

  return { values, errors, touched, isValid, handleChange, handleBlur, handleSubmit, setValue, reset }
}
