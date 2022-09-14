import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

const MAX_ZOOM = 5;
const MIN_ZOOM = -5;

const ZOOM_FACTOR = 1.2;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public cameraOffset: { x: number, y: number } = { x: window.innerWidth/2, y: window.innerHeight/2 };
  public cameraZoom: number = 1;
  public zoomLevel: number = 0;
  public isDragging: boolean = false;
  public dragStart: { x: number, y: number } = { x: 0, y: 0 };
  public initialPinchDistance: number | null = null
  public update: boolean = true;
  public image: HTMLImageElement = new Image();

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.image = new Image();
    this.image.src = 'assets/4/image-2-2.webp';

    this.draw();

  }

  ngAfterViewInit(): void {

  }

  draw() {
    if (this.update) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
      this.ctx.translate( window.innerWidth / 2, window.innerHeight / 2 );
      this.ctx.scale(this.cameraZoom, this.cameraZoom);
      this.ctx.translate( -window.innerWidth / 2 + this.cameraOffset.x, -window.innerHeight / 2 + this.cameraOffset.y);
      this.ctx.clearRect(0,0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          console.log(i, j);
        }
      }
      if (this.image.complete) {
        this.ctx.drawImage(this.image, -1000, -1000);
      } else {
        this.image.onload = () => {
          this.ctx.drawImage(this.image, -1000, -1000);
        }
      }

      this.update = false;
    }

    requestAnimationFrame( () => this.draw() );
  }

  @HostListener('document:mousedown', ['$event'])
  onPointerDown(e: MouseEvent) {
    this.isDragging = true;
    this.dragStart.x = this.getEventLocation(e).x/this.cameraZoom - this.cameraOffset.x;
    this.dragStart.y = this.getEventLocation(e).y/this.cameraZoom - this.cameraOffset.y;
  }

  @HostListener('document:mouseup')
  onPointerUp() {
    this.isDragging = false;
    this.initialPinchDistance = null;
  }

  @HostListener('document:mousemove',  ['$event'])
  onPointerMove(e: MouseEvent) {
    if (this.isDragging) {
      this.cameraOffset.x = this.getEventLocation(e).x/this.cameraZoom - this.dragStart.x;
      this.cameraOffset.y = this.getEventLocation(e).y/this.cameraZoom - this.dragStart.y;
      this.update = true;
    }
  }

  getEventLocation(e: MouseEvent): { x: number, y: number } {
    return  { x: e.clientX, y: e.clientY }
  }

  @HostListener('document:wheel',  ['$event'])
  adjustZoom(e: WheelEvent) {
    if (!this.isDragging) {
      this.zoomLevel -= Math.sign(e.deltaY);
      this.zoomLevel = Math.min(this.zoomLevel, MAX_ZOOM);
      this.zoomLevel = Math.max(this.zoomLevel, MIN_ZOOM);
      this.cameraZoom = Math.pow(ZOOM_FACTOR, this.zoomLevel);
      this.update = true;
    }
  }
}
