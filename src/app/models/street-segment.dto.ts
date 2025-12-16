import { CoordinatesDTO } from './coordinates.dto';
import { PhotoDTO } from './photo.dto';

export interface StreetSegmentDTO {
    id: string;
    startPoint: CoordinatesDTO;
    endPoint: CoordinatesDTO;
    photos: PhotoDTO[];
    streetName: string;
    direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
}