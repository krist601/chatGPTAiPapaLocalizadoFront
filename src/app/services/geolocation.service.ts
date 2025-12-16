import { Injectable } from '@angular/core';
import { CoordinatesDTO } from '../models/coordinates.dto';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  constructor() {}

  getCurrentLocation(): Promise<CoordinatesDTO> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coordinates: CoordinatesDTO = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            resolve(coordinates);
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }
}