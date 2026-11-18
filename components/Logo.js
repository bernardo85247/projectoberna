export default function Logo({ size = 40, text = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><path d="M32 5C32 5 12 27 12 40a20 20 0 0 0 40 0C52 27 32 5 32 5Z" fill="#0B5C66"/><path d="M15 41h10l4-9 6 17 4-8h10" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="14" r="5" fill="#2BB3A8"/></svg>
      {text && <span className="logo-text">Lab<b>Claro</b></span>}
    </span>
  );
}
