import type { CanvasElement, PageMeta } from '@inkroom/shared';
import { computeStrokeOutline } from '../ink/freehand';
import { getSvgPathFromStroke } from '../ink/svg-path';

export function exportPageToSvg(
  elements: CanvasElement[],
  pageMeta?: PageMeta,
  options: { width?: number; height?: number } = {}
): string {
  const width = options.width ?? 1920;
  const height = options.height ?? 1080;

  let bgSvg = '';
  if (pageMeta?.background) {
    if (pageMeta.background.type === 'blank') {
      bgSvg = `<rect width="${width}" height="${height}" fill="${pageMeta.background.color}" />`;
    } else {
      bgSvg = `<rect width="${width}" height="${height}" fill="#FFFFFF" />`;
    }
  } else {
    bgSvg = `<rect width="${width}" height="${height}" fill="#FFFFFF" />`;
  }

  const elementsSvg = elements
    .map((el) => {
      switch (el.type) {
        case 'stroke': {
          const outline = computeStrokeOutline(el.points, { size: el.size });
          const pathD = getSvgPathFromStroke(outline);
          const opacityAttr = el.opacity < 1 ? ` opacity="${el.opacity}"` : '';
          return `<g transform="translate(${el.x}, ${el.y})"><path d="${pathD}" fill="${el.color}"${opacityAttr} /></g>`;
        }
        case 'shape': {
          const strokeAttr = `stroke="${el.stroke}" stroke-width="${el.strokeWidth}"`;
          const fillAttr = el.fill ? `fill="${el.fill}"` : 'fill="none"';
          const dashAttr =
            el.dash === 'dashed'
              ? ' stroke-dasharray="8 8"'
              : el.dash === 'dotted'
                ? ' stroke-dasharray="3 3"'
                : '';

          if (el.kind === 'rect') {
            return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" ${strokeAttr} ${fillAttr}${dashAttr} />`;
          }
          if (el.kind === 'ellipse') {
            const rx = Math.abs(el.width / 2);
            const ry = Math.abs(el.height / 2);
            const cx = el.x + rx;
            const cy = el.y + ry;
            return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${strokeAttr} ${fillAttr}${dashAttr} />`;
          }
          if (el.kind === 'line') {
            return `<line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" ${strokeAttr}${dashAttr} />`;
          }
          return '';
        }
        case 'text': {
          const fontAttr = `font-family="${el.fontFamily}" font-size="${el.fontSize}" fill="${el.color}"`;
          const weightAttr = el.bold ? ' font-weight="bold"' : '';
          const styleAttr = el.italic ? ' font-style="italic"' : '';
          return `<text x="${el.x}" y="${el.y + el.fontSize}" ${fontAttr}${weightAttr}${styleAttr}>${escapeXml(el.text)}</text>`;
        }
        default:
          return '';
      }
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${bgSvg}
  ${elementsSvg}
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
