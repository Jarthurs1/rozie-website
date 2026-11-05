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

      <div className="field field--checkbox">
        <label className="field__checkbox-row">
          <input
            type="checkbox"
            name="smsOptIn"
            checked={Boolean(value.smsOptIn)}
            disabled={disabled}
            onChange={(e) => update('smsOptIn', e.target.checked)}
          />
          <span className="field__checkbox-label">
            Optional: I agree to receive appointment reminders by text message from
            Rozie&apos;s Salon Appointment Reminders (Development/Test). Message
            frequency varies (typically one reminder per appointment). Message and
            data rates may apply. Reply STOP to unsubscribe or HELP for assistance.
            Consent is not required to book an appointment.
          </span>
        </label>
        <p className="field__policy-links">
          <a
            href="https://main.d2oxpzhi8msliv.amplifyapp.com/sms-privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            SMS Privacy Policy
          </a>
          <span aria-hidden="true"> · </span>
          <a
            href="https://main.d2oxpzhi8msliv.amplifyapp.com/sms-terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            SMS Terms and Conditions
          </a>
        </p>
      </div>

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
