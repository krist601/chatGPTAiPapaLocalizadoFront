import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { PhotoDTO } from '../models/photo.dto';
import { CoordinatesDTO } from '../models/coordinates.dto';

@Injectable({
  providedIn: 'root'
})
export class StreetViewService {
  private photos: PhotoDTO[] = [];
  private currentPhoto: PhotoDTO | null = null;
  private currentPhotoSubject = new BehaviorSubject<PhotoDTO | null>(null);
  public currentPhoto$ = this.currentPhotoSubject.asObservable();

  constructor() {}

  addPhoto(photo: PhotoDTO): void {
    this.photos.push(photo);
  }

  getPhotosByCoordinates(coordinates: CoordinatesDTO): PhotoDTO[] {
    return this.photos.filter(photo => 
      photo.coordinates.latitude === coordinates.latitude && 
      photo.coordinates.longitude === coordinates.longitude
    );
  }

  getAllPhotos(): PhotoDTO[] {
    return this.photos;
  }

  getPhotoById(photoId: string): Observable<PhotoDTO | null> {
    const photo = this.photos.find(p => p.id === photoId);
    return of(photo || null);
  }

  showStreetView(photo: PhotoDTO): void {
    this.currentPhoto = photo;
    this.currentPhotoSubject.next(photo);
  }

  setPhoto(photo: PhotoDTO | null): void {
    this.currentPhoto = photo;
    this.currentPhotoSubject.next(photo);
  }

  moveForward(): void {
    // Mock implementation - move to next photo in direction
    if (this.currentPhoto) {
      console.log('Moving forward from current photo');
      // Implementation would find next photo in the direction
    }
  }

  moveBackward(): void {
    // Mock implementation - move to previous photo
    if (this.currentPhoto) {
      console.log('Moving backward from current photo');
      // Implementation would find previous photo in the opposite direction
    }
  }

  turnLeft(): void {
    // Mock implementation - rotate view left
    if (this.currentPhoto) {
      console.log('Turning left from current photo');
      // Implementation would adjust the direction/view angle
    }
  }

  turnRight(): void {
    // Mock implementation - rotate view right
    if (this.currentPhoto) {
      console.log('Turning right from current photo');
      // Implementation would adjust the direction/view angle
    }
  }
}