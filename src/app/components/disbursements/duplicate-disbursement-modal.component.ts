import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-duplicate-disbursement-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" [class.d-none]="!isVisible">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-copy me-2"></i>
              {{ i18n.t('disbursements.duplicate.title') }}
            </h5>
            <button type="button" class="btn-close" (click)="onCancel()"></button>
          </div>
          <div class="modal-body">
            <p class="mb-3">{{ i18n.t('disbursements.duplicate.intro') }}</p>

            <div class="steps-explanation">
              <div class="step-item mb-3">
                <div class="d-flex align-items-start">
                  <div class="step-number me-3">
                    <span class="badge bg-primary rounded-circle">1</span>
                  </div>
                  <div>
                    <strong>{{ i18n.t('disbursements.duplicate.step1Title') }}</strong>
                    <p class="mb-0 text-muted small">
                      {{ i18n.t('disbursements.duplicate.step1Desc') }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="step-item mb-3">
                <div class="d-flex align-items-start">
                  <div class="step-number me-3">
                    <span class="badge bg-primary rounded-circle">2</span>
                  </div>
                  <div>
                    <strong>{{ i18n.t('disbursements.duplicate.step2Title') }}</strong>
                    <p class="mb-0 text-muted small">
                      {{ i18n.t('disbursements.duplicate.step2Desc') }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="step-item mb-3">
                <div class="d-flex align-items-start">
                  <div class="step-number me-3">
                    <span class="badge bg-primary rounded-circle">3</span>
                  </div>
                  <div>
                    <strong>{{ i18n.t('disbursements.duplicate.step3Title') }}</strong>
                    <p class="mb-0 text-muted small">
                      {{ i18n.t('disbursements.duplicate.step3Desc') }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="step-item">
                <div class="d-flex align-items-start">
                  <div class="step-number me-3">
                    <span class="badge bg-primary rounded-circle">4</span>
                  </div>
                  <div>
                    <strong>{{ i18n.t('disbursements.duplicate.step4Title') }}</strong>
                    <p class="mb-0 text-muted small">
                      {{ i18n.t('disbursements.duplicate.step4Desc') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="alert alert-info mt-3 mb-0">
              <i class="bi bi-info-circle me-2"></i>
              {{ i18n.t('disbursements.duplicate.note') }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              {{ i18n.t('common.cancel') }}
            </button>
            <button type="button" class="btn btn-primary" (click)="onConfirm()">
              <i class="bi bi-arrow-right me-2"></i>
              {{ i18n.t('disbursements.duplicate.continue') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" *ngIf="isVisible" (click)="onCancel()"></div>
  `,
  styles: [`
    .modal.show.d-block {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .step-number .badge {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .steps-explanation {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 0.375rem;
    }
    .step-item:not(:last-child) {
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #dee2e6;
    }
  `]
})
export class DuplicateDisbursementModalComponent {
  @Input() isVisible = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor(public i18n: I18nService) {}

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
