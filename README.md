# ChatGPT Ai Papa Localizado Front

This project is an Angular application that simulates a street view experience similar to Google Street View. Users can interact with a map, click on locations to view associated photos, and navigate along the street.

## Project Structure

The project is organized as follows:

```
chatGPTAiPapaLocalizadoFront
├── src
│   ├── app
│   │   ├── components
│   │   │   ├── map
│   │   │   │   ├── map.component.ts
│   │   │   │   ├── map.component.html
│   │   │   │   └── map.component.css
│   │   │   ├── street-view
│   │   │   │   ├── street-view.component.ts
│   │   │   │   ├── street-view.component.html
│   │   │   │   └── street-view.component.css
│   │   │   └── navigation
│   │   │       ├── navigation.component.ts
│   │   │       ├── navigation.component.html
│   │   │       └── navigation.component.css
│   │   ├── services
│   │   │   ├── map.service.ts
│   │   │   ├── geolocation.service.ts
│   │   │   └── street-view.service.ts
│   │   ├── models
│   │   │   ├── photo.dto.ts
│   │   │   ├── coordinates.dto.ts
│   │   │   └── street-segment.dto.ts
│   │   ├── pipes
│   │   │   └── distance.pipe.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── assets
│   │   └── icons
│   ├── environments
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles.css
├── package.json
├── angular.json
├── tsconfig.json
└── README.md
```

## Features

- **Map Component**: Displays the map and handles user interactions to show photos.
- **Street View Component**: Displays photos associated with clicked locations on the map.
- **Navigation Component**: Provides controls for navigating along the street.
- **Geolocation Service**: Retrieves the user's current location.
- **Photo DTO**: Represents photos with geolocation and descriptions.
- **Coordinates DTO**: Represents geographical coordinates.
- **Street Segment DTO**: Represents segments of the street with associated photos.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd chatGPTAiPapaLocalizadoFront
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.