import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Directive,
  ElementRef,
  EnvironmentInjector,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Directive({
  selector: '[hmdmLoader]',
  standalone: true,
})
export class LoaderDirective implements OnChanges, OnDestroy {
  @Input() hmdmLoader: boolean = false;
  @Input() loaderSize: number = 80;
  @Input() loaderColor: string = 'primary';
  @Input() minDisplayDuration: number = 300;

  private loaderElement: HTMLElement | null = null;
  private spinnerComponentRef: ComponentRef<MatProgressSpinner> | null = null;
  private showTimestamp: number | null = null;
  private hideTimeout: any = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private injector: EnvironmentInjector,
    private appRef: ApplicationRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hmdmLoader']) {
      if (this.hmdmLoader) {
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
          this.hideTimeout = null;
        }
        this.showLoader();
      } else {
        this.hideLoaderWithDelay();
      }
    }
  }

  private showLoader(): void {
    if (this.loaderElement) {
      return;
    }

    this.showTimestamp = Date.now();

    const hostElement = this.el.nativeElement;
    const position = window.getComputedStyle(hostElement).position;

    if (position === 'static') {
      this.renderer.setStyle(hostElement, 'position', 'relative');
    }

    this.loaderElement = this.renderer.createElement('div');
    this.renderer.addClass(this.loaderElement, 'hmdm-loader-overlay');

    this.spinnerComponentRef = createComponent(MatProgressSpinner, {
      environmentInjector: this.injector,
    });

    this.spinnerComponentRef.instance.diameter = this.loaderSize;
    this.spinnerComponentRef.instance.color = this.loaderColor as any;
    this.spinnerComponentRef.instance.mode = 'indeterminate';

    this.appRef.attachView(this.spinnerComponentRef.hostView);

    const spinnerElement = this.spinnerComponentRef.location.nativeElement;
    this.renderer.appendChild(this.loaderElement, spinnerElement);

    this.renderer.appendChild(hostElement, this.loaderElement);
  }

  private hideLoaderWithDelay(): void {
    if (!this.loaderElement || !this.showTimestamp) {
      return;
    }

    const elapsedTime = Date.now() - this.showTimestamp;
    const remainingTime = Math.max(0, this.minDisplayDuration - elapsedTime);

    this.hideTimeout = setTimeout(() => {
      this.hideLoader();
      this.hideTimeout = null;
    }, remainingTime);
  }

  private hideLoader(): void {
    if (this.loaderElement) {
      this.renderer.removeChild(this.el.nativeElement, this.loaderElement);
      this.loaderElement = null;
    }

    if (this.spinnerComponentRef) {
      this.appRef.detachView(this.spinnerComponentRef.hostView);
      this.spinnerComponentRef.destroy();
      this.spinnerComponentRef = null;
    }

    this.showTimestamp = null;
  }

  ngOnDestroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.hideLoader();
  }
}
