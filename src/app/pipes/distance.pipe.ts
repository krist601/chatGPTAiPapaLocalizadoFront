import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {
  transform(value: number, unit: string = 'km'): string {
    if (isNaN(value) || value < 0) {
      return 'Invalid distance';
    }

    let distance: string;

    switch (unit) {
      case 'm':
        distance = `${value} meters`;
        break;
      case 'km':
        distance = `${(value / 1000).toFixed(2)} kilometers`;
        break;
      case 'mi':
        distance = `${(value / 1609.34).toFixed(2)} miles`;
        break;
      default:
        distance = `${(value / 1000).toFixed(2)} kilometers`;
    }

    return distance;
  }
}