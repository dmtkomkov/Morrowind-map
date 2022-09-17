import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

enum ELayerSize {
  LAYER_SIZE_2 = 2,
  LAYER_SIZE_4 = 4,
  LAYER_SIZE_8 = 8,
  LAYER_SIZE_16 = 16
}

const ORIGINAL_TILE_SIZE = 2048;

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
  cameraOffset: { x: number, y: number } = { x: window.innerWidth/2 - 700, y: 0 };
  zoomLevel: number = -3;
  isDragging: boolean = false;
  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  update: boolean = true;
  layers: ILayers = {
    [ELayerSize.LAYER_SIZE_2]: [],
    [ELayerSize.LAYER_SIZE_8]: [],
    [ELayerSize.LAYER_SIZE_4]: [],
    [ELayerSize.LAYER_SIZE_16]: [],
  };
  layerSize: ELayerSize = ELayerSize.LAYER_SIZE_2;

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    Object.values(ELayerSize).filter((v) => !isNaN(Number(v))).forEach(layerSize => {
      this.pushImages(layerSize as number);
    })
    this.draw();
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
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx.translate( this.cameraOffset.x, this.cameraOffset.y);

      const cameraZoom = 2 * Math.pow(ZOOM_FACTOR, this.zoomLevel)/this.layerSize;
      const tileSize = Math.floor(ORIGINAL_TILE_SIZE * cameraZoom);

      const minVisibleTileX = Math.max(Math.floor((0 - this.cameraOffset.x)/tileSize), 0);
      const minVisibleTileY = Math.max(Math.floor((0 - this.cameraOffset.y)/tileSize), 0);
      const maxVisibleTileX = Math.min(Math.floor((window.innerWidth - this.cameraOffset.x)/tileSize), this.layerSize - 1);
      const maxVisibleTileY = Math.min(Math.floor((window.innerHeight - this.cameraOffset.y)/tileSize), this.layerSize - 1);

      for (let tileX = minVisibleTileX; tileX <= maxVisibleTileX; tileX++) {
        for (let tileY = minVisibleTileY; tileY <= maxVisibleTileY; tileY++) {
          const image = this.layers[this.layerSize][tileX][tileY];
          if (!image.src) image.src = `assets/${this.layerSize}/image-${tileX}-${tileY}.webp`;
          this.drawImageTile(image, tileX, tileY, tileSize);
        }
      }

      this.update = false;
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
    this.zoomLevel += Math.sign(-event.deltaY);
    if (this.zoomLevel > MAX_ZOOM_LEVEL || this.zoomLevel < MIN_ZOOM_LEVEL) {
      this.zoomLevel -= Math.sign(-event.deltaY);
      return;
    }

    if (this.zoomLevel > 4)         this.layerSize = ELayerSize.LAYER_SIZE_16;
    else if (this.zoomLevel > 2)    this.layerSize = ELayerSize.LAYER_SIZE_8;
    else if (this.zoomLevel > -1)   this.layerSize = ELayerSize.LAYER_SIZE_4;
    else                            this.layerSize = ELayerSize.LAYER_SIZE_2;

    const zoomDelta = Math.pow(ZOOM_FACTOR, Math.sign(-event.deltaY));
    this.cameraOffset.x = Math.floor(event.clientX - (event.clientX - this.cameraOffset.x) * zoomDelta);
    this.cameraOffset.y = Math.floor(event.clientY - (event.clientY - this.cameraOffset.y) * zoomDelta);

    this.update = true;
  }
}
