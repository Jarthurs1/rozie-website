import './CustomerForm.css'

export default function CustomerForm({ value, errors, onChange, disabled }) {
  function update(field, next) {
    onChange({ ...value, [field]: next })
  }

  return (
    <div className={`customer-form${disabled ? ' is-disabled' : ''}`}>
      <div className="customer-form__row">
        <label className="field">
          <span className="field__label">First name *</span>
          <input
            className="field__input"
            name="firstName"
            autoComplete="given-name"
            value={value.firstName}
            disabled={disabled}
            onChange={(e) => update('firstName', e.target.value)}
            aria-invalid={Boolean(errors.firstName)}
          />
          {errors.firstName ? (
            <span className="field__hint">{errors.firstName}</span>
          ) : null}
        </label>
        <label className="field">
          <span className="field__label">Last name *</span>
          <input
            className="field__input"
            name="lastName"
            autoComplete="family-name"
            value={value.lastName}
            disabled={disabled}
            onChange={(e) => update('lastName', e.target.value)}
            aria-invalid={Boolean(errors.lastName)}
          />
          {errors.lastName ? (
            <span className="field__hint">{errors.lastName}</span>
          ) : null}
        </label>
      </div>

      <label className="field">
        <span className="field__label">Email *</span>
        <input
          className="field__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={value.email}
          disabled={disabled}
          onChange={(e) => update('email', e.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <span className="field__hint">{errors.email}</span>
        ) : null}
      </label>

      <label className="field">
        <span className="field__label">Phone *</span>
        <input
          className="field__input"
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          value={value.phone}
          disabled={disabled}
          onChange={(e) => update('phone', e.target.value)}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone ? (
          <span className="field__hint">{errors.phone}</span>
        ) : null}
      </label>

      <label className="field">
        <span className="field__label">Notes (optional)</span>
        <textarea
          className="field__input"
          name="notes"
          rows={3}
          placeholder="Preferences, allergies, etc."
          value={value.notes}
          disabled={disabled}
          onChange={(e) => update('notes', e.target.value)}
        />
      </label>
    </div>
  )
}
