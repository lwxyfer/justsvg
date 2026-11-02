// Slim window title bar shown only when the installed desktop PWA runs with
// window-controls-overlay. Pure drag region; visibility is controlled in CSS.
export function TitleBar() {
  return (
    <div className="pwa-titlebar" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={14} height={14} />
      <span>JustSVG</span>
    </div>
  );
}
