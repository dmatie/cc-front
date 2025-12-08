import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import { LocalizedFieldPipe } from '../../core/utils/localized-field.pipe';

@Component({
  selector: 'app-request-details',
  imports: [CommonModule, LocalizedFieldPipe],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css'
})
export class RequestDetailsComponent {
  @Input() registration: any;
  @Input() i18n!: I18nService;
}
