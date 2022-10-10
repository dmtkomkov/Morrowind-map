import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MapService } from "./map.service";

export interface ILoc {
  x: number,
  y: number;
}

const ANIMATION_TIME = 200;

const ZOOM_LEVEL_OFFSET = 4
const MAX_ZOOM_LEVEL = 10;
const MIN_ZOOM_LEVEL = 1;
const ZOOM_FACTOR = 1.5;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;

  prevCameraOffset: ILoc = { x: 0, y: -120 };
  nextCameraOffset: ILoc = { x: 0, y: -120 };
  prevZoomLevel: number = MIN_ZOOM_LEVEL;
  nextZoomLevel: number = this.prevZoomLevel;
  isDragging: boolean = false;
  dragStart: ILoc = { x: 0, y: 0 };
  update: boolean = true;
  startZoomTime: number = 0;
  cameraOffsetDelta: ILoc = { x: 0, y: 0 };


  constructor(
    private clipboard: Clipboard,
    private map: MapService,
  ) { }

  ngOnInit(): void {
    this.map.initInCanvas(this.canvasRef);
    this.draw();

    // Draw location on top of visible tiles only
    this.map.imgLoadingCount.subscribe( {
      next: (count: number) => {
        if (count === 0) this.map.drawLocations(this.nextCameraOffset.x, this.nextCameraOffset.y, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, this.prevZoomLevel);
      },
    });
  }

  draw() {
    if (this.update) {
      const updateTime: number = Math.min(Date.now() - this.startZoomTime, ANIMATION_TIME);

      this.map.clean();
      this.map.setLayerSize(this.nextZoomLevel);

      const inc = updateTime/ANIMATION_TIME;
      this.nextCameraOffset.x = Math.floor(this.prevCameraOffset.x - this.cameraOffsetDelta.x * inc);
      this.nextCameraOffset.y = Math.floor(this.prevCameraOffset.y - this.cameraOffsetDelta.y * inc);
      this.map.setCameraOffset(this.nextCameraOffset.x, this.nextCameraOffset.y);
      this.map.setCameraZoom(this.prevZoomLevel - ZOOM_LEVEL_OFFSET, this.nextZoomLevel - ZOOM_LEVEL_OFFSET, ZOOM_FACTOR, inc);
      this.map.drawImageTiles(this.nextCameraOffset.x, this.nextCameraOffset.y);

      if (ANIMATION_TIME - updateTime <= 0) {
        this.prevZoomLevel = this.nextZoomLevel;
        this.startZoomTime = 0;
        this.prevCameraOffset.x = this.nextCameraOffset.x;
        this.prevCameraOffset.y = this.nextCameraOffset.y;
        this.cameraOffsetDelta.x = 0;
        this.cameraOffsetDelta.y = 0;
        this.update = false;
      }

      this.map.drawLocations(this.nextCameraOffset.x, this.nextCameraOffset.y, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, this.prevZoomLevel);
    }

    requestAnimationFrame( () => this.draw() );
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
    this.map.updateCursorLocation(event, this.nextCameraOffset.x, this.nextCameraOffset.y);
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

    this.cameraOffsetDelta.x = this.prevCameraOffset.x - nextCameraOffsetX;
    this.cameraOffsetDelta.y = this.prevCameraOffset.y - nextCameraOffsetY;

    this.update = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.update = true;
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.clipboard.copy(`x: ${this.map.x}, y: ${this.map.y}`);
  }

  get mapX() {
    return this.map.x;
  }

  get mapY() {
    return this.map.y;
  }
}
