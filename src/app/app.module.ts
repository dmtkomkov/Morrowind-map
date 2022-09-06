import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxPanZoomModule } from 'ngx-panzoom';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, NgxPanZoomModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
