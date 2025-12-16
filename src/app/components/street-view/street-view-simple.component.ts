import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StreetViewService } from '../../services/street-view.service';
import { PhotoDTO } from '../../models/photo.dto';

@Component({
  selector: 'app-street-view',
  templateUrl: './street-view.component.html',
  styleUrls: ['./street-view.component.css']
})
export class StreetViewComponent implements OnInit, OnDestroy {
  photo: PhotoDTO | null = null;
  private subscription: Subscription = new Subscription();
  
  constructor(private streetViewService: StreetViewService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.streetViewService.currentPhoto$.subscribe(photo => {
        console.log('📥 StreetViewComponent recibió foto:', photo);
        this.photo = photo;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onImageLoad(): void {
    console.log('✅ Imagen cargada correctamente:', this.photo?.url);
  }

  onImageError(event: any): void {
    console.error('❌ Error cargando imagen:', event, 'URL:', this.photo?.url);
  }

  closePhoto(): void {
    this.photo = null;
    this.streetViewService.setPhoto(null);
  }
}
