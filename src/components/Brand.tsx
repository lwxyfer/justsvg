import identity from '../assets/brand/identity.json';

/** Approved D + F identity: forward-leaning J inside the rounded badge. */
export function BrandMark({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={identity.mark.viewBox}
      fill="currentColor"
      className={`brand-mark ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
    >
      <path d={identity.mark.path} fillRule="evenodd" />
    </svg>
  );
}
export function BrandIdentity() {
  return (
    <>
      <BrandMark className="brand-compact" />
      <svg
        width="126"
        height="38"
        viewBox={identity.lockup.viewBox}
        className="brand-identity"
        fill="currentColor"
        role="img"
        aria-label="JustSVG"
        focusable="false"
      >
        <g className="brand-symbol" transform={identity.lockup.markTransform}>
          <path d={identity.mark.path} fillRule="evenodd" />
        </g>
        <path d={identity.wordmark.path} transform={identity.lockup.wordmarkTransform} />
      </svg>
    </>
  );
}
