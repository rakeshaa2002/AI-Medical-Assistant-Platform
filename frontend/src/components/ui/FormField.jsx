import PasswordInput from './PasswordInput'

/**
 * Labelled input with inline validation error + accessibility wiring.
 * Pass `as="select"`/`as="textarea"` (with children/options) or `type="password"`
 * to render the matching control.
 */
export default function FormField({
  label,
  name,
  type = 'text',
  error,
  touched,
  as,
  options,
  children,
  className = '',
  ...props
}) {
  const showError = touched && error
  const describedBy = showError ? `${name}-error` : undefined
  const controlClass = `input ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`

  let control
  if (as === 'textarea') {
    control = <textarea id={name} name={name} className={controlClass} aria-describedby={describedBy} {...props} />
  } else if (as === 'select') {
    control = (
      <select id={name} name={name} className={controlClass} aria-describedby={describedBy} {...props}>
        {options
          ? options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))
          : children}
      </select>
    )
  } else if (type === 'password') {
    control = (
      <PasswordInput id={name} name={name} className={controlClass} aria-describedby={describedBy} {...props} />
    )
  } else {
    control = (
      <input id={name} name={name} type={type} className={controlClass} aria-describedby={describedBy} {...props} />
    )
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
        </label>
      )}
      {control}
      {showError && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
