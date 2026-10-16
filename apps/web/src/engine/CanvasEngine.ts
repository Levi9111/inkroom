import Konva from 'konva';
import type { CanvasElement, Stroke, Shape, ShapeKind, PageBackground, ID } from '@inkroom/shared';
import type { AppTheme } from '../stores/uiStore';
import {
  computeStrokeOutline,
  getSvgPathFromStroke,
  simplifyStrokePoints,
  CanvasSpatialIndex,
  doesEraserIntersectStroke,
  doesEraserIntersectShape,
  doesEraserIntersectBox,
  computeElementBounds,
} from '@inkroom/core';

export interface CanvasEngineCallbacks {
  onCommitElement: (element: CanvasElement) => void;
  onDeleteElement: (id: ID) => void;
  onUpdateDraft?: (draft: { tool: string; color: string; size: number; points: number[] } | null) => void;
  onPointerMove?: (x: number, y: number) => void;
  onLaserTrail?: (points: number[]) => void;
  onSelectElement?: (element: CanvasElement | null) => void;
  onImagePaste?: (file: File) => void;
}

export class CanvasEngine {
  private container: HTMLDivElement;
  private stage: Konva.Stage;

  // 3-Layer Architecture
  private backgroundLayer: Konva.Layer;
  private staticLayer: Konva.Layer;
  private activeLayer: Konva.Layer;
  private uiLayer: Konva.Layer;

  // Active Drawing State
  private isDrawing = false;
  private activePoints: number[] = [];
  private activeTool: string = 'pen';
  private strokeColor = '#111827';
  private strokeWidth = 4;
  private shapeKind: ShapeKind = 'rect';
  private eraserRadius = 16;
  private eraserPreview: Konva.Circle | null = null;
  private lastEraserPos: { x: number; y: number } | null = null;
  private authorId = 'local';
  private isEraserActive = false;

  // Spatial Index for fast viewport culling
  private spatialIndex = new CanvasSpatialIndex();
  private elementMap = new Map<string, CanvasElement>();

  // Laser Pointer State
  private laserPoints: number[] = [];
  private laserTimer: ReturnType<typeof setInterval> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private cleanupImageHandlers: (() => void) | null = null;
  private currentBackground: PageBackground = { type: 'blank', color: '#FFFFFF' };
  private currentTheme: AppTheme = 'light';

  private callbacks: CanvasEngineCallbacks;

  constructor(container: HTMLDivElement, callbacks: CanvasEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.stage = new Konva.Stage({
      container,
      width,
      height,
      draggable: false, // Handled via custom pan/gesture
    });

    this.backgroundLayer = new Konva.Layer({ listening: false });
    this.staticLayer = new Konva.Layer({ listening: false });
    this.activeLayer = new Konva.Layer({ listening: false });
    this.uiLayer = new Konva.Layer({ listening: false });

    this.stage.add(this.backgroundLayer);
    this.stage.add(this.staticLayer);
    this.stage.add(this.activeLayer);
    this.stage.add(this.uiLayer);

    this.setupPointerEvents();
    this.setupResizeObserver();
    this.setupImageHandlers();
    this.drawBackground({ type: 'blank', color: '#FFFFFF' });
  }

  public setTool(tool: string, options?: { color?: string; width?: number; shapeKind?: ShapeKind }) {
    this.activeTool = tool;
    if (options?.color) this.strokeColor = options.color;
    if (options?.width) {
      this.strokeWidth = options.width;
      if (tool === 'eraser') {
        this.eraserRadius = Math.max(8, options.width / 2);
      }
    }
    if (options?.shapeKind) this.shapeKind = options.shapeKind;

    if (tool !== 'eraser' && this.eraserPreview) {
      this.eraserPreview.destroy();
      this.eraserPreview = null;
      this.uiLayer.batchDraw();
    }
  }

  public setAuthorId(id: string) {
    this.authorId = id;
  }

  public setElements(elements: CanvasElement[]) {
    this.elementMap.clear();
    this.spatialIndex.clear();
    for (const el of elements) {
      this.elementMap.set(el.id, el);
      this.spatialIndex.insert(el);
    }
    this.renderStaticElements();
  }

