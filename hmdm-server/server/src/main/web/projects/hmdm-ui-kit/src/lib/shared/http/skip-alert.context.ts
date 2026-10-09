import { HttpContextToken } from '@angular/common/http';

export const SKIP_ALERT = new HttpContextToken<boolean>(() => false);
