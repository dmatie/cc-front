import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../services/i18n.service';

@Pipe({
  name: 'localizedField',
  pure: false,
  standalone: true
})
export class LocalizedFieldPipe implements PipeTransform {
  constructor(private i18nService: I18nService) {}

  transform(obj: any, baseFieldName: string): string {
    if (!obj) {
      return '';
    }
    return this.i18nService.getLocalizedField(obj, baseFieldName);
  }
}