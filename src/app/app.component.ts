import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;
const SCROLL_SENSITIVITY = 0.0005;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef: ElementRef<HTMLCanvasElement>;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public cameraOffset: { x: number, y: number };
  public cameraZoom: number;
  public isDragging: boolean;
  public dragStart: { x: number, y: number };
  public initialPinchDistance: number | null;
  public lastZoom: number;

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 };
    this.cameraZoom = 1;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.initialPinchDistance = null
    this.lastZoom = this.cameraZoom;

    this.draw();
  }

  draw() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    this.ctx.translate( window.innerWidth / 2, window.innerHeight / 2 );
    this.ctx.scale(this.cameraZoom, this.cameraZoom);
    this.ctx.translate( -window.innerWidth / 2 + this.cameraOffset.x, -window.innerHeight / 2 + this.cameraOffset.y);
    this.ctx.clearRect(0,0, window.innerWidth, window.innerHeight);
    this.ctx.fillStyle = '#991111';
    this.drawRect(-50,-50,100,100);

    this.ctx.fillStyle = "#eecc77";
    this.drawRect(-35,-35,20,20);
    this.drawRect(15,-35,20,20);
    this.drawRect(-35,15,70,20);

    this.ctx.fillStyle = "#fff";
    this.drawText("Simple Pan and Zoom Canvas", -255, -100, 32, "courier");

    this.ctx.rotate(-31*Math.PI / 180);
    this.ctx.fillStyle = `#${(Math.round(Date.now()/40)%4096).toString(16)}`;
    this.drawText("Now with touch!", -110, 100, 32, "courier");

    this.ctx.fillStyle = "#fff";
    this.ctx.rotate(31*Math.PI / 180);

    this.drawText("Wow, you found me!", -260, -2000, 48, "courier");

    requestAnimationFrame( () => this.draw() );
  }

  drawRect(x: number, y: number, width: number, height: number) {
    this.ctx.fillRect( x, y, width, height )
  }

  drawText(text: string, x: number, y: number, size: number, font: string) {
    this.ctx.font = `${size}px ${font}`
    this.ctx.fillText(text, x, y)
  }

  @HostListener('document:mousedown', ['$event'])
  onPointerDown(e: MouseEvent) {
    this.isDragging = true;
    this.dragStart.x = this.getEventLocation(e).x/this.cameraZoom - this.cameraOffset.x;
    this.dragStart.y = this.getEventLocation(e).y/this.cameraZoom - this.cameraOffset.y;
  }

  @HostListener('document:mouseup')
  onPointerUp() {
    this.isDragging = false
    this.initialPinchDistance = null
    this.lastZoom = this.cameraZoom
  }

  @HostListener('document:mousemove',  ['$event'])
  onPointerMove(e: MouseEvent) {
    if (this.isDragging) {
      this.cameraOffset.x = this.getEventLocation(e).x/this.cameraZoom - this.dragStart.x
      this.cameraOffset.y = this.getEventLocation(e).y/this.cameraZoom - this.dragStart.y
    }
  }

  getEventLocation(e: MouseEvent): { x: number, y: number } {
    return  { x: e.clientX, y: e.clientY }
  }

  @HostListener('document:wheel',  ['$event'])
  adjustZoom(e: WheelEvent) {
    if (!this.isDragging) {
      this.cameraZoom -= e.deltaY * SCROLL_SENSITIVITY;
      this.cameraZoom = Math.min( this.cameraZoom, MAX_ZOOM );
      this.cameraZoom = Math.max( this.cameraZoom, MIN_ZOOM );
    }
  }
}
