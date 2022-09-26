import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { ILocation, ELocationType, ILocItems, IZoomLocation, LOCATIONS } from "./locations";
import { Clipboard } from '@angular/cdk/clipboard';

export interface ILoc {
  x: number,
  y: number;
}

enum ELayerSize {
  LAYER_SIZE_2 = 2,
  LAYER_SIZE_4 = 4,
  LAYER_SIZE_8 = 8,
  LAYER_SIZE_16 = 16
}

enum EImageStatus {
  INIT,
  LOADING,
  LOADED,
}

const ORIGINAL_TILE_SIZE = 2048;
const ANIMATION_TIME = 200;

export type Icons = {
  [key in ELocationType]: HTMLImageElement;
}

type ILayers = {
  [key in ELayerSize]: IImageLoader[][];
}

const ZOOM_LEVEL_OFFSET = 4
const MAX_ZOOM_LEVEL = 10;
const MIN_ZOOM_LEVEL = 1;
const ZOOM_FACTOR = 1.5;

interface IImageLoader {
  image: HTMLImageElement;
  status: EImageStatus;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  prevCameraOffset: ILoc = { x: 0, y: 0 };
  nextCameraOffset: ILoc = { x: 0, y: 0 };
  prevZoomLevel: number = MIN_ZOOM_LEVEL;
  nextZoomLevel: number = this.prevZoomLevel;
  isDragging: boolean = false;
  dragStart: ILoc = { x: 0, y: 0 };
  update: boolean = true;
  layers: ILayers = {
    [ELayerSize.LAYER_SIZE_2]: [],
    [ELayerSize.LAYER_SIZE_8]: [],
    [ELayerSize.LAYER_SIZE_4]: [],
    [ELayerSize.LAYER_SIZE_16]: [],
  };
  startZoomTime: number = 0;
  cameraOffsetDeltaX: number = 0;
  cameraOffsetDeltaY: number = 0;
  cameraZoom: number = 0;
  layerSize: ELayerSize = ELayerSize.LAYER_SIZE_2;
  mapX: string = 'unknown';
  mapY: string = 'unknown';
  imgLoadingCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  icons: Icons = {
    [ELocationType.CITY]: new Image(),
    [ELocationType.TOWN]: new Image(),
    [ELocationType.FORT]: new Image(),
    [ELocationType.TELVANNI_TOWER]: new Image(),
    [ELocationType.VILLAGE]: new Image(),
    [ELocationType.CAMP]: new Image(),
    [ELocationType.STRONGHOLD]: new Image(),
  };

  constructor(
    private clipboard: Clipboard,
  ) { }

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    Object.values(ELayerSize).filter((v) => !isNaN(Number(v))).forEach(layerSize => {
      this.pushTileImages(layerSize as ELayerSize);
    });
    this.draw();

