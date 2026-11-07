/** IST time formatting without relying on Intl time-zone support in Hermes. */
const IST_OFFSET_MS = 330 * 60_000;

export function fmtTime(d: Date): string {
  const t = new Date(d.getTime() + IST_OFFSET_MS);
  let h = t.getUTCHours();
  const m = t.getUTCMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}
