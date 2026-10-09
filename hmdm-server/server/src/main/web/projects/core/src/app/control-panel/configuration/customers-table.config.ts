import { Injectable } from '@angular/core';
import { DatetimeCell, TranslateCell, TTableConfig } from 'hmdm-ui-kit';
import { CustomerActionsCell } from '../components/customer-actions-cell/customer-actions-cell';

@Injectable({
  providedIn: 'root',
})
export class CustomersTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'name',
          title: 'table.heading.customer.name',
        },
        {
          field: 'description',
          title: 'table.heading.customer.desc',
        },
        {
          field: 'registrationTime',
          title: 'table.heading.customer.registration.time',
          cellRenderer: DatetimeCell,
          sortable: true,
        },
        {
          field: 'lastLoginTime',
          title: 'table.heading.customer.last.login.time',
          cellRenderer: DatetimeCell,
          sortable: true,
        },
        {
          field: 'accountType',
          title: 'table.heading.customer.type',
        },
        {
          field: 'expiryTime',
          title: 'table.heading.customer.expiry.time',
          cellRenderer: DatetimeCell,
          sortable: true,
        },
        {
          field: 'deviceLimit',
          title: 'table.heading.customer.device.limit',
        },
        {
          field: 'customerStatus',
          title: 'table.heading.customer.status',
          cellRenderer: TranslateCell,
        },
        {
          title: 'table.heading.customer.actions',
          stickyEnd: true,
          width: '200px',
          cellRenderer: CustomerActionsCell,
        },
      ],
      paginator: {
        pageSizeOptions: [10, 20, 50],
        pageSize: 50,
      },
      selector: false,
      trackBy: 'id',
    };
  }
}
