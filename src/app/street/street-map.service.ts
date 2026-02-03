import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { PhotoDTO } from '../models/photo.dto';
import { HouseDTO } from '../models/house.dto';

@Injectable({
  providedIn: 'root'
})
export class StreetMapService {
  private map: L.Map | null = null;
  private currentMarkers: L.Marker[] = [];
  private currentHouseMarkers: L.Marker[] = [];
  private currentPolyline: L.Polyline | null = null;

  attachMap(map: L.Map) {
    this.map = map;
  }

  clear() {
    if (!this.map) return;
    this.currentMarkers.forEach(m => this.map!.removeLayer(m));
    this.currentMarkers = [];
    this.currentHouseMarkers.forEach(m => this.map!.removeLayer(m));
    this.currentHouseMarkers = [];
    if (this.currentPolyline) {
      this.map.removeLayer(this.currentPolyline);
      this.currentPolyline = null;
    }
  }

  addHouseMarkers(houses: HouseDTO[], onHouseClick?: (house: HouseDTO) => void) {
    if (!this.map) return;

    // Clear previous house markers
    this.currentHouseMarkers.forEach(m => this.map!.removeLayer(m));
    this.currentHouseMarkers = [];

    // Create a simple house SVG div icon
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
        <path d="M12 3l9 8h-3v9h-12v-9h-3z" fill="#f59e0b" stroke="#b45309" stroke-width="0.5"/>
      </svg>`;

    // Use a named class for easier styling/debugging
    const houseIcon = L.divIcon({ html: svg, className: 'leaflet-house-icon', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] });

    console.log(`🏠 addHouseMarkers: received ${houses.length} houses`);
    houses.forEach(house => {
      const latLng: L.LatLngExpression = [house.latitude, house.longitude];
      console.log('🏠 adding house marker at', latLng, 'id=', house.id);
      const marker = L.marker(latLng, { icon: houseIcon })
        .addTo(this.map!)
        .bindPopup(`
          <div style="text-align:center;">
            <strong>🏠 House</strong><br/>
            ${house.metadata?.title ? `<small>${house.metadata.title}</small><br/>` : ''}
            <a href="${house.url}" target="_blank">Open listing</a>
          </div>
        `)
        .on('click', () => {
          if (onHouseClick) onHouseClick(house);
        });

      this.currentHouseMarkers.push(marker);
    });
  }

  updateRoute(photos: PhotoDTO[], onMarkerClick?: (photo: PhotoDTO) => void) {
    if (!this.map) return;
    this.clear();

    const routeCoordinates: L.LatLngExpression[] = [];

    photos.forEach(photo => {
      if (photo.coordinates) {
        const latLng: L.LatLngExpression = [photo.coordinates.latitude, photo.coordinates.longitude];
        routeCoordinates.push(latLng);

        const marker = L.marker(latLng)
          .addTo(this.map!)
          .bindPopup(`
            <div style="text-align: center;">
              <p><strong>📸 Photo Available</strong></p>
              <small>Click to view</small>
            </div>
          `)
          .on('click', () => {
            if (onMarkerClick) onMarkerClick(photo);
          });

        this.currentMarkers.push(marker);
      }
    });

    if (routeCoordinates.length > 1) {
      this.currentPolyline = L.polyline(routeCoordinates, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.7,
        smoothFactor: 1
      }).addTo(this.map);
    }
  }
}
