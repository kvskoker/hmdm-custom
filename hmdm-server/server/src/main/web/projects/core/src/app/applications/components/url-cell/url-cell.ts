import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { TVersionDTO } from '../../../entity/application/types/version-dto.type';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';

@Component({
  selector: 'core-url-cell',
  templateUrl: './url-cell.html',
  styleUrl: './url-cell.scss',
  imports: [],
})
export class UrlCell extends BaseCellRenderer<TVersionDTO | TApplicationDTO> implements OnInit {
  urlArm64: WritableSignal<string | null> = signal(null);
  urlArmeabi: WritableSignal<string | null> = signal(null);
  url: WritableSignal<string | null> = signal(null);

  ngOnInit(): void {
    this.urlArm64.set(this.params().data.urlArm64 || null);
    this.urlArmeabi.set(this.params().data.urlArmeabi || null);
    this.url.set(this.params().data.url || null);
  }

  isSplitApk(): boolean {
    return this.params().data.split;
  }
}
