// Registri dialog: tombol pemicu membuka dialog berdasarkan id, fokus kembali ke pemicu saat ditutup.
const dialogs = new Map<string, HTMLDialogElement>();
const triggers = new WeakMap<HTMLDialogElement, HTMLElement>();

export function registerDialog(id: string, el: HTMLDialogElement | null) {
  if (el) dialogs.set(id, el);
  else dialogs.delete(id);
}

export function openDialog(id: string, trigger: HTMLElement) {
  const dialog = dialogs.get(id);
  if (!dialog || typeof dialog.showModal !== "function") return;
  triggers.set(dialog, trigger);
  dialog.showModal();
}

export const triggerOf = (dialog: HTMLDialogElement) => triggers.get(dialog);
