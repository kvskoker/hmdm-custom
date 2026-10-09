import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {TranslatePipe} from '@ngx-translate/core';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

const PLUGIN_TRANSLATION_KEYS: string[] = [
  'xtra.plugin.kiosk-mode',
  'xtra.plugin.device-location-tracking',
  'xtra.plugin.remote-management',
  'xtra.plugin.upload-photos',
  'xtra.plugin.remote-control',
  'xtra.plugin.traffic-filtering',
  'xtra.plugin.two-factor-authentication',
  'xtra.plugin.export-import-devices',
  'xtra.plugin.device-contacts-management',
  'xtra.plugin.white-label'
];

@Component({
  selector: 'app-xtra',
  imports: [
    MatCardModule,
    TranslatePipe,
    MatDivider,
    MatList,
    MatListItem,
    MatIcon,
    MatButton
  ],
  templateUrl: './xtra.html',
  styleUrl: './xtra.scss',
})
export class Xtra {
  protected readonly PLUGIN_TRANSLATION_KEYS = PLUGIN_TRANSLATION_KEYS;
}
