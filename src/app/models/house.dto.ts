import { CoordinatesDTO } from './coordinates.dto';

export interface HouseDTO {
  id: string;
  latitude: number;
  longitude: number;
  url: string; // enlace del anuncio
  image?: string; // URL de la imagen en miniatura
  coordinates?: CoordinatesDTO;
  metadata?: {
    price?: string;
    title?: string;
    description?: string;
  };
}
