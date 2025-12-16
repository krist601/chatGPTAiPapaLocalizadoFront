import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StreetSegmentDTO } from '../models/street-segment.dto';
import { CoordinatesDTO } from '../models/coordinates.dto';
import { PhotoDTO } from '../models/photo.dto';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiUrl = 'https://api.example.com/maps'; // Replace with your actual API endpoint
  private map: any; // Leaflet map instance

  constructor(private http: HttpClient) { }

  createMap(): any {
    // This will be implemented with Leaflet later
    // For now, return a mock map object
    this.map = {
      id: 'mock-map',
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 13
    };
    return this.map;
  }

  getStreetSegments(): Observable<StreetSegmentDTO[]> {
    return this.http.get<StreetSegmentDTO[]>(`${this.apiUrl}/segments`);
  }

  getCoordinatesForLocation(location: string): Observable<CoordinatesDTO> {
    return this.http.get<CoordinatesDTO>(`${this.apiUrl}/coordinates?location=${location}`);
  }

  getPhotosByCoordinates(coordinates: CoordinatesDTO): Observable<PhotoDTO[]> {
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radius: 10000
    };

    // URL relativa que será interceptada por el proxy
    // /api/photos -> https://2686a7c7f2bf.ngrok-free.app/photos
    const baseUrl = '/api/photos';
    console.log(`🌐 API CALL: ${baseUrl} (Proxy -> Ngrok)`);

    // Headers para evitar la página de advertencia de ngrok (por si acaso)
    const headers = {
      'ngrok-skip-browser-warning': 'true'
    };

    // Usamos responseType: 'text' para poder capturar respuestas HTML de error
    return this.http.get(baseUrl, { params, headers, responseType: 'text' }).pipe(
      map(response => {
        try {
          // Intentar parsear el texto a JSON manualmente
          const items = JSON.parse(response);

          if (!Array.isArray(items)) {
            console.error('⚠️ La respuesta no es un array:', items);
            return [];
          }

          // Verificar estructura del DTO
          const isValid = items.every((item: any) =>
            item.hasOwnProperty('id') &&
            item.hasOwnProperty('latitude') &&
            item.hasOwnProperty('longitude') &&
            item.hasOwnProperty('url')
          );

          if (isValid) {
            console.log('✅ DTO Validado correctamente: Estructura correcta');
            console.log('📄 Ejemplo de item recibido:', items[0]);
          } else {
            console.warn('⚠️ ALERTA: El formato recibidio NO coincide con el esperado {id, latitude, longitude, url}');
            console.warn('📄 Recibido:', items[0]);
          }

          return items.map((item: any) => {
            // Reescribir la URL para usar el proxy y evitar CORS
            // Si la URL es absoluta y apunta a ngrok, la cambiamos a relativa
            let imageUrl = item.url || 'https://via.placeholder.com/800x400?text=No+Image';
            // Check if it's an ngrok URL (http or https)
            if (imageUrl.includes('ngrok-free.app')) {
              // We need to extract the path part.
              // Assuming URL is like https://xyz.ngrok-free.app/resource/image.jpg
              // We want /resource/image.jpg prefixed with /api
              // The proxy target is fixed in proxy.conf.json, so this assumes the domain matches the target.

              try {
                const urlObj = new URL(imageUrl);
                imageUrl = `/api${urlObj.pathname}${urlObj.search}`;
                console.log(`🔀 URL Reescrita para Proxy (Ngrok): ${item.url} -> ${imageUrl}`);
              } catch (e) {
                console.error('Error parsing Ngrok URL', imageUrl);
              }
            } else if (imageUrl.includes('s3.us-east-2.amazonaws.com')) {
              // Lógica nueva para S3
              try {
                // URL original: https://360images-fhd-street.s3.us-east-2.amazonaws.com/guid/img.jpg
                // URL deseada: /s3-proxy/guid/img.jpg
                // El target del proxy es el dominio, así que solo necesitamos el pathname
                const urlObj = new URL(imageUrl);
                imageUrl = `/s3-proxy${urlObj.pathname}${urlObj.search}`;
                console.log(`🔀 URL Reescrita para Proxy (S3): ${item.url} -> ${imageUrl}`);
              } catch (e) {
                console.error('Error parsing S3 URL', imageUrl);
              }
            } else if (imageUrl.startsWith('http')) {
              // External URL not matching our proxy target.
              // We leave it as is, or could have a generic proxy.
            } else {
              // Si ya es relativa, asegurar que empiece con /api si no lo hace
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
              timestamp: new Date(),
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
        } catch (e) {
          console.error('🚨 ERROR CRÍTICO DE PARSEO JSON 🚨');
          console.error('El servidor no devolvió JSON válido. Probablemente devolvió HTML (error de ngrok o 404).');
          console.error('CONTENIDO RECIBIDO (Primeros 500 caracteres):');
          console.error(response.substring(0, 500));
          console.error('------------------------------------------');
          throw new Error('API Response was not valid JSON. Check console for details.');
        }
      })
    );
  }
}