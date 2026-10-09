import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { Plugin } from './app/app';

bootstrapApplication(Plugin, appConfig).catch((err) => console.error(err));
