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
      radius: 1000
    };

    return this.http.get<any[]>('https://2686a7c7f2bf.ngrok-free.app/photos', { params }).pipe(
      map(response => response.map(item => ({
        id: item.id,
        url: item.url || 'https://via.placeholder.com/800x400?text=No+Image', // Fallback if url missing
        is360: true, // Assuming true as before
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
      })))
    );
  }
}