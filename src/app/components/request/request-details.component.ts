import { Component, Input } from '@angular/core';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-request-details',
  imports: [],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css'
})
export class RequestDetailsComponent {
  @Input() registration: any;
  @Input() i18n!: I18nService;
}