  public renderStaticElements() {
    this.staticLayer.destroyChildren();

    // Render sorted elements
    const elements = Array.from(this.elementMap.values()).sort((a, b) =>
      a.z > b.z ? 1 : a.z < b.z ? -1 : 0
    );

    for (const el of elements) {
      this.renderSingleElement(el, this.staticLayer);
    }

    this.staticLayer.batchDraw();
  }

  private renderSingleElement(el: CanvasElement, layer: Konva.Layer) {
    if (el.type === 'stroke') {
      const outline = computeStrokeOutline(el.points, { size: el.size });
      const pathD = getSvgPathFromStroke(outline);
      if (!pathD) return;

      const path = new Konva.Path({
        x: el.x,
        y: el.y,
        data: pathD,
        fill: el.color,
        opacity: el.opacity,
        listening: false,
      });
      layer.add(path);
    } else if (el.type === 'shape') {
      const strokeProps = {
        x: el.x,
        y: el.y,
        stroke: el.stroke,
        strokeWidth: el.strokeWidth,
        fill: el.fill || undefined,
        dash: el.dash === 'dashed' ? [8, 8] : el.dash === 'dotted' ? [3, 3] : undefined,
        listening: false,
      };

      if (el.kind === 'rect') {
        layer.add(new Konva.Rect({ ...strokeProps, width: el.width, height: el.height }));
      } else if (el.kind === 'ellipse') {
        layer.add(
          new Konva.Ellipse({
            ...strokeProps,
            x: el.x + el.width / 2,
            y: el.y + el.height / 2,
            radiusX: Math.abs(el.width / 2),
            radiusY: Math.abs(el.height / 2),
          })
        );
      } else if (el.kind === 'line') {
        layer.add(
          new Konva.Line({
            ...strokeProps,
            points: [0, 0, el.width, el.height],
          })
        );
      } else if (el.kind === 'arrow') {
        layer.add(
          new Konva.Arrow({
            ...strokeProps,
            points: [0, 0, el.width, el.height],
            pointerLength: 10,
            pointerWidth: 10,
          })
        );
      }
    } else if (el.type === 'text') {
      layer.add(
        new Konva.Text({
          x: el.x,
          y: el.y,
          text: el.text,
          fontSize: el.fontSize,
          fontFamily: el.fontFamily === 'mono' ? 'JetBrains Mono' : el.fontFamily === 'hand' ? 'Caveat' : 'Inter',
          fill: el.color,
          fontStyle: el.bold && el.italic ? 'italic bold' : el.bold ? 'bold' : el.italic ? 'italic' : 'normal',
          listening: false,
        })
      );
    } else if (el.type === 'image') {
      const imageUrl = (el as any).url || (el as any).src;
      if (imageUrl) {
        const imgObj = new window.Image();
        imgObj.crossOrigin = 'anonymous';
        imgObj.src = imageUrl;
        imgObj.onload = () => {
          layer.add(
            new Konva.Image({
              x: el.x,
              y: el.y,
              image: imgObj,
              width: el.width,
              height: el.height,
              rotation: el.rotation || 0,
              opacity: (el as any).opacity ?? 1,
              listening: false,
            })
          );
          layer.batchDraw();
        };
      }
    }
  }

