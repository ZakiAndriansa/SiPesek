import { Icon } from "../icon/Icon";

/** Area pilih file; input asli menutupi seluruh area. */
export function Upload({
  title,
  hint,
  accept,
  label,
}: {
  title: string;
  hint: string;
  accept: string;
  label: string;
}) {
  return (
    <label className="upload">
      <Icon name="upload" className="icon icon--lg upload__icon" />
      <span className="upload__title">{title}</span>
      <span className="upload__hint">{hint}</span>
      <input
        className="upload__input"
        type="file"
        accept={accept}
        aria-label={label}
      />
    </label>
  );
}
