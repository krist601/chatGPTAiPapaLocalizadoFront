# Angular Street View - Project Context

## 📋 General Description
Google Street View-style web application developed in Angular that allows visualizing an interactive map and navigating through geolocated 360° photographs. Users can click on the map to see photographs of the location and explore them in an immersive viewer.

## 🚀 Current Status & Key Features
**Project Version**: 1.0.0 (Release)
**Status**: ✅ Fully Functional

### Core Features
- **Interactive Map**: Real Leaflet map with OpenStreetMap tiles.
- **360° Street View**: Full panoramic viewer using `Pannellum.js`.
- **Hybrid Navigation**: Support for both standard images and 360° panoramas.
- **Responsive Design**: Mobile-first approach, works on Desktop, Tablet, and Mobile.
- **Contextual Info**: Informative location badges and "Explore" functionality.

### 360° Viewer Capabilities
- **Controls**: Zoom (scroll/buttons), Pan (drag/buttons), Fullscreen.
- **Keyboard Navigation**: Arrows to move/rotate, +/- to zoom.
- **Visuals**: High-resolution 4096x2048 textures.

---

## 🏗️ Architecture

### Folder Structure
```
angular-street-view/
├── src/
│   ├── app/
│   │   ├── components/          # UI Components
│   │   │   ├── map/            # Interactive Leaflet map
│   │   │   ├── street-view/    # 360° Panorama viewer
│   │   │   └── navigation/     # UI controls
│   │   ├── services/           # Business Logic
│   │   │   ├── map.service.ts
│   │   │   ├── street-view.service.ts
│   │   │   └── geolocation.service.ts
│   │   ├── models/             # Data Models (DTOs)
│   │   │   ├── photo.dto.ts
│   │   │   └── coordinates.dto.ts
│   │   └── ...
│   ├── assets/                 # Static Resources (Icons, etc.)
│   └── environments/           # Config
```

### Key Architectural Decisions
1.  **Single 360° Photo per Location**: To simplify the UX, each map marker corresponds to exactly one high-quality 360° panorama (removed the confusing multi-photo/random logic).
2.  **Service-Based State**: `StreetViewService` manages the active photo state using `BehaviorSubject`.
3.  **Lazy Loading**: The 360 viewer (Pannellum) initializes only when "Explore" is clicked to save resources.

---

## 🛠️ Technical Details

### Tech Stack
- **Framework**: Angular 17+
- **Language**: TypeScript
- **Map Engine**: Leaflet (with OpenStreetMap tiles)
- **360 Engine**: Pannellum
- **Styles**: SCSS / Modern CSS (Glassmorphism, Animations)

### Critical Configurations
**Leaflet Tile Fix** (Solves alignment/render issues):
```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  tileSize: 256,
  zoomOffset: 0,
  detectRetina: true,
  updateWhenZooming: false,
  updateWhenIdle: true,
  keepBuffer: 2
})
```

**Pannellum Config**:
- `friction`: 0.15 (Smooth movement)
- `hfov`: 100 (Field of view)
- `autoLoad`: true

### Data Models
**PhotoDTO**:
```typescript
interface PhotoDTO {
  id: string;
  url: string;
  is360: boolean;           // Identifies panoramic content
  coordinates: CoordinatesDTO;
  direction: number;
  metadata: {
     resolution: string;
     streetName?: string;
  };
}
```

---

## 📸 360° Image Collection
The project currently uses a curated list of high-quality panoramas for demonstration:

1.  **Baltimore Museum of Art - Main Hall**
    *   `https://pannellum.org/images/bma-0.jpg`
2.  **Gallery Wing**
    *   `https://pannellum.org/images/bma-1.jpg`
3.  **Modern Art Section**
    *   `https://pannellum.org/images/bma-2.jpg`
4.  **Classical Wing**
    *   `https://pannellum.org/images/bma-3.jpg`
5.  **Contemporary Gallery**
    *   `https://pannellum.org/images/bma-4.jpg`
6.  **Sculpture Hall**
    *   `https://pannellum.org/images/bma-5.jpg`
7.  **Cerro Toco Observatory (Chile)**
    *   `https://pannellum.org/images/cerro-toco-0.jpg`
8.  **Nature Canopy**
    *   `https://pannellum.org/images/from-tree.jpg`
9.  **ALMA Observatory**
    *   `https://pannellum.org/images/alma.jpg`
10. **City Center (A-Frame Demo)**
    *   `https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.jpg`

---

## � Development Setup

### Commands
```bash
ng serve          # Start dev server (http://localhost:4200)
ng build          # Build for production
ng test           # Run unit tests
```

### Previous Fixes (Reference)
- **Explore Button**: Fixed logic where clicking "Explore" didn't trigger the viewer load.
- **Tile Alignment**: Fixed OpenStreetMap tiles looking blurry or misaligned via Leaflet config.
