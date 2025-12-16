import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../../services/map.service';
import { StreetViewService } from '../../services/street-view.service';
import { PhotoDTO } from '../../models/photo.dto';
import { CoordinatesDTO } from '../../models/coordinates.dto';

interface MockMarker {
  lat: number;
  lng: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private currentMarkers: L.Marker[] = [];
  private currentPolyline: L.Polyline | null = null;
  mockMarkers: MockMarker[] = [];
  selectedLocation: MockMarker | null = null;
  selectedPhoto: PhotoDTO | null = null;

  constructor(
    private mapService: MapService,
    private streetViewService: StreetViewService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private initializeMap() {
    // Crear el mapa centrado en Pittsburgh (default) con configuración optimizada
    const pittsburghCoords: [number, number] = [40.4406, -79.9959];

    this.map = L.map('map', {
      center: pittsburghCoords,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false,
      doubleClickZoom: true,
      trackResize: true
    });

    // Cargar fotos automáticamente en la ubicación por defecto
    this.loadPhotos({
      latitude: pittsburghCoords[0],
      longitude: pittsburghCoords[1]
    });

    // Intentar obtener la ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          console.log('📍 Ubicación del usuario encontrada:', userLat, userLng);
          this.map.setView([userLat, userLng], 13);

          // Opcional: Agregar un marcador en la ubicación del usuario
          L.marker([userLat, userLng])
            .addTo(this.map)
            .bindPopup('Tu ubicación')
            .openPopup();

          // Cargar fotos de la nueva ubicación del usuario
          this.loadPhotos({
            latitude: userLat,
            longitude: userLng
          });
        },
        (error) => {
          console.warn('⚠️ No se pudo obtener la ubicación del usuario, usando default (Pittsburgh).', error);
        }
      );
    }

    // Agregar tiles de OpenStreetMap con configuración mejorada para alineación
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '© OpenStreetMap contributors',
      crossOrigin: '',
      tileSize: 256,
      zoomOffset: 0,
      detectRetina: true,
      updateWhenZooming: false,
      updateWhenIdle: true,
      keepBuffer: 2
    }).addTo(this.map);

    // Configurar iconos personalizados para marcadores
    const customIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjRkY1NzIyIi8+Cjwvc3ZnPgo=',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    // Forzar redibujado después de inicialización
    setTimeout(() => {
      this.map.invalidateSize();
      this.addMarkersToMap(customIcon);
    }, 100);

    // Listener para clicks en el mapa
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e);
    });
  }

  private addMarkersToMap(icon?: L.Icon) {
    this.mockMarkers.forEach((marker, index) => {
      const mapMarker = L.marker([marker.lat, marker.lng], icon ? { icon } : {})
        .addTo(this.map)
        .bindPopup(`
          <div style="text-align: center;">
            <h4>📍 Location ${index + 1}</h4>
            <p><strong>📸 360° Photo Available</strong></p>
            <small>Click to explore</small>
          </div>
        `)
        .on('click', () => {
          this.selectLocation(marker);
        });
    });
  }

  onMapClick(event: L.LeafletMouseEvent) {
    const coordinates: CoordinatesDTO = {
      latitude: event.latlng.lat,
      longitude: event.latlng.lng
    };

    this.loadPhotos(coordinates);
  }

  selectLocation(marker: MockMarker) {
    this.selectedLocation = marker;
    // Solo seleccionar la ubicación, no cargar la foto automáticamente
  }

  loadPhotos(coordinates: CoordinatesDTO) {
    console.log('🔄 PASO 4: loadPhotos() iniciado con:', coordinates);

    this.mapService.getPhotosByCoordinates(coordinates).subscribe({
      next: (photos) => {
        console.log('📸 PASO 5: Fotos recibidas desde servicio:', photos);
        console.log('📸 PASO 6: Número de fotos:', photos.length);

        // Limpiar marcadores y línea existentes
        this.currentMarkers.forEach(marker => this.map.removeLayer(marker));
        this.currentMarkers = [];

        if (this.currentPolyline) {
          this.map.removeLayer(this.currentPolyline);
          this.currentPolyline = null;
        }

        const routeCoordinates: L.LatLngExpression[] = [];

        photos.forEach((photo) => {
          if (photo.coordinates) {
            const latLng: L.LatLngExpression = [photo.coordinates.latitude, photo.coordinates.longitude];
            routeCoordinates.push(latLng);

            const marker = L.marker(latLng)
              .addTo(this.map)
              .bindPopup(`
                 <div style="text-align: center;">
                   <p><strong>📸 Photo Available</strong></p>
                   <small>Click to view</small>
                 </div>
               `)
              .on('click', () => {
                this.selectedPhoto = photo;
                this.streetViewService.showStreetView(photo);
              });
            this.currentMarkers.push(marker);
          }
        });

        // Dibujar línea conectando los puntos (Estilo Google Street View)
        if (routeCoordinates.length > 1) {
          this.currentPolyline = L.polyline(routeCoordinates, {
            color: '#3b82f6', // Azul brillante
            weight: 5,
            opacity: 0.7,
            smoothFactor: 1
          }).addTo(this.map);

          // Opcional: Ajustar vista para ver toda la ruta
          // this.map.fitBounds(this.currentPolyline.getBounds());
          console.log('🛣️ Ruta dibujada con', routeCoordinates.length, 'puntos');
        }


        if (photos.length > 0) {
          this.selectedPhoto = photos[0];
          console.log('✅ PASO 7: Foto seleccionada asignada:', this.selectedPhoto);
          console.log('📤 PASO 8: Enviando al StreetViewService...');
          this.streetViewService.showStreetView(this.selectedPhoto);
          console.log('✅ PASO 9: ¡Foto enviada al servicio exitosamente!');
        } else {
          console.log('❌ PASO 7: No se encontraron fotos');
          // Informar al usuario
          L.popup()
            .setLatLng([coordinates.latitude, coordinates.longitude])
            .setContent('<p>⚠️ No images found at this location.</p>')
            .openOn(this.map);
        }
      },
      error: (error) => {
        console.error('💥 ERROR en loadPhotos:', error);
        L.popup()
          .setLatLng([coordinates.latitude, coordinates.longitude])
          .setContent('<p>❌ Error loading images.</p>')
          .openOn(this.map);
      }
    });
  }

  closePhoto() {
    this.selectedPhoto = null;
  }

  clearSelection() {
    this.selectedLocation = null;
    this.selectedPhoto = null;
    this.streetViewService.setPhoto(null);
  }

  exploreLocation(location: MockMarker) {
    // Cargar y mostrar la foto cuando se hace clic en "Explore"
    console.log('🚀 PASO 1: exploreLocation() llamado con:', location);

    if (!location) {
      console.error('❌ ERRO: location es null o undefined');
      return;
    }

    const coordinates: CoordinatesDTO = {
      latitude: location.lat,
      longitude: location.lng,
    };

    console.log('🚀 PASO 2: Coordenadas creadas:', coordinates);
    console.log('🚀 PASO 3: Llamando a loadPhotos()...');
    this.loadPhotos(coordinates);
  }

  // Método de prueba temporal para diagnóstico
  testButtonFunctionality() {
    console.log('🧪 TEST: Iniciando prueba manual del botón...');
    console.log('🧪 TEST: selectedLocation:', this.selectedLocation);
    console.log('🧪 TEST: mockMarkers:', this.mockMarkers);

    // Simular selección de primer marker
    if (this.mockMarkers.length > 0) {
      this.selectedLocation = this.mockMarkers[0];
      console.log('🧪 TEST: Location seleccionada:', this.selectedLocation);

      setTimeout(() => {
        console.log('🧪 TEST: Llamando exploreLocation...');
        this.exploreLocation(this.selectedLocation!);
      }, 500);
    } else {
      console.error('🧪 TEST: No hay markers disponibles');
    }
  }
}