/** Switch dengan status teks "Aktif / Nonaktif" agar tidak bergantung warna. */
export function Toggle({
  id,
  label,
  checked,
  disabled,
}: {
  /** Untuk membedakan toggle saat perubahannya ditangkap di elemen induk. */
  id?: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="toggle">
      <input
        className="toggle__input"
        id={id}
        type="checkbox"
        role="switch"
        defaultChecked={checked}
        disabled={disabled}
      />
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__thumb" />
      </span>
      <span className="toggle__text">
        <span className="toggle__label">{label}</span>
        <span className="toggle__state" aria-hidden="true">
          <span className="toggle__state-on">Aktif</span>
          <span className="toggle__state-off">Nonaktif</span>
        </span>
      </span>
    </label>
  );
}
