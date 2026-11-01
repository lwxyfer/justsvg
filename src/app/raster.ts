export type RasterFormat = 'png' | 'jpeg' | 'webp';

/** Render an isolated static SVG, independent of editor zoom, grid and overlays. */
export async function rasterizeSvg(
  xml: string,
  width: number,
  height: number,
  format: RasterFormat,
  scale = 1,
) {
  const w = Math.round(width * scale),
    h = Math.round(height * scale);
  if (
    !Number.isFinite(w) ||
    !Number.isFinite(h) ||
    w < 1 ||
    h < 1 ||
    w > 16384 ||
    h > 16384 ||
    w * h > 64_000_000
  ) {
    throw new Error('图片尺寸超出限制，请降低导出倍率（最长边 16384 px，总计 6400 万像素）。');
  }
  const root = new DOMParser().parseFromString(xml, 'image/svg+xml').documentElement;
  root.setAttribute('width', String(width));
  root.setAttribute('height', String(height));
  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(root)], {
      type: 'image/svg+xml;charset=utf-8',
    }),
  );
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('SVG 图片渲染失败，请检查文档后重试。'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('浏览器无法创建图片画布。');
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(image, 0, 0, w, h);
    const type = `image/${format}`;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error('图片导出失败，请降低倍率后重试。'))),
        type,
        0.95,
      );
    });
    if (blob.type !== type)
      throw new Error(`浏览器不支持 ${format.toUpperCase()} 导出，请选择 PNG。`);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
