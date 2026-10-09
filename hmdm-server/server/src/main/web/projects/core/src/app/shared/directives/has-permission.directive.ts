import { Directive, input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[hmdmHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  hmdmHasPermission = input.required<string>();

  private readonly authService = inject(AuthService);

  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
  ) {
    effect(() => {
      const permission = this.hmdmHasPermission();
      this.updateView(permission);
    });
  }

  private updateView(permission: string): void {
    if (this.hasPermission(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }
}
