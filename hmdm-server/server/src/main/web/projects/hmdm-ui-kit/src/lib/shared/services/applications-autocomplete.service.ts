import { BaseAutocompleteService } from '../base/base-autocomplete.service';
import { TAutocompleteResponse } from '../types/autocomplete-response.type';

export class ApplicationsAutocompleteService extends BaseAutocompleteService<TAutocompleteResponse> {
  constructor(
    private valueParam: keyof TAutocompleteResponse = 'name',
    private labelParam: keyof TAutocompleteResponse = 'name',
  ) {
    super('rest/private/applications/autocomplete', {
      valueParam: valueParam,
      labelParam: labelParam,
    });
  }
}
