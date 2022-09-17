import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

enum ELayerSize {
  LAYER_SIZE_2 = 2,
  LAYER_SIZE_4 = 4,
  LAYER_SIZE_8 = 8,
  LAYER_SIZE_16 = 16
}

const ORIGINAL_TILE_SIZE = 2048;
const ANIMATION_TIME = 200;

type ILayers = {
  [key in ELayerSize]: HTMLImageElement[][];
}

const MAX_ZOOM_LEVEL = 6;
const MIN_ZOOM_LEVEL = -3;
const ZOOM_FACTOR = 1.5;

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
  oldZoomLevel: number = -3;
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

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    Object.values(ELayerSize).filter((v) => !isNaN(Number(v))).forEach(layerSize => {
      this.pushImages(layerSize as number);
    })
    requestAnimationFrame( () => this.draw() );
  }

  private pushImages(size: ELayerSize) {
    for (let i = 0; i < size; i++) {
      this.layers[size].push([]);
      for (let j = 0; j < size; j++) {
        const image: HTMLImageElement = new Image();
        this.layers[size][i].push(image);
      }
    }
  }

  draw() {
    if (this.update) {
      const updateTime: number = Math.min(Date.now() - (this.startZoomTime || 0), ANIMATION_TIME);

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      const cameraOffsetX = Math.floor(this.cameraOffset.x - this.cameraOffsetDeltaX * (updateTime/ANIMATION_TIME));
      const cameraOffsetY = Math.floor(this.cameraOffset.y - this.cameraOffsetDeltaY * (updateTime/ANIMATION_TIME));

      this.ctx.translate(cameraOffsetX, cameraOffsetY);

      let layerSize: ELayerSize;
      if (this.newZoomLevel > 4) layerSize = ELayerSize.LAYER_SIZE_16;
      else if (this.newZoomLevel > 2) layerSize = ELayerSize.LAYER_SIZE_8;
      else if (this.newZoomLevel > -1) layerSize = ELayerSize.LAYER_SIZE_4;
      else layerSize = ELayerSize.LAYER_SIZE_2;

      const oldCameraZoom = 2 * Math.pow(ZOOM_FACTOR, this.oldZoomLevel)/layerSize;
      const newCameraZoom = 2 * Math.pow(ZOOM_FACTOR, this.newZoomLevel)/layerSize;
      const cameraZoom = oldCameraZoom + (newCameraZoom - oldCameraZoom) * (updateTime/ANIMATION_TIME);
      const tileSize = ORIGINAL_TILE_SIZE * cameraZoom;

      const minVisibleTileX = Math.max(Math.floor((0 - cameraOffsetX)/tileSize), 0);
      const minVisibleTileY = Math.max(Math.floor((0 - cameraOffsetY)/tileSize), 0);
      const maxVisibleTileX = Math.min(Math.floor((window.innerWidth - cameraOffsetX)/tileSize), layerSize - 1);
      const maxVisibleTileY = Math.min(Math.floor((window.innerHeight - cameraOffsetY)/tileSize), layerSize - 1);

      for (let tileX = minVisibleTileX; tileX <= maxVisibleTileX; tileX++) {
        for (let tileY = minVisibleTileY; tileY <= maxVisibleTileY; tileY++) {
          const image = this.layers[layerSize][tileX][tileY];
          if (!image.src) image.src = `assets/${layerSize}/image-${tileX}-${tileY}.webp`;
          this.drawImageTile(image, tileX, tileY, tileSize);
        }
      }

      if (!(ANIMATION_TIME - updateTime > 0)) {
        this.oldZoomLevel = this.newZoomLevel;
        this.startZoomTime = 0;
        this.cameraOffset.x = cameraOffsetX;
        this.cameraOffset.y = cameraOffsetY;
        this.cameraOffsetDeltaX = 0;
        this.cameraOffsetDeltaY = 0;
        this.update = false;
      }
    }

    requestAnimationFrame( () => this.draw() );
  }

  drawImageTile(image: HTMLImageElement, tileX: number, tileY: number, tileSize: number) {
    if (image.complete) {
      this.ctx.drawImage(image, tileX * tileSize, tileY * tileSize, tileSize, tileSize);
    } else {
      image.onload = () => {
        this.ctx.drawImage(image, tileX * tileSize, tileY * tileSize, tileSize, tileSize);
      }
    }
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

    const oldCameraOffsetX = this.cameraOffset.x;
    const oldCameraOffsetY = this.cameraOffset.y;

    const zoomDelta = Math.pow(ZOOM_FACTOR, Math.sign(-event.deltaY));
    const newCameraOffsetX = Math.floor(event.clientX - (event.clientX - this.cameraOffset.x) * zoomDelta);
    const newCameraOffsetY = Math.floor(event.clientY - (event.clientY - this.cameraOffset.y) * zoomDelta);

    this.cameraOffsetDeltaX = oldCameraOffsetX - newCameraOffsetX;
    this.cameraOffsetDeltaY = oldCameraOffsetY - newCameraOffsetY;

    this.update = true;
  }
}