  public drawBackground(background: PageBackground, theme: AppTheme = 'light') {
    this.currentBackground = background;
    this.currentTheme = theme;
    this.backgroundLayer.destroyChildren();
    const width = this.stage.width() * 4;
    const height = this.stage.height() * 4;

    const isDark = theme === 'dark';
    const isBlackboard = theme === 'blackboard';

    let bgFill = '#FFFFFF';
    if (isBlackboard) {
      bgFill = '#1B3B2B';
    } else if (isDark) {
      bgFill = background.type === 'blank' && background.color && background.color !== '#FFFFFF' ? background.color : '#0B0F19';
    } else {
      bgFill = background.type === 'blank' && background.color ? background.color : '#FFFFFF';
    }

    const bgRect = new Konva.Rect({
      x: -width / 2,
      y: -height / 2,
      width: width * 2,
      height: height * 2,
      fill: bgFill,
    });
    this.backgroundLayer.add(bgRect);

    const gridLineColor = isBlackboard
      ? 'rgba(255, 255, 255, 0.12)'
      : isDark
      ? 'rgba(255, 255, 255, 0.10)'
      : 'rgba(15, 23, 42, 0.08)';

    if (background.type === 'grid' || background.type === 'graph') {
      const spacing = background.spacing || 30;
      const gridGroup = new Konva.Group();

      for (let x = -width; x <= width; x += spacing) {
        gridGroup.add(new Konva.Line({ points: [x, -height, x, height], stroke: gridLineColor, strokeWidth: 1 }));
      }
      for (let y = -height; y <= height; y += spacing) {
        gridGroup.add(new Konva.Line({ points: [-width, y, width, y], stroke: gridLineColor, strokeWidth: 1 }));
      }
      this.backgroundLayer.add(gridGroup);
    } else if (background.type === 'lined') {
      const spacing = background.spacing || 32;
      const linedGroup = new Konva.Group();
      for (let y = -height; y <= height; y += spacing) {
        linedGroup.add(new Konva.Line({ points: [-width, y, width, y], stroke: gridLineColor, strokeWidth: 1 }));
      }
      this.backgroundLayer.add(linedGroup);
    }

    this.backgroundLayer.batchDraw();
  }

  private setupPointerEvents() {
    const el = this.stage.container();

    el.addEventListener('pointerdown', (e: PointerEvent) => {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}

      // Palm rejection: ignore touch events when stylus was active
      if (e.pointerType === 'touch' && e.pressure === 0 && (this.activeTool === 'pen' || this.activeTool === 'highlighter')) {
        // Allow touch scrolling if not explicitly finger drawing
      }

      const stagePos = this.getPointerWorldPosition(e);
      this.handlePointerDown(stagePos.x, stagePos.y, e.pressure || 0.5, e);
    });

