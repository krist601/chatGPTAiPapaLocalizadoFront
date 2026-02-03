import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StreetSegmentDTO } from '../models/street-segment.dto';
import { CoordinatesDTO } from '../models/coordinates.dto';
import { PhotoDTO } from '../models/photo.dto';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class ImageSearchService {
  constructor(private http: HttpClient) { }

  getPhotosByCoordinates(coordinates: CoordinatesDTO): Observable<PhotoDTO[]> {
    const params: any = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radius: coordinates.radius || 10000
    };

    const baseUrl = '/api/photos';
    console.log(`🌐 API CALL: ${baseUrl} (Proxy -> Ngrok)`);

    const headers = {
      'ngrok-skip-browser-warning': 'true'
    };

    return this.http.get(baseUrl, { params, headers, responseType: 'text' }).pipe(
      map(response => {
        try {
          const items = JSON.parse(response);

          if (!Array.isArray(items)) {
            console.error('⚠️ La respuesta no es un array:', items);
            return [] as PhotoDTO[];
          }

          const mappedItems = items.map((item: any) => {
            let imageUrl = item.url || 'https://via.placeholder.com/800x400?text=No+Image';
            if (imageUrl.includes('ngrok-free.app')) {
              try {
                const urlObj = new URL(imageUrl);
                imageUrl = `/api${urlObj.pathname}${urlObj.search}`;
                console.log(`🔀 URL Reescrita para Proxy (Ngrok): ${item.url} -> ${imageUrl}`);
              } catch (e) {
                console.error('Error parsing Ngrok URL', imageUrl);
              }
            } else if (imageUrl.includes('s3.us-east-2.amazonaws.com')) {
              try {
                const urlObj = new URL(imageUrl);
                imageUrl = `/s3-proxy${urlObj.pathname}${urlObj.search}`;
                console.log(`🔀 URL Reescrita para Proxy (S3): ${item.url} -> ${imageUrl}`);
              } catch (e) {
                console.error('Error parsing S3 URL', imageUrl);
              }
            } else if (imageUrl.startsWith('http')) {
              // leave as is
            } else {
              if (!imageUrl.startsWith('/api') && !imageUrl.startsWith('/assets')) {
                imageUrl = `/api${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
              }
            }

            return {
              id: item.id,
              url: imageUrl,
              is360: true,
              coordinates: {
                latitude: item.latitude,
                longitude: item.longitude
              },
              timestamp: item.timestamp,
              direction: 0,
              pitch: 0,
              yaw: 0,
              panoramaType: 'equirectangular' as const,
              metadata: {
                resolution: 'unknown',
                camera: 'unknown',
                streetName: 'Unknown Location',
                description: 'Photo from API'
              }
            };
          });

          if (coordinates.radius) {
            const center = L.latLng(coordinates.latitude, coordinates.longitude);
            const filteredItems = mappedItems.filter((item: any) => {
              const itemLoc = L.latLng(item.coordinates.latitude, item.coordinates.longitude);
              const dist = center.distanceTo(itemLoc);
              return dist <= coordinates.radius!;
            });

            return filteredItems as PhotoDTO[];
          }

          return mappedItems as PhotoDTO[];
        } catch (e) {
          console.error('🚨 ERROR CRÍTICO DE PARSEO JSON 🚨');
          console.error(response.substring(0, 500));
          throw new Error('API Response was not valid JSON. Check console for details.');
        }
      })
    );
  }
}
