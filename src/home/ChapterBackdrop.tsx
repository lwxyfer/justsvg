import { useId } from 'react';

export function ChapterBackdrop({ kind }: { kind: 'skill' | 'editor' }) {
  const pattern = 'chapter-dots-' + useId().replace(/[^\w-]/g, '');
  return (
    <svg
      className="chapter-backdrop"
      viewBox="0 0 1600 1100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id={pattern} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#7e7a81" />
        </pattern>
      </defs>
      {kind === 'skill' ? (
        <>
          <circle cx="1640" cy="220" r="235" fill="#ffa5a3" />
          <circle cx="-20" cy="810" r="175" fill="#d6cbfc" />
          <circle cx="915" cy="1220" r="330" fill="#fed954" />
          <rect x="1360" y="290" width="38" height="38" fill="#fed954" />
          <rect x="1370" y="80" width="160" height="150" fill={`url(#${pattern})`} opacity=".5" />
        </>
      ) : (
        <>
          <rect x="1080" y="45" width="205" height="180" fill="#fed954" />
          <circle cx="1650" cy="370" r="190" fill="#ffed9c" />
          <circle cx="-50" cy="850" r="235" fill="#d6cbfc" />
          <rect x="380" y="890" width="34" height="34" fill="#fed954" />
          <rect x="1450" y="100" width="135" height="190" fill={`url(#${pattern})`} opacity=".5" />
          <path
            d="M1100 70V300M1060 220H1390M70 950H400"
            fill="none"
            stroke="#8b8da1"
            strokeDasharray="3 6"
            opacity=".23"
          />
        </>
      )}
    </svg>
  );
}
