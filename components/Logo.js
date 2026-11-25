export default function Logo({ size = 60, text = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 2C32 2 6 24 6 36a26 26 0 0 0 52 0C58 24 32 2 32 2Z" fill="#0B5C66"/>
        <path d="M17 28v20h11M34 48V28l7 10 7-10v20" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="53" cy="12" r="6" fill="#2BB3A8"/>
      </svg>
      {text && <span className="logo-text">Laboratorio <b>Lina Mendoza</b></span>}
    </span>
  );
}