    // Draw location on top of visible tiles only
    this.imgLoadingCount.subscribe( {
      next: (count: number) => {
        if (count === 0) this.drawLocations();
      },
    });
  }

  private pushTileImages(size: ELayerSize) {
    for (let i = 0; i < size; i++) {
      this.layers[size].push([]);
      for (let j = 0; j < size; j++) {
        const image: HTMLImageElement = new Image();
        this.layers[size][i].push({ image, status: EImageStatus.INIT });
      }
    }
  }

  draw() {
    if (this.update) {
      const updateTime: number = Math.min(Date.now() - this.startZoomTime, ANIMATION_TIME);

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      this.nextCameraOffset.x = Math.floor(this.prevCameraOffset.x - this.cameraOffsetDeltaX * (updateTime/ANIMATION_TIME));
      this.nextCameraOffset.y = Math.floor(this.prevCameraOffset.y - this.cameraOffsetDeltaY * (updateTime/ANIMATION_TIME));

      this.ctx.translate(this.nextCameraOffset.x, this.nextCameraOffset.y);

      if (this.nextZoomLevel > 8) this.layerSize = ELayerSize.LAYER_SIZE_16;
      else if (this.nextZoomLevel > 6) this.layerSize = ELayerSize.LAYER_SIZE_8;
      else if (this.nextZoomLevel > 3) this.layerSize = ELayerSize.LAYER_SIZE_4;
      else this.layerSize = ELayerSize.LAYER_SIZE_2;

      const prevCameraZoom = 2 * Math.pow(ZOOM_FACTOR, this.prevZoomLevel - ZOOM_LEVEL_OFFSET)/this.layerSize;
      const nextCameraZoom = 2 * Math.pow(ZOOM_FACTOR, this.nextZoomLevel - ZOOM_LEVEL_OFFSET)/this.layerSize;
      this.cameraZoom = prevCameraZoom + (nextCameraZoom - prevCameraZoom) * (updateTime/ANIMATION_TIME);
      const tileSize = ORIGINAL_TILE_SIZE * this.cameraZoom;

      const minVisibleTileX = Math.max(Math.floor((0 - this.nextCameraOffset.x)/tileSize), 0);
      const minVisibleTileY = Math.max(Math.floor((0 - this.nextCameraOffset.y)/tileSize), 0);
      const maxVisibleTileX = Math.min(Math.floor((window.innerWidth - this.nextCameraOffset.x)/tileSize), this.layerSize - 1);
      const maxVisibleTileY = Math.min(Math.floor((window.innerHeight - this.nextCameraOffset.y)/tileSize), this.layerSize - 1);

      for (let tileX = minVisibleTileX; tileX <= maxVisibleTileX; tileX++) {
        for (let tileY = minVisibleTileY; tileY <= maxVisibleTileY; tileY++) {
          const imageLoader: IImageLoader = this.layers[this.layerSize][tileX][tileY];
          if (!imageLoader.image.src) imageLoader.image.src = `assets/${this.layerSize}/image-${tileX}-${tileY}.webp`;
          this.drawImageTile(imageLoader, tileX, tileY, tileSize);
        }
      }

      if (ANIMATION_TIME - updateTime <= 0) {
        this.prevZoomLevel = this.nextZoomLevel;
        this.startZoomTime = 0;
        this.prevCameraOffset.x = this.nextCameraOffset.x;
        this.prevCameraOffset.y = this.nextCameraOffset.y;
        this.cameraOffsetDeltaX = 0;
        this.cameraOffsetDeltaY = 0;
        this.update = false;
      }

      this.drawLocations();
    }

    requestAnimationFrame( () => this.draw() );
  }

  drawImageTile(imageLoader: IImageLoader, tileX: number, tileY: number, tileSize: number) {
    if (imageLoader.status === EImageStatus.LOADED) {
      this.ctx.drawImage(imageLoader.image, tileX * tileSize, tileY * tileSize, tileSize, tileSize);
    } else if (imageLoader.status === EImageStatus.INIT) {
      imageLoader.status = EImageStatus.LOADING;
      this.imgLoadingCount.next(this.imgLoadingCount.value + 1);
      imageLoader.image.onload = () => {
        imageLoader.status = EImageStatus.LOADED;
        this.ctx.drawImage(imageLoader.image, tileX * tileSize, tileY * tileSize, tileSize, tileSize);
        this.imgLoadingCount.next(this.imgLoadingCount.value - 1);
      }
    }
  }

  drawLocations() {
    const zoom: number = this.cameraZoom * this.layerSize;
    const startX: number = (0 - this.nextCameraOffset.x) / zoom;
    const startY: number = (0 - this.nextCameraOffset.y) / zoom;
    const endX: number = (window.innerWidth - this.nextCameraOffset.x) / zoom;
    const endY: number = (window.innerHeight - this.nextCameraOffset.y) / zoom;

    LOCATIONS.forEach((loc: ILocation) => {
      loc.zoomLocs.forEach((zoomLoc: IZoomLocation) => {
        const minZoom = zoomLoc.minZoom || MIN_ZOOM_LEVEL;
        const maxZoom = zoomLoc.maxZoom || MAX_ZOOM_LEVEL;
        if ((this.prevZoomLevel >= minZoom) && (this.prevZoomLevel <= maxZoom)) {
          zoomLoc.locItems.forEach((item: ILocItems) => {
            const { x, y, name } = item;
            if (x > startX && x < endX && y > startY && y < endY) {
              const icon: HTMLImageElement = this.icons[loc.type];
              if (!icon.src) icon.src = loc.src;
              this.drawImageIcon(icon, x * zoom - 8, y * zoom - 8);

              this.ctx.font = '16px MagicCards';
              this.drawLocationText(x * zoom, y * zoom, name);
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

  private drawLocationText(x_c: number, y_c: number, text: string) {
    const textWidth = this.ctx.measureText(text).width ;
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(x_c + 8,y_c - 8, textWidth + 6,16);
    this.ctx.fillStyle = '#e7db91';
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillText(text, x_c + 12, y_c + 5);
  }

  @HostListener('document:mousedown', ['$event'])
  onPointerDown(event: MouseEvent) {
    this.isDragging = true;
    this.dragStart.x = event.clientX - this.prevCameraOffset.x;
    this.dragStart.y = event.clientY - this.prevCameraOffset.y;
  }

  @HostListener('document:mouseup')
  onPointerUp() {
    this.isDragging = false;
  }

  @HostListener('document:mousemove',  ['$event'])
  onPointerMove(event: MouseEvent) {
    this.updateCursorLocation(event);
    if (this.isDragging) {
      this.prevCameraOffset.x = event.clientX - this.dragStart.x;
      this.prevCameraOffset.y = event.clientY - this.dragStart.y;
      this.update = true;
    }
  }

  @HostListener('document:wheel',  ['$event'])
  onScroll(event: WheelEvent) {
    if (this.startZoomTime > 0) {
      return;
    }

    this.nextZoomLevel = this.prevZoomLevel + Math.sign(-event.deltaY);
    if (this.nextZoomLevel > MAX_ZOOM_LEVEL || this.nextZoomLevel < MIN_ZOOM_LEVEL) {
      this.nextZoomLevel -= Math.sign(-event.deltaY);
      return;
    }

    this.startZoomTime = Date.now();

    const zoomDelta = Math.pow(ZOOM_FACTOR, Math.sign(-event.deltaY));
    const nextCameraOffsetX = Math.floor(event.clientX - (event.clientX - this.prevCameraOffset.x) * zoomDelta);
    const nextCameraOffsetY = Math.floor(event.clientY - (event.clientY - this.prevCameraOffset.y) * zoomDelta);

    this.cameraOffsetDeltaX = this.prevCameraOffset.x - nextCameraOffsetX;
    this.cameraOffsetDeltaY = this.prevCameraOffset.y - nextCameraOffsetY;

    this.update = true;
  }

  private updateCursorLocation(event: MouseEvent) {
    const zoom: number = this.cameraZoom * this.layerSize;
    this.mapX = ((event.clientX - this.prevCameraOffset.x) / zoom).toFixed(1);
    this.mapY = ((event.clientY - this.prevCameraOffset.y) / zoom).toFixed(1);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.update = true;
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.clipboard.copy(`x: ${this.mapX}, y: ${this.mapY}`);
  }
}
