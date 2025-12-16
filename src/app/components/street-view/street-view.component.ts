import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { StreetViewService } from '../../services/street-view.service';
import { PhotoDTO } from '../../models/photo.dto';
import { HttpClient } from '@angular/common/http';

declare var pannellum: any; // Declarar pannellum para TypeScript

@Component({
  selector: 'app-street-view',
  templateUrl: './street-view.component.html',
  styleUrls: ['./street-view.component.css']
})
export class StreetViewComponent implements OnInit, OnDestroy, AfterViewInit {
  photo: PhotoDTO | null = null;
  private subscription: Subscription = new Subscription();
  private viewer: any = null;
  currentYaw: number = 0;
  currentPitch: number = 0;
  currentZoom: number = 100;
  private currentBlobUrl: string | null = null;

  constructor(
    private streetViewService: StreetViewService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.streetViewService.currentPhoto$.subscribe(photo => {
        console.log('📥 StreetViewComponent recibió foto:', photo);
        this.photo = photo;

        // Forzar detección de cambios para asegurar que el DOM se actualice (vfs *ngIf)
        this.cdr.detectChanges();

        if (photo) {
          console.log('🎯 Inicializando visor para foto:', photo.url);
          // Un pequeño timeout para asegurar que el contenedor está renderizado
          setTimeout(() => this.init360Viewer(), 100);
        } else if (this.viewer) {
          console.log('🔄 Destruyendo visor anterior');
          this.destroy360Viewer();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // El componente está listo para inicializar el visor
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroy360Viewer();
    document.removeEventListener('keydown', this.handleKeyboardNavigation.bind(this));
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

  private init360Viewer(): void {
    if (!this.photo) return;

    // FETCH MANUAL DE LA IMAGEN
    // Usamos HttpClient para descargar la imagen como Blob.
    console.log('⬇️ Descargando imagen manualmente:', this.photo.url);

    this.http.get(this.photo.url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        console.log('✅ Imagen descargada (Blob):', blob.size, 'bytes');

        // Crear URL local para el Blob
        if (this.currentBlobUrl) {
          URL.revokeObjectURL(this.currentBlobUrl);
        }
        this.currentBlobUrl = URL.createObjectURL(blob);
        console.log('🔗 Blob URL creada:', this.currentBlobUrl);

        this.createPannellumViewer(this.currentBlobUrl);
      },
      error: (err) => {
        console.error('❌ Error descargando la imagen:', err);
        alert('Error downloading image. See console.');
      }
    });
  }

  private createPannellumViewer(imageUrl: string): void {
    console.log('🔧 Inicializando Pannellum con URL local..');

    this.destroy360Viewer();

    // Verificar Pannellum
    if (typeof pannellum === 'undefined') {
      console.error('❌ Pannellum no está cargado.');
      // Reintentar una vez tras un pequeño delay por si es carrera de carga
      setTimeout(() => {
        if (typeof pannellum !== 'undefined') {
          this.createPannellumViewer(imageUrl);
        } else {
          console.error('❌ Falló reintento de inicialización de Pannellum');
        }
      }, 500);
      return;
    }

    try {
      const container = document.getElementById('panorama-container');
      if (!container) {
        console.error('❌ No se encontró el contenedor panorama-container. El *ngIf podría no haber renderizado aún.');
        return;
      }
      console.log('✅ Contenedor encontrado, creando visor...');

      this.viewer = pannellum.viewer('panorama-container', {
        type: 'equirectangular',
        panorama: imageUrl, // Usamos la URL del blob
        autoLoad: true,
        pitch: this.photo?.pitch || 0,
        yaw: this.photo?.yaw || 0,
        hfov: 90,

        mouseZoom: true,
        keyboardZoom: true,
        doubleClickZoom: true,
        scrollZoom: true,
        minHfov: 20,
        maxHfov: 140,
        minPitch: -90,
        maxPitch: 90,
        friction: 0.15,
        showControls: false,
        showFullscreenCtrl: false,
        showZoomCtrl: false,
        autoRotate: 0,
        loadButtonLabel: 'Click to Load Image',
        nothingFoundLabel: 'Image not found',
        crossOrigin: 'anonymous',

        onload: () => {
          console.log('✅ Visor Pannellum cargado correctamente');
          this.updateViewInfo();
          this.startViewTracking();
        },

        onerror: (error: string) => {
          console.error('❌ Error interno Pannellum:', error);
          alert(`Pannellum Error: ${error}`);
        }
      });
      console.log('🎯 Visor creado exitosamente');

      document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

    } catch (error) {
      console.error('💥 Error crítico Pannellum:', error);
    }
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.viewer || !this.photo?.is360) return;

    const currentYaw = this.viewer.getYaw();
    const currentPitch = this.viewer.getPitch();
    const currentHfov = this.viewer.getHfov();

    switch (event.key) {
      case 'ArrowLeft':
        this.viewer.setYaw(currentYaw - 10);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.viewer.setYaw(currentYaw + 10);
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.viewer.setPitch(Math.min(currentPitch + 10, 30));
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.viewer.setPitch(Math.max(currentPitch - 10, -30));
        event.preventDefault();
        break;
      case '+':
      case '=':
        this.viewer.setHfov(Math.max(currentHfov - 10, 30));
        event.preventDefault();
        break;
      case '-':
        this.viewer.setHfov(Math.min(currentHfov + 10, 120));
        event.preventDefault();
        break;
    }
  }

  private destroy360Viewer(): void {
    if (this.viewer) {
      try {
        this.viewer.destroy();
        this.viewer = null;
      } catch (error) {
        console.error('Error al destruir el visor 360:', error);
      }
    }
  }

  loadPhoto(photoId: string): void {
    this.streetViewService.getPhotoById(photoId).subscribe(photo => {
      this.photo = photo;
    });
  }

  moveForward(): void {
    this.streetViewService.moveForward();
  }

  moveBackward(): void {
    this.streetViewService.moveBackward();
  }

  turnLeft(): void {
    if (this.viewer && this.photo?.is360) {
      const currentYaw = this.viewer.getYaw();
      this.viewer.setYaw(currentYaw - 30);
    } else {
      this.streetViewService.turnLeft();
    }
  }

  turnRight(): void {
    if (this.viewer && this.photo?.is360) {
      const currentYaw = this.viewer.getYaw();
      this.viewer.setYaw(currentYaw + 30);
    } else {
      this.streetViewService.turnRight();
    }
  }

  zoomIn(): void {
    if (this.viewer && this.photo?.is360) {
      const currentHfov = this.viewer.getHfov();
      this.viewer.setHfov(Math.max(currentHfov - 10, 50));
    }
  }

  zoomOut(): void {
    if (this.viewer && this.photo?.is360) {
      const currentHfov = this.viewer.getHfov();
      this.viewer.setHfov(Math.min(currentHfov + 10, 120));
    }
  }

  resetView(): void {
    if (this.viewer && this.photo?.is360) {
      this.viewer.setYaw(this.photo.yaw || 0);
      this.viewer.setPitch(this.photo.pitch || 0);
      this.viewer.setHfov(90);
      this.updateViewInfo();
    }
  }

  toggleFullscreen(): void {
    if (this.viewer && this.photo?.is360) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        const container = document.getElementById('panorama-container');
        if (container) {
          container.requestFullscreen();
        }
      }
    }
  }

  private updateViewInfo(): void {
    if (this.viewer && this.photo?.is360) {
      this.currentYaw = this.viewer.getYaw();
      this.currentPitch = this.viewer.getPitch();
      const hfov = this.viewer.getHfov();
      // Convertir HFOV a porcentaje de zoom (aproximado)
      this.currentZoom = Math.round(((120 - hfov) / 90) * 100 + 50);
    }
  }

  private startViewTracking(): void {
    if (this.viewer && this.photo?.is360) {
      // Actualizar información cada 100ms
      setInterval(() => {
        this.updateViewInfo();
      }, 100);
    }
  }
}