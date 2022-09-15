import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

const MAX_ZOOM = 5;
const MIN_ZOOM = -5;

const ZOOM_FACTOR = 1.5;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cameraOffset: { x: number, y: number } = { x: 0, y: 0 };
  zoomLevel: number = 5;
  cameraZoom: number = Math.pow(ZOOM_FACTOR, this.zoomLevel);
  isDragging: boolean = false;
  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  initialPinchDistance: number | null = null
  update: boolean = true;
  images: HTMLImageElement[][] = [];

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;

    for (let i = 0; i < 4; i++) {
      this.images.push([]);
      for (let j = 0; j < 4; j++) {
        const image: HTMLImageElement = new Image();
        this.images[i].push(image);
      }
    }

    this.draw();
  }

  ngAfterViewInit(): void {

  }

  draw() {
    if (this.update) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      this.ctx.translate( this.cameraOffset.x, this.cameraOffset.y);
      this.ctx.clearRect(0,0, window.innerWidth, window.innerHeight);

      const size = Math.floor(2048 * this.cameraZoom);
      const min_visible_image_number = {
        x: Math.max(Math.floor((0 - this.cameraOffset.x)/size), 0),
        y: Math.max(Math.floor((0 - this.cameraOffset.y)/size), 0),
      };
      const max_visible_image_numbers = {
        x: Math.min(Math.floor((window.innerWidth - this.cameraOffset.x)/size), 3),
        y: Math.min(Math.floor((window.innerHeight - this.cameraOffset.y)/size), 3),
      };


      for (let i = min_visible_image_number.x; i <= max_visible_image_numbers.x; i++) {
        for (let j = min_visible_image_number.y; j <= max_visible_image_numbers.y; j++) {
          const image = this.images[i][j];
          if (!image.src) image.src = `assets/4/image-${i}-${j}.webp`;
          if (image.complete) {
            this.ctx.drawImage(image, i * size, j * size, size, size);
          } else {
            image.onload = () => {
              this.ctx.drawImage(image, i * size, j * size, size, size);
            }
          }
        }
      }

      this.update = false;
    }

    requestAnimationFrame( () => this.draw() );
  }

  @HostListener('document:mousedown', ['$event'])
  onPointerDown(e: MouseEvent) {
    this.isDragging = true;
    this.dragStart.x = this.getEventLocation(e).x - this.cameraOffset.x;
    this.dragStart.y = this.getEventLocation(e).y - this.cameraOffset.y;
  }

  @HostListener('document:mouseup')
  onPointerUp() {
    this.isDragging = false;
    this.initialPinchDistance = null;
  }

  @HostListener('document:mousemove',  ['$event'])
  onPointerMove(e: MouseEvent) {
    if (this.isDragging) {
      this.cameraOffset.x = e.x - this.dragStart.x;
      this.cameraOffset.y = e.y - this.dragStart.y;
      this.update = true;
    }
  }

  getEventLocation(e: MouseEvent): { x: number, y: number } {
    return  { x: e.clientX, y: e.clientY }
  }

  @HostListener('document:wheel',  ['$event'])
  adjustZoom(e: WheelEvent) {
    if (!this.isDragging) {
      this.zoomLevel += Math.sign(-e.deltaY);
      if (this.zoomLevel > MAX_ZOOM || this.zoomLevel < MIN_ZOOM) {
        this.zoomLevel -= Math.sign(-e.deltaY);
        return;
      }

      const zoomDelta = Math.pow(ZOOM_FACTOR, Math.sign(-e.deltaY))
      this.cameraZoom = Math.pow(ZOOM_FACTOR, this.zoomLevel);

      this.cameraOffset.x = Math.floor(e.clientX - (e.clientX - this.cameraOffset.x) * zoomDelta);
      this.cameraOffset.y = Math.floor(e.clientY - (e.clientY - this.cameraOffset.y) * zoomDelta);

      this.update = true;
    }
  }
}
