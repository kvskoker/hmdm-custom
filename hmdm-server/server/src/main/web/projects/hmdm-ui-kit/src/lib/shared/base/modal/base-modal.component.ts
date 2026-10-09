import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from 'app/shared/base/component';
import { ModalRef } from 'app/shared/base/modal/modal-ref';
import { ModalService } from 'app/shared/services/modal/modal.service';

@Component({
  selector: 'syncro-base-modal',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class BaseModalComponent extends BaseComponent {
  private modalRef = inject(ModalRef);
  private modalService = inject(ModalService);

  get id(): string {
    return this.modalRef.id;
  }

  closeModal(): void {
    this.modalService.closeModal(this.id);
  }

  submitModal(data: unknown): void {
    this.modalRef.close(data);
  }
}
