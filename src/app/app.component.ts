import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PanZoomConfig, PanZoomModel } from 'ngx-panzoom';
import { fromEvent, Subscription} from "rxjs";

export interface IMarker {
  x: number;
  y: number;
  name: string;
}

export interface IMarkerOptions extends IMarker {
  left: number;
  top: number;
}

const ORIGINAL_ZOOM = 8;
const SCALE = 1.5;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private apiSubscription: Subscription;
  panZoomConfig: PanZoomConfig = new PanZoomConfig({
    neutralZoomLevel: ORIGINAL_ZOOM,
    zoomStepDuration: 0.2,
    zoomLevels: 10,
    freeMouseWheel: false,
    invertMouseWheel: true,
    scalePerZoomLevel: SCALE,
    initialZoomToFit: { x: 0, y: 0, width: 14168, height: 14168 },
    zoomToFitZoomLevelFactor: 1,
  });
  markers: IMarker[];
  markerOptions: IMarkerOptions[] = [];
  panZoom: PanZoomModel;

  constructor(
    private changeDetection: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.markers = [
      { x: 5000, y: 5000, name: "Haha" },
      { x: 2000, y: 2000, name: "Hoho" },
      { x: 4160, y: 3870, name: "Hihi" },
      { x: 11390, y: 6000, name: "Alenka"}
    ]
    this.panZoom = this.panZoomConfig.modelChanged.value;
    this.apiSubscription = this.panZoomConfig.modelChanged.subscribe( (panZoom: PanZoomModel) => {
      this.markerOptions = this.markers
        .map((marker: IMarker): IMarkerOptions => (
          {
            ...marker,
            left: panZoom.pan.x + marker.x * Math.pow(SCALE, panZoom.zoomLevel - ORIGINAL_ZOOM),
            top: panZoom.pan.y + marker.y * Math.pow(SCALE, panZoom.zoomLevel - ORIGINAL_ZOOM),
          }
        ))
        .filter((mo: IMarkerOptions) => {
          return mo.left > 0 && mo.left < window.innerWidth && mo.top > 0 && mo.top < window.innerHeight;
        });
      this.panZoom = panZoom;
      this.changeDetection.detectChanges();
    });

    fromEvent(document.body, 'click').subscribe((e: Event) => {
      if (e instanceof MouseEvent) {
        const x = (e.pageX - this.panZoom.pan.x) / Math.pow(SCALE, this.panZoom.zoomLevel - ORIGINAL_ZOOM);
        const y = (e.pageY - this.panZoom.pan.y) /Math.pow(SCALE, this.panZoom.zoomLevel - ORIGINAL_ZOOM);
        console.log(x, y);
      }
    })
  }

  ngOnDestroy(): void {
    this.apiSubscription.unsubscribe();
  }
}
