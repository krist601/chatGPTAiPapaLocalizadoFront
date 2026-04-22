import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../../services/map.service';
import { StreetViewService } from '../../services/street-view.service';
import { StreetMapService } from '../../street/street-map.service';
import { ImageSearchService } from '../../street/image-search.service';
import { HouseSearchService } from '../../street/house-search.service';
import { PhotoDTO } from '../../models/photo.dto';
import { CoordinatesDTO } from '../../models/coordinates.dto';
import { environment } from '../../../environments/environment';

// Configurar los iconos de Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/images/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/images/marker-icon.png',
  shadowUrl: 'assets/leaflet/images/marker-shadow.png'
});

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
  showHouses = environment.showHouses;

  constructor(
    private mapService: MapService,
    private streetViewService: StreetViewService,
    private streetMapService: StreetMapService,
    private imageSearchService: ImageSearchService,
    private houseSearchService: HouseSearchService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private initializeMap() {
    // Crear el mapa centrado en la ubicación por defecto con configuración optimizada
    const defaultCoords: [number, number] = [environment.defaultLocation.latitude, environment.defaultLocation.longitude];

    this.map = L.map('map', {
      center: defaultCoords,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false,
      doubleClickZoom: true,
      trackResize: true
    });

    // Cargar fotos automáticamente en la ubicación por defecto
    this.loadPhotos({
      latitude: defaultCoords[0],
      longitude: defaultCoords[1]
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

    // Attach map to street map helper
    this.streetMapService.attachMap(this.map);

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
    // Calcular el radio basado en la vista actual (distancia del centro a la esquina)
    const mapCenter = this.map.getCenter();
    const mapBounds = this.map.getBounds();
    const northEast = mapBounds.getNorthEast();
    let radiusInMeters: number | null = mapCenter.distanceTo(northEast);

    console.log(`📏 Radio calculado basado en zoom: ${Math.round(radiusInMeters)} metros`);

    radiusInMeters = 0;
    const coordinates: CoordinatesDTO = {
      latitude: event.latlng.lat,
      longitude: event.latlng.lng,
      radius: radiusInMeters == 0 ? 10000 : Math.round(radiusInMeters)
    };

    this.loadPhotos(coordinates);
  }

  selectLocation(marker: MockMarker) {
    this.selectedLocation = marker;
    // Solo seleccionar la ubicación, no cargar la foto automáticamente
  }

  loadPhotos(coordinates: CoordinatesDTO) {
    console.log('🔄 PASO 4: loadPhotos() iniciado con:', coordinates);

    this.imageSearchService.getPhotosByCoordinates(coordinates).subscribe({
      next: (photos) => {
        console.log('📸 PASO 5: Fotos recibidas desde servicio:', photos);
        console.log('📸 PASO 6: Número de fotos:', photos.length);

        // ORDENAR POR FECHA (Timestamp)
        photos.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateA - dateB;
        });
        console.log('📅 Fotos ordenadas cronológicamente');

        // Delegar a StreetMapService para dibujar marcadores y polilínea
        this.streetMapService.updateRoute(photos, (photo) => {
          this.selectedPhoto = photo;
          this.streetViewService.showStreetView(photo);
        });

        // Además, cargar casas en la misma área y dibujarlas con icono de casa
        if (this.showHouses) {
          this.houseSearchService.getHousesByCoordinates(coordinates).subscribe({
            next: (houses) => {
              // Abrir el anuncio al hacer click
              this.streetMapService.addHouseMarkers(houses, (house) => {
                // Abrir la URL del listado en una pestaña nueva
                try { window.open(house.url, '_blank'); } catch (e) { console.log('Open house URL', e); }
              });
            },
            error: (err) => {
              console.error('Error cargando houses:', err);
            }
          });
        }

        if (photos.length > 0) {
          this.selectedPhoto = photos[0];
          console.log('✅ PASO 7: Foto seleccionada asignada:', this.selectedPhoto);
          console.log('📤 PASO 8: Enviando al StreetViewService...');
          this.streetViewService.showStreetView(this.selectedPhoto);
          console.log('✅ PASO 9: ¡Foto enviada al servicio exitosamente!');
        } else {
          console.log('❌ PASO 7: No se encontraron fotos');
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
    this.streetMapService.clear();
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