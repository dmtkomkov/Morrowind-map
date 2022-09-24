import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import {BehaviorSubject} from "rxjs";

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

type ILayers = {
  [key in ELayerSize]: IImageLoader[][];
}

const MAX_ZOOM_LEVEL = 6;
const MIN_ZOOM_LEVEL = -3;
const ZOOM_FACTOR = 1.5;

const LOCATIONS = [
  { x: 1000, y: 1000, name: 'Some Town 1'},
  { x: 1110, y: 1050, name: 'Some Town 2'},
  { x: 1055.5, y: 968.6, name: 'The Temple'}
]

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
  cameraOffset: { x: number, y: number } = { x: 0, y: 0 };
  oldZoomLevel: number = MIN_ZOOM_LEVEL;
  isDragging: boolean = false;
  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  update: boolean = true;
  layers: ILayers = {
    [ELayerSize.LAYER_SIZE_2]: [],
    [ELayerSize.LAYER_SIZE_8]: [],
    [ELayerSize.LAYER_SIZE_4]: [],
    [ELayerSize.LAYER_SIZE_16]: [],
  };
  startZoomTime: number = 0;
  newZoomLevel: number = this.oldZoomLevel;
  cameraOffsetDeltaX: number = 0;
  cameraOffsetDeltaY: number = 0;
  cameraZoom: number = 0;
  cameraOffsetX: number = 0;
  cameraOffsetY: number = 0;
  layerSize: ELayerSize = ELayerSize.LAYER_SIZE_2;
  mapX: string = 'unknown';
  mapY: string = 'unknown';
  imgLoadingCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    Object.values(ELayerSize).filter((v) => !isNaN(Number(v))).forEach(layerSize => {
      this.pushImages(layerSize as number);
    })
    this.draw();

    // Draw location on top of visible tiles only
    this.imgLoadingCount.subscribe( {
      next: (count: number) => {
        if (count === 0) this.drawLocations();
      },
    });
  }

  private pushImages(size: ELayerSize) {
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

      this.cameraOffsetX = Math.floor(this.cameraOffset.x - this.cameraOffsetDeltaX * (updateTime/ANIMATION_TIME));
      this.cameraOffsetY = Math.floor(this.cameraOffset.y - this.cameraOffsetDeltaY * (updateTime/ANIMATION_TIME));

      this.ctx.translate(this.cameraOffsetX, this.cameraOffsetY);

      if (this.newZoomLevel > 4) this.layerSize = ELayerSize.LAYER_SIZE_16;
      else if (this.newZoomLevel > 2) this.layerSize = ELayerSize.LAYER_SIZE_8;
      else if (this.newZoomLevel > -1) this.layerSize = ELayerSize.LAYER_SIZE_4;
      else this.layerSize = ELayerSize.LAYER_SIZE_2;

      const oldCameraZoom = 2 * Math.pow(ZOOM_FACTOR, this.oldZoomLevel)/this.layerSize;
      const newCameraZoom = 2 * Math.pow(ZOOM_FACTOR, this.newZoomLevel)/this.layerSize;
      this.cameraZoom = oldCameraZoom + (newCameraZoom - oldCameraZoom) * (updateTime/ANIMATION_TIME);
      const tileSize = ORIGINAL_TILE_SIZE * this.cameraZoom;

      const minVisibleTileX = Math.max(Math.floor((0 - this.cameraOffsetX)/tileSize), 0);
      const minVisibleTileY = Math.max(Math.floor((0 - this.cameraOffsetY)/tileSize), 0);
      const maxVisibleTileX = Math.min(Math.floor((window.innerWidth - this.cameraOffsetX)/tileSize), this.layerSize - 1);
      const maxVisibleTileY = Math.min(Math.floor((window.innerHeight - this.cameraOffsetY)/tileSize), this.layerSize - 1);

      for (let tileX = minVisibleTileX; tileX <= maxVisibleTileX; tileX++) {
        for (let tileY = minVisibleTileY; tileY <= maxVisibleTileY; tileY++) {
          const imageLoader: IImageLoader = this.layers[this.layerSize][tileX][tileY];
          if (!imageLoader.image.src) imageLoader.image.src = `assets/${this.layerSize}/image-${tileX}-${tileY}.webp`;
          this.drawImageTile(imageLoader, tileX, tileY, tileSize);
        }
      }

      if (ANIMATION_TIME - updateTime <= 0) {
        this.oldZoomLevel = this.newZoomLevel;
        this.startZoomTime = 0;
        this.cameraOffset.x = this.cameraOffsetX;
        this.cameraOffset.y = this.cameraOffsetY;
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
    const startX: number = (0 - this.cameraOffsetX) / zoom;
    const startY: number = (0 - this.cameraOffsetY) / zoom;
    const endX: number = (window.innerWidth - this.cameraOffsetX) / zoom;
    const endY: number = (window.innerHeight - this.cameraOffsetY) / zoom;
    LOCATIONS.forEach((loc) => {
      const { x, y, name } = loc;
      if (x > startX && x < endX && y > startY && y < endY) {
        this.ctx.fillStyle = '#ffcf12';
        this.ctx.strokeStyle = '#ffcf12';
        this.ctx.font = '16px MagicCards';

        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.rect(x * zoom - 4, y * zoom - 4, 7, 7);
        this.ctx.stroke();

        const textWidth = this.ctx.measureText(name).width + 10 ;
        if (textWidth / zoom > endX - x) {
          this.ctx.fillText(name, x * zoom - textWidth, y * zoom + 4);
        } else {
          this.ctx.fillText(name, x * zoom + 10, y * zoom + 4);
        }
      }
    });
  }

  @HostListener('document:mousedown', ['$event'])
  onPointerDown(event: MouseEvent) {
    this.isDragging = true;
    this.dragStart.x = event.clientX - this.cameraOffset.x;
    this.dragStart.y = event.clientY - this.cameraOffset.y;
  }

  @HostListener('document:mouseup')
  onPointerUp() {
    this.isDragging = false;
  }

  @HostListener('document:mousemove',  ['$event'])
  onPointerMove(event: MouseEvent) {
    this.updateCursorLocation(event);
    if (this.isDragging) {
      this.cameraOffset.x = event.clientX - this.dragStart.x;
      this.cameraOffset.y = event.clientY - this.dragStart.y;
      this.update = true;
    }
  }

  @HostListener('document:wheel',  ['$event'])
  onScroll(event: WheelEvent) {
    if (this.startZoomTime > 0) {
      return;
    }

    this.newZoomLevel = this.oldZoomLevel + Math.sign(-event.deltaY);
    if (this.newZoomLevel > MAX_ZOOM_LEVEL || this.newZoomLevel < MIN_ZOOM_LEVEL) {
      this.newZoomLevel -= Math.sign(-event.deltaY);
      return;
    }

    this.startZoomTime = Date.now();

    const zoomDelta = Math.pow(ZOOM_FACTOR, Math.sign(-event.deltaY));
    const newCameraOffsetX = Math.floor(event.clientX - (event.clientX - this.cameraOffset.x) * zoomDelta);
    const newCameraOffsetY = Math.floor(event.clientY - (event.clientY - this.cameraOffset.y) * zoomDelta);

    this.cameraOffsetDeltaX = this.cameraOffset.x - newCameraOffsetX;
    this.cameraOffsetDeltaY = this.cameraOffset.y - newCameraOffsetY;

    this.update = true;
  }

  private updateCursorLocation(event: MouseEvent) {
    const zoom: number = this.cameraZoom * this.layerSize;
    this.mapX = ((event.clientX - this.cameraOffset.x) / zoom).toFixed(1);
    this.mapY = ((event.clientY - this.cameraOffset.y) / zoom).toFixed(1);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.update = true;
  }
}
