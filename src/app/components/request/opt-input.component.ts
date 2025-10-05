import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-opt-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './opt-input.component.html',
  styleUrls: ['./opt-input.component.css'] // <-- Correction ici
})
export class OptInputComponent {
  @Input() control!: FormControl;
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() helpText: string = '';
  @Input() validationMessage: string = '';
  @Input() required: boolean = false;
  @Input() maxlength: number = 6;
  @Input() inputId: string = 'code';
}