    el.addEventListener('pointermove', (e: PointerEvent) => {
      const stagePos = this.getPointerWorldPosition(e);
      this.callbacks.onPointerMove?.(stagePos.x, stagePos.y);

      // Interactive visual eraser feedback
      this.updateEraserCursor(stagePos.x, stagePos.y);

      // Support coalesced events for high-fidelity stylus input
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of events) {
        const p = this.getPointerWorldPosition(ev);
        this.handlePointerMove(p.x, p.y, ev.pressure || 0.5);
      }
    });

    const endHandler = (e: PointerEvent) => {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
      this.handlePointerUp();
    };
    el.addEventListener('pointerup', endHandler);
    el.addEventListener('pointerleave', (e: PointerEvent) => {
      endHandler(e);
      if (this.eraserPreview) {
        this.eraserPreview.destroy();
        this.eraserPreview = null;
        this.uiLayer.batchDraw();
      }
    });
    el.addEventListener('pointercancel', endHandler);

    // Mouse wheel pan & zoom
    el.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const zoomFactor = 1.05;
        const oldScale = this.stage.scaleX();
        const pointer = this.stage.getPointerPosition() || { x: this.stage.width() / 2, y: this.stage.height() / 2 };

        const mousePointTo = {
          x: (pointer.x - this.stage.x()) / oldScale,
          y: (pointer.y - this.stage.y()) / oldScale,
        };

        const newScale = e.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
        const clampedScale = Math.max(0.1, Math.min(8, newScale));

        this.stage.scale({ x: clampedScale, y: clampedScale });
        this.stage.position({
          x: pointer.x - mousePointTo.x * clampedScale,
          y: pointer.y - mousePointTo.y * clampedScale,
        });
        this.stage.batchDraw();
      } else {
        // Pan
        this.stage.x(this.stage.x() - e.deltaX);
        this.stage.y(this.stage.y() - e.deltaY);
        this.stage.batchDraw();
      }
    }, { passive: false });
  }

  private getPointerWorldPosition(e: MouseEvent | PointerEvent) {
    const rect = this.container.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const transform = this.stage.getAbsoluteTransform().copy().invert();
    return transform.point({ x: screenX, y: screenY });
  }

  private handlePointerDown(x: number, y: number, pressure: number, e: PointerEvent) {
    this.isDrawing = true;

    if (this.activeTool === 'pen' || this.activeTool === 'highlighter') {
      this.activePoints = [0, 0, pressure]; // relative to origin (x, y)
      this.activeLayer.destroyChildren();

      // Set starting position
      this.activeLayer.position({ x, y });
    } else if (this.activeTool === 'eraser') {
      this.isEraserActive = true;
      this.lastEraserPos = { x, y };
      this.eraseAtPoint(x, y);
    } else if (this.activeTool === 'laser') {
      this.laserPoints = [x, y];
      this.renderLaserTrail();
    } else if (this.activeTool === 'shape') {
      this.activePoints = [x, y, x, y];
    }
  }

  private handlePointerMove(x: number, y: number, pressure: number) {
    if (!this.isDrawing) return;

    if (this.activeTool === 'pen' || this.activeTool === 'highlighter') {
      const origin = this.activeLayer.position();
      const relX = x - origin.x;
      const relY = y - origin.y;
      this.activePoints.push(relX, relY, pressure);

      // Fast live-ink rendering on Active Layer only
      this.activeLayer.destroyChildren();
      const outline = computeStrokeOutline(this.activePoints, {
        size: this.strokeWidth,
        simulatePressure: pressure === 0.5,
      });
      const pathD = getSvgPathFromStroke(outline);
      if (pathD) {
        this.activeLayer.add(
          new Konva.Path({
            data: pathD,
            fill: this.strokeColor,
            opacity: this.activeTool === 'highlighter' ? 0.35 : 1,
            listening: false,
          })
        );
        this.activeLayer.batchDraw();
      }

      this.callbacks.onUpdateDraft?.({
        tool: this.activeTool,
        color: this.strokeColor,
        size: this.strokeWidth,
        points: this.activePoints,
      });
    } else if (this.activeTool === 'eraser') {
      if (this.lastEraserPos) {
        this.eraseAlongSegment(this.lastEraserPos.x, this.lastEraserPos.y, x, y);
      } else {
        this.eraseAtPoint(x, y);
      }
      this.lastEraserPos = { x, y };
    } else if (this.activeTool === 'laser') {
      this.laserPoints.push(x, y);
      if (this.laserPoints.length > 60) this.laserPoints.splice(0, 2);
      this.renderLaserTrail();
    } else if (this.activeTool === 'shape') {
      // Shape drag preview
      this.activePoints[2] = x;
      this.activePoints[3] = y;
      this.activeLayer.destroyChildren();

      const startX = this.activePoints[0];
      const startY = this.activePoints[1];
      const w = x - startX;
      const h = y - startY;

      const shapeProps = {
        stroke: this.strokeColor,
        strokeWidth: this.strokeWidth,
        fill: undefined,
        listening: false,
      };

      if (this.shapeKind === 'rect') {
        this.activeLayer.add(new Konva.Rect({ x: startX, y: startY, width: w, height: h, ...shapeProps }));
      } else if (this.shapeKind === 'ellipse') {
        this.activeLayer.add(
          new Konva.Ellipse({
            x: startX + w / 2,
            y: startY + h / 2,
            radiusX: Math.abs(w / 2),
            radiusY: Math.abs(h / 2),
            ...shapeProps,
          })
        );
      } else if (this.shapeKind === 'line') {
        this.activeLayer.add(new Konva.Line({ points: [startX, startY, x, y], ...shapeProps }));
      } else if (this.shapeKind === 'arrow') {
        this.activeLayer.add(
          new Konva.Arrow({
            points: [startX, startY, x, y],
            pointerLength: 10,
            pointerWidth: 10,
            ...shapeProps,
          })
        );
      }
      this.activeLayer.batchDraw();
    }
  }

  private handlePointerUp() {
    this.lastEraserPos = null;
    this.isEraserActive = false;
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.callbacks.onUpdateDraft?.(null);

    if (this.activeTool === 'pen' || this.activeTool === 'highlighter') {
      if (this.activePoints.length === 3) {
        // Synthesize small offset for single dot/tap
        this.activePoints.push(0.5, 0.5, this.activePoints[2]);
      }

      if (this.activePoints.length >= 6) {
        const origin = this.activeLayer.position();
        // Simplify stroke points (Ramer-Douglas-Peucker) only if more than 2 points
        const simplified = this.activePoints.length > 6 ? simplifyStrokePoints(this.activePoints, 0.8) : this.activePoints;

        const newStroke: Stroke = {
          id: 's_' + Math.random().toString(36).substring(2, 11),
          type: 'stroke',
          tool: this.activeTool as 'pen' | 'highlighter',
          color: this.strokeColor,
          size: this.strokeWidth,
          opacity: this.activeTool === 'highlighter' ? 0.35 : 1,
          x: origin.x,
          y: origin.y,
          rotation: 0,
          z: 'a' + Date.now().toString(36),
          author: this.authorId,
          createdAt: Date.now(),
          points: simplified,
        };

        this.callbacks.onCommitElement(newStroke);
      }
      this.activeLayer.destroyChildren();
      this.activeLayer.batchDraw();
    } else if (this.activeTool === 'shape') {
      const startX = this.activePoints[0];
      const startY = this.activePoints[1];
      const endX = this.activePoints[2];
      const endY = this.activePoints[3];

      const w = endX - startX;
      const h = endY - startY;

      if (Math.abs(w) > 4 || Math.abs(h) > 4) {
        const newShape: Shape = {
          id: 'sh_' + Math.random().toString(36).substring(2, 11),
          type: 'shape',
          kind: this.shapeKind,
          x: startX,
          y: startY,
          width: w,
          height: h,
          stroke: this.strokeColor,
          strokeWidth: this.strokeWidth,
          fill: null,
          dash: 'solid',
          rotation: 0,
          z: 'a' + Date.now().toString(36),
          author: this.authorId,
          createdAt: Date.now(),
        };

        this.callbacks.onCommitElement(newShape);
      }
      this.activeLayer.destroyChildren();
      this.activeLayer.batchDraw();
    } else if (this.activeTool === 'laser') {
      // Fade out laser trail
      if (this.laserTimer) {
        clearInterval(this.laserTimer);
        this.laserTimer = null;
      }
      this.laserTimer = setInterval(() => {
        if (this.laserPoints.length <= 2) {
          this.laserPoints = [];
          this.uiLayer.destroyChildren();
          this.uiLayer.batchDraw();
          if (this.laserTimer) {
            clearInterval(this.laserTimer);
            this.laserTimer = null;
          }
        } else {
          this.laserPoints.splice(0, 4);
          this.renderLaserTrail();
        }
      }, 30);
    }

  }

  private updateEraserCursor(x: number, y: number) {
    if (this.activeTool !== 'eraser') {
      if (this.eraserPreview) {
        this.eraserPreview.destroy();
        this.eraserPreview = null;
        this.uiLayer.batchDraw();
      }
      return;
    }

    if (!this.eraserPreview) {
      this.eraserPreview = new Konva.Circle({
        radius: this.eraserRadius,
        stroke: '#6366F1',
        strokeWidth: 1.5,
        fill: 'rgba(99, 102, 241, 0.15)',
        dash: [4, 4],
        listening: false,
      });
      this.uiLayer.add(this.eraserPreview);
    }

    this.eraserPreview.position({ x, y });
    this.eraserPreview.radius(this.eraserRadius);
    this.uiLayer.batchDraw();
  }

  private eraseAlongSegment(x1: number, y1: number, x2: number, y2: number) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(4, this.eraserRadius * 0.5);
    const steps = Math.ceil(dist / step);
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const sx = x1 + t * (x2 - x1);
      const sy = y1 + t * (y2 - y1);
      this.eraseAtPoint(sx, sy);
    }
  }

  private eraseAtPoint(x: number, y: number) {
    const candidateIds = this.spatialIndex.queryPoint(x, y, this.eraserRadius);
    const toDelete: string[] = [];

    for (const id of candidateIds) {
      const el = this.elementMap.get(id);
      if (!el) continue;

      if (el.type === 'stroke') {
        const intersects = doesEraserIntersectStroke(
          { x, y, radius: this.eraserRadius },
          { x: el.x, y: el.y },
          el.points,
          el.size
        );
        if (intersects) {
          toDelete.push(id);
        }
      } else if (el.type === 'shape') {
        if (doesEraserIntersectShape({ x, y, radius: this.eraserRadius }, el)) {
          toDelete.push(id);
        }
      } else {
        const bounds = computeElementBounds(el);
        if (doesEraserIntersectBox({ x, y, radius: this.eraserRadius }, bounds)) {
          toDelete.push(id);
        }
      }
    }

    if (toDelete.length > 0) {
      for (const id of toDelete) {
        this.elementMap.delete(id);
        this.spatialIndex.remove(id);
        this.callbacks.onDeleteElement(id);
      }
      this.renderStaticElements();
    }
  }

  private renderLaserTrail() {
    this.uiLayer.destroyChildren();
    if (this.laserPoints.length >= 4) {
      const laserLine = new Konva.Line({
        points: this.laserPoints,
        stroke: '#EF4444',
        strokeWidth: 6,
        lineCap: 'round',
        lineJoin: 'round',
        shadowColor: '#EF4444',
        shadowBlur: 10,
        opacity: 0.8,
        listening: false,
      });
      this.uiLayer.add(laserLine);
    }
    this.uiLayer.batchDraw();
  }

  public renderRemoteCursor(userId: string, name: string, color: string, x: number, y: number) {
    // Look up or update remote cursor in uiLayer
    let cursorGroup = this.uiLayer.findOne<Konva.Group>(`#cursor_${userId}`);
    if (!cursorGroup) {
      cursorGroup = new Konva.Group({ id: `cursor_${userId}`, listening: false });
      // Arrow indicator
      const arrow = new Konva.Arrow({
        points: [0, 0, 12, 12],
        pointerLength: 8,
        pointerWidth: 8,
        fill: color,
        stroke: '#FFFFFF',
        strokeWidth: 1.5,
      });
      // Label pill
      const label = new Konva.Label({ x: 12, y: 14 });
      label.add(new Konva.Tag({ fill: color, cornerRadius: 4 }));
      label.add(new Konva.Text({ text: name, fill: '#FFFFFF', fontSize: 11, padding: 4, fontFamily: 'Inter' }));

      cursorGroup.add(arrow);
      cursorGroup.add(label);
      this.uiLayer.add(cursorGroup);
    }

    cursorGroup.position({ x, y });
    this.uiLayer.batchDraw();
  }

  public removeRemoteCursor(userId: string) {
    const cursor = this.uiLayer.findOne(`#cursor_${userId}`);
    if (cursor) {
      cursor.destroy();
      this.uiLayer.batchDraw();
    }
  }

  public setZoom(zoom: number) {
    this.stage.scale({ x: zoom, y: zoom });
    this.stage.batchDraw();
  }

  public setPan(x: number, y: number) {
    this.stage.position({ x, y });
    this.stage.batchDraw();
  }

  public toDataURL(mimeType = 'image/png'): string {
    return this.stage.toDataURL({ mimeType, pixelRatio: 2 });
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w > 0 && h > 0) {
        this.stage.width(w);
        this.stage.height(h);
        this.drawBackground(this.currentBackground, this.currentTheme);
        this.stage.batchDraw();
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private setupImageHandlers() {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            this.callbacks.onImagePaste?.(file);
          }
        }
      }
    };

    const container = this.container;
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          this.callbacks.onImagePaste?.(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    this.cleanupImageHandlers = () => {
      window.removeEventListener('paste', handlePaste);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }

  public destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.laserTimer) {
      clearInterval(this.laserTimer);
      this.laserTimer = null;
    }
    if (this.cleanupImageHandlers) {
      this.cleanupImageHandlers();
      this.cleanupImageHandlers = null;
    }
    this.stage.destroy();
  }
}

