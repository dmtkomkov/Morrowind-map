import { ElementRef, Injectable } from '@angular/core';
import { ELocationType, ILocation, ILocItem, IZoomLocation, LOCATIONS } from "./locations";
import { BehaviorSubject } from "rxjs";
import {
  DEFAULT_ICONS,
  DEFAULT_LAYERS,
  DEFAULT_OFFSET,
  ELayerSize,
  ILoc,
  MAX_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
  ZOOM_FACTOR,
  ZOOM_LEVEL_OFFSET
} from "./app.const";

const ORIGINAL_TILE_SIZE = 2048;

export type Icons = {
  [key in ELocationType]: HTMLImageElement;
}

type ILayers = {
  [key in ELayerSize]: HTMLImageElement[][];
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private layerSize: ELayerSize = ELayerSize.LAYER_SIZE_2;
  cameraZoom: number = 0;
  cameraOffset: ILoc = { ...DEFAULT_OFFSET };
  private layers: ILayers = { ...DEFAULT_LAYERS };
  private icons: Icons = { ...DEFAULT_ICONS };
  imgLoadingCount: BehaviorSubject<number> = new BehaviorSubject<number>(0); // TODO: calculate max number
  x: string = 'unknown';
  y: string = 'unknown';

  constructor() { }

  initInCanvas(canvasRef: ElementRef<HTMLCanvasElement>) {
    this.canvas = canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    Object.values(ELayerSize).filter((v) => !isNaN(Number(v))).forEach(layerSize => {
      this.pushTileImages(layerSize as ELayerSize);
    });
  }

  private pushTileImages(size: ELayerSize) {
    for (let i = 0; i < size; i++) {
      this.layers[size].push([]);
      for (let j = 0; j < size; j++) {
        this.layers[size][i].push(new Image());
      }
    }
  }

  setLayerSize(zoomLevel: number): void {
    if (zoomLevel > 8) this.layerSize = ELayerSize.LAYER_SIZE_16;
    else if (zoomLevel > 6) this.layerSize = ELayerSize.LAYER_SIZE_8;
    else if (zoomLevel > 3) this.layerSize = ELayerSize.LAYER_SIZE_4;
    else this.layerSize = ELayerSize.LAYER_SIZE_2;
  }

  setCameraOffset(prevCameraOffset: ILoc, nextCameraOffset: ILoc, inc: number) {
    this.cameraOffset.x = prevCameraOffset.x + (nextCameraOffset.x - prevCameraOffset.x) * inc;
    this.cameraOffset.y = prevCameraOffset.y + (nextCameraOffset.y - prevCameraOffset.y) * inc;
    this.ctx.translate(this.cameraOffset.x, this.cameraOffset.y);
  }

  setCameraZoom(prevZoomLevel: number, nextZoomLevel: number, inc: number) {
    const prevCameraZoom = 2 * Math.pow(ZOOM_FACTOR, prevZoomLevel - ZOOM_LEVEL_OFFSET)/this.layerSize;
    const nextCameraZoom = 2 * Math.pow(ZOOM_FACTOR, nextZoomLevel - ZOOM_LEVEL_OFFSET)/this.layerSize;
    this.cameraZoom = prevCameraZoom + (nextCameraZoom - prevCameraZoom) * inc;
  }

  drawImageTiles() {
    const tileSize = ORIGINAL_TILE_SIZE * this.cameraZoom;
    const minVisibleTileX = Math.max(Math.floor((0 - this.cameraOffset.x)/tileSize), 0);
    const minVisibleTileY = Math.max(Math.floor((0 - this.cameraOffset.y)/tileSize), 0);
    const maxVisibleTileX = Math.min(Math.floor((window.innerWidth - this.cameraOffset.x)/tileSize), this.layerSize - 1);
    const maxVisibleTileY = Math.min(Math.floor((window.innerHeight - this.cameraOffset.y)/tileSize), this.layerSize - 1);

    for (let tileX = minVisibleTileX; tileX <= maxVisibleTileX; tileX++) {
      for (let tileY = minVisibleTileY; tileY <= maxVisibleTileY; tileY++) {
        const image: HTMLImageElement = this.layers[this.layerSize][tileX][tileY];
        this.drawImageTile(image, tileX, tileY, tileSize);
      }
    }
  }

  private drawImageTile(image: HTMLImageElement, tileX: number, tileY: number, tileSize: number) {
    if (image.src && image.complete) {
      this.ctx.drawImage(image, tileX * tileSize, tileY * tileSize, tileSize, tileSize);
    } else if (!image.src) {
      image.src = `assets/${this.layerSize}/image-${tileX}-${tileY}.webp`;
      this.imgLoadingCount.next(this.imgLoadingCount.value + 1);
      image.onload = () => {
        this.ctx.drawImage(image, tileX * tileSize, tileY * tileSize, tileSize, tileSize);
        this.imgLoadingCount.next(this.imgLoadingCount.value - 1);
      }
    }
  }

  drawLocations(zoomLevel: number) {
    const zoom: number = this.cameraZoom * this.layerSize;
    const startX: number = (0 - this.cameraOffset.x) / zoom;
    const startY: number = (0 - this.cameraOffset.y) / zoom;
    const endX: number = (window.innerWidth - this.cameraOffset.x) / zoom;
    const endY: number = (window.innerHeight - this.cameraOffset.y) / zoom;

    // this.arc = new Path2D();
    // this.arc.arc(1000 * zoom, 1000 * zoom, 2 * zoom, 0, 2 * Math.PI);
    // this.ctx.stroke(this.arc);

    LOCATIONS.forEach((loc: ILocation) => {
      loc.zoomLocs.forEach((zoomLoc: IZoomLocation) => {
        const minZoom = zoomLoc.minZoom || MIN_ZOOM_LEVEL;
        const maxZoom = zoomLoc.maxZoom || MAX_ZOOM_LEVEL;
        if ((zoomLevel >= minZoom) && (zoomLevel <= maxZoom)) {
          zoomLoc.locItems.forEach((item: ILocItem) => {
            const { x, y, name } = item;
            if (x > startX && x < endX && y > startY && y < endY) {
              const icon: HTMLImageElement = this.icons[loc.type];
              if (!icon.src) icon.src = loc.src;
              this.drawImageIcon(icon, x * zoom - 8, y * zoom - 8);

              this.ctx.font = '16px MagicCards';
              this.drawLocationText(x * zoom + 8, y * zoom - 8, name);
            }
          });
        }
      });
    });
  }

  private drawImageIcon(icon: HTMLImageElement, x: number, y: number) {
    if (icon.complete) {
      this.ctx.drawImage(icon, x, y, 16, 16);
    } else {
      icon.onload = () => {
        this.ctx.drawImage(icon, x, y, 16, 16);
      }
    }
  }

  private drawLocationText(x: number, y: number, text: string) {
    const textWidth = this.ctx.measureText(text).width ;
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(x, y, textWidth + 6,16);
    this.ctx.fillStyle = '#e7db91';
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillText(text, x + 4, y + 13);
  }

  updateCursorLocation(event: MouseEvent) {
    const zoom: number = this.cameraZoom * this.layerSize;
    this.x = ((event.clientX - this.cameraOffset.x) / zoom).toFixed(1);
    this.y = ((event.clientY - this.cameraOffset.y) / zoom).toFixed(1);
  }

  clean() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}
