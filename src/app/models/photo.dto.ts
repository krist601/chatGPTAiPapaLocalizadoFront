import { CoordinatesDTO } from './coordinates.dto';

export interface PhotoDTO {
    id: string;
    url: string;
    is360: boolean; // Indica si es una foto 360
    coordinates: CoordinatesDTO;
    timestamp: Date;
    direction: number; // Dirección de la cámara en grados (0-360)
    pitch?: number; // Inclinación vertical para fotos 360
    yaw?: number; // Rotación horizontal inicial para fotos 360
    panoramaType?: 'equirectangular' | 'cubemap' | 'multires' | 'regular';
    metadata: {
        resolution: string;
        camera: string;
        streetName?: string;
        description?: string;
        quality?: 'low' | 'medium' | 'high' | 'ultra';
        fileSize?: string;
    };
}