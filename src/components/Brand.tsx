/** Native J-shaped route and two distinct nodes; source assets live in public/brand/. */
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M46 12V38C46 47.9 39.3 54 30 54S14 47.9 14 38"
        stroke="#2563eb"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="39" y="5" width="14" height="14" rx="3" fill="#19243b" />
      <circle cx="14" cy="38" r="7" fill="#19243b" />
    </svg>
  );
}
export function BrandIdentity() {
  return (
    <>
      <BrandMark />
      <strong>
        <span>Just</span>SVG
      </strong>
    </>
  );
}
