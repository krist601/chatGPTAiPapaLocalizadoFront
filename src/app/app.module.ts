import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { StreetViewComponent } from './components/street-view/street-view.component';
import { StreetViewDebugComponent } from './components/street-view/street-view-debug.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { MapService } from './services/map.service';
import { GeolocationService } from './services/geolocation.service';
import { StreetViewService } from './services/street-view.service';
import { DistancePipe } from './pipes/distance.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    StreetViewComponent,
    StreetViewDebugComponent,
    NavigationComponent,
    DistancePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    MapService,
    GeolocationService,
    StreetViewService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }