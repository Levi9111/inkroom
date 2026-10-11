export type ID = string;

export type ElementType = 'stroke' | 'shape' | 'text' | 'image' | 'latex' | 'sticky';

export interface BaseElement {
  id: ID;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  z: string; // Fractional index for stacking order
  author: ID;
  createdAt: number;
  locked?: boolean;
}

export interface Stroke extends BaseElement {
  type: 'stroke';
  tool: 'pen' | 'highlighter';
  color: string;
  size: number;
  opacity: number;
  points: number[]; // Flat array [x, y, pressure, x, y, pressure, ...] relative to (x, y)
}

export type ShapeKind = 'rect' | 'ellipse' | 'diamond' | 'triangle' | 'line' | 'arrow';

export interface Shape extends BaseElement {
  type: 'shape';
  kind: ShapeKind;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill: string | null;
  dash: 'solid' | 'dashed' | 'dotted';
  points?: number[]; // For line / arrow
}

export interface TextEl extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'hand';
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  width: number;
}

export interface ImageEl extends BaseElement {
  type: 'image';
  assetId: ID;
  width: number;
  height: number;
  alt?: string;
  src?: string;
  url?: string;
  opacity?: number;
}

export type ImageElement = ImageEl;


export interface LatexEl extends BaseElement {
  type: 'latex';
  source: string;
  color: string;
  fontSize: number;
}

export interface StickyEl extends BaseElement {
  type: 'sticky';
  text: string;
  color: string;
  width: number;
  height: number;
}

export type CanvasElement = Stroke | Shape | TextEl | ImageEl | LatexEl | StickyEl;
