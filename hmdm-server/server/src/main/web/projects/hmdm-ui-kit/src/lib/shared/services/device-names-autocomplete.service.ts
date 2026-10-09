import { BaseAutocompleteService } from '../base/base-autocomplete.service';

export class DevicesNamesAutocompleteService extends BaseAutocompleteService<{
  id: number;
  name: string;
}> {
  constructor() {
    super('rest/private/devices/autocomplete', { valueParam: 'name', labelParam: 'name' });
  }
}
