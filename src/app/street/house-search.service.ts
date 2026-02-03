import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CoordinatesDTO } from '../models/coordinates.dto';
import { HouseDTO } from '../models/house.dto';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class HouseSearchService {
  constructor(private http: HttpClient) { }

  getHousesByCoordinates(coordinates: CoordinatesDTO): Observable<HouseDTO[]> {
    const params: any = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radius: coordinates.radius || 10000
    };

    const baseUrl = '/api/houses';
    const headers = { 'ngrok-skip-browser-warning': 'true' };

    return this.http.get(baseUrl, { params, headers, responseType: 'text' }).pipe(
      map(response => {
        try {
          const items = JSON.parse(response);
          if (!Array.isArray(items)) return [] as HouseDTO[];

          const mapped = items.map((it: any) => {
            const house: HouseDTO = {
              id: it.id,
              latitude: it.latitude,
              longitude: it.longitude,
              url: it.url,
              image: it.image,
              coordinates: {
                latitude: it.latitude,
                longitude: it.longitude
              },
              metadata: {
                title: it.title || undefined,
                price: it.price || undefined,
                description: it.description || undefined
              }
            };
            return house;
          });

          if (coordinates.radius) {
            const center = L.latLng(coordinates.latitude, coordinates.longitude);
            return mapped.filter(h => {
              const loc = L.latLng(h.latitude, h.longitude);
              return center.distanceTo(loc) <= coordinates.radius!;
            });
          }

          return mapped;
        } catch (e) {
          console.error('House API JSON parse error', e);
          throw e;
        }
      })
    );
  }
}
