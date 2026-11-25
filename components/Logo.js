export default function Logo({ size = 40, text = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 5C32 5 12 27 12 40a20 20 0 0 0 40 0C52 27 32 5 32 5Z" fill="#0B5C66"/>
        <path d="M20 31v15h9M34 46V31l5.5 8L45 31v15" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="48" cy="14" r="5" fill="#2BB3A8"/>
      </svg>
      {text && <span className="logo-text">Laboratorio <b>Lina Mendoza</b></span>}
    </span>
  );
}
