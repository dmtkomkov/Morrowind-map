import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MapService } from "./map.service";
import {
  ANIMATION_TIME,
  DEFAULT_OFFSET,
  HOVERING_ZOOM,
  ILoc,
  MAX_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
  ZOOM_FACTOR,
} from "./app.const";
import { IQuestObject } from "./quests";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;

  prevCameraOffset: ILoc = { ...DEFAULT_OFFSET };
  nextCameraOffset: ILoc = { ...DEFAULT_OFFSET };
  prevZoomLevel: number = MIN_ZOOM_LEVEL;
  nextZoomLevel: number = this.prevZoomLevel;
  isDragging: boolean = false;
  isPointing: boolean = false;
  dragStart: ILoc = { x: 0, y: 0 };
  update: boolean = true;
  startZoomTime: number = 0;
  hoveredObjects: IQuestObject[] = [];
  enableOnHover: boolean = false;

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
        if (count === 0) {
          this.map.drawQuests();
          this.map.drawLocations(this.prevZoomLevel);
        }
      },
    });
  }

  draw() {
    if (this.update) {
      const updateTime: number = Math.min(Date.now() - this.startZoomTime, ANIMATION_TIME);

      this.map.clean();
      this.map.setLayerSize(this.nextZoomLevel);

      const inc = updateTime/ANIMATION_TIME;
      this.map.setCameraOffset(this.prevCameraOffset, this.nextCameraOffset, inc);
      this.map.setCameraZoom(this.prevZoomLevel, this.nextZoomLevel, inc);

      if (ANIMATION_TIME - updateTime <= 0) {
        this.prevZoomLevel = this.nextZoomLevel;
        this.startZoomTime = 0;
        this.prevCameraOffset = { ...this.nextCameraOffset };
        this.update = false;
      }

      this.map.drawImageTiles();
      this.map.drawQuests();
      this.map.drawLocations(this.prevZoomLevel);
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
    this.map.updateCursorLocation(event);
    if (this.isDragging) {
      this.nextCameraOffset.x = event.clientX - this.dragStart.x;
      this.nextCameraOffset.y = event.clientY - this.dragStart.y;
      this.update = true;
    } else {
      if (this.enableOnHover) {
        this.hoveredObjects = this.map.getHoveredQuestObjects(event.clientX, event.clientY);
        this.isPointing = Boolean(this.hoveredObjects.length);
      }
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

    this.enableOnHover = this.nextZoomLevel > HOVERING_ZOOM;
    if (!this.enableOnHover) {
      this.hoveredObjects = []
    } else {
      this.hoveredObjects = this.map.getHoveredQuestObjects(event.clientX, event.clientY);
    }
    this.isPointing = Boolean(this.hoveredObjects.length);

    this.startZoomTime = Date.now();

    const zoomDelta = Math.pow(ZOOM_FACTOR, Math.sign(-event.deltaY));
    this.nextCameraOffset.x = Math.floor(event.clientX - (event.clientX - this.prevCameraOffset.x) * zoomDelta);
    this.nextCameraOffset.y = Math.floor(event.clientY - (event.clientY - this.prevCameraOffset.y) * zoomDelta);

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
