import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StreetViewService } from '../../services/street-view.service';
import { PhotoDTO } from '../../models/photo.dto';

@Component({
  selector: 'app-street-view-debug',
  template: `
    <div class="street-view-debug" *ngIf="photo">
      <h2>🐛 Debug Street View</h2>
      <div class="debug-info">
        <h3>✅ ¡FOTO RECIBIDA EXITOSAMENTE!</h3>
        <p><strong>ID:</strong> {{ photo.id }}</p>
        <p><strong>URL:</strong> {{ photo.url }}</p>
        <p><strong>Es 360°:</strong> {{ photo.is360 ? 'Sí' : 'No' }}</p>
        <p><strong>Coordenadas:</strong> {{ photo.coordinates.latitude }}, {{ photo.coordinates.longitude }}</p>
      </div>
      
      <div class="photo-container">
        <img [src]="photo.url" alt="Street View Photo" class="debug-photo" 
             (load)="onImageLoad()" (error)="onImageError($event)"
             [style.width]="'100%'" [style.max-height]="'400px'" [style.object-fit]="'cover'"/>
      </div>
      
      <button (click)="closePhoto()" class="close-btn">❌ Cerrar</button>
    </div>
    
    <div class="no-photo-debug" *ngIf="!photo">
      <h2>🔍 Esperando foto...</h2>
      <p>El componente street-view está esperando una foto del servicio.</p>
    </div>
  `,
  styles: [`
    .street-view-debug {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 10px;
    }
    
    .debug-info {
      background: #d4edda;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
      border-left: 4px solid #28a745;
    }
    
    .debug-photo {
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .close-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
    }
    
    .no-photo-debug {
      text-align: center;
      padding: 40px;
      background: #fff3cd;
      border-radius: 8px;
      margin: 10px;
    }
  `]
})
export class StreetViewDebugComponent implements OnInit, OnDestroy {
  photo: PhotoDTO | null = null;
  private subscription: Subscription = new Subscription();
  
  constructor(private streetViewService: StreetViewService) {}

  ngOnInit(): void {
    console.log('🐛 StreetViewDebugComponent inicializado');
    
    this.subscription.add(
      this.streetViewService.currentPhoto$.subscribe(photo => {
        console.log('🐛 COMPONENTE DEBUG recibió foto:', photo);
        this.photo = photo;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onImageLoad(): void {
    console.log('🐛 ✅ Imagen cargada exitosamente en componente debug');
  }

  onImageError(event: any): void {
    console.error('🐛 ❌ Error cargando imagen en componente debug:', event);
  }

  closePhoto(): void {
    console.log('🐛 Cerrando foto en componente debug');
    this.photo = null;
    this.streetViewService.setPhoto(null);
  }
}
