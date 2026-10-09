import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ConfirmDialog, TTableSortState } from 'hmdm-ui-kit';
import { filter, finalize, switchMap, take, takeUntil } from 'rxjs';
import { CustomerService } from '../../entity/customer/services/customer.service';
import { TCustomerDTO } from '../../entity/customer/types/customer-dto.type';
import { TCustomerSearchRequest } from '../../entity/customer/types/customer-search-request.type';
import { AuthService } from '../../shared/services/auth.service';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { AdminCredentialsDialog } from '../components/admin-credentials-dialog/admin-credentials-dialog';
import { CustomerFormDialog } from '../components/customer-form-dialog/customer-form-dialog';
import { PasswordChangeDialog } from '../components/password-change-dialog/password-change-dialog';
import { TCustomerFormValue } from '../types/customer-form-value.type';
import { TCustomer } from '../types/customer.type';

@Injectable({ providedIn: 'root' })
export class CustomersFacadeService {
  private readonly customerService = inject(CustomerService);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBarService = inject(SnackBarService);

  private readonly _data: WritableSignal<TCustomer[]> = signal([]);
  private readonly _totalItems: WritableSignal<number> = signal(0);

  private pageData: PageEvent = { pageIndex: 0, pageSize: 50, length: 0 };
  private sortData: TTableSortState | null = null;
  private searchTerm: string = '';
  private accountType: number | undefined = undefined;
  private customerStatus: string | undefined = undefined;

  data = this._data.asReadonly();
  totalItems = this._totalItems.asReadonly();
  isLoading: WritableSignal<boolean> = signal(false);

  searchCustomers(): void {
    const body = this.buildRequest();

    this.isLoading.set(true);
    this.customerService
      .search(body)
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this._data.set(response.items || []);
          this._totalItems.set(response.totalItemsCount || 0);
        },
        error: () => {
          this._data.set([]);
        },
      });
  }

  updateSearchTerm(term: string): void {
    this.searchTerm = term;
  }

  updateFilters(accountType: number | undefined, customerStatus: string | undefined): void {
    this.accountType = accountType;
    this.customerStatus = customerStatus;
  }

  updatePage(event: PageEvent): void {
    this.pageData = event;
    this.searchCustomers();
  }

  updateSort(event: TTableSortState | null): void {
    this.sortData = event;
    this.searchCustomers();
  }

  resetPagination(): void {
    this.pageData.pageIndex = 0;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CustomerFormDialog, { minWidth: '600px', data: null });

    dialogRef.componentInstance.saveRequest
      .pipe(takeUntil(dialogRef.afterClosed()))
      .subscribe((result) => {
        this.saveCustomer(null, result, dialogRef);
      });
  }

  openEditDialog(customer: TCustomer): void {
    if (!customer.id) return;

    this.customerService
      .getForUpdate(customer.id)
      .pipe(take(1))
      .subscribe((fullData) => {
        const dialogRef = this.dialog.open(CustomerFormDialog, {
          minWidth: '600px',
          data: fullData,
        });

        dialogRef.componentInstance.saveRequest
          .pipe(takeUntil(dialogRef.afterClosed()))
          .subscribe((result) => {
            this.saveCustomer(fullData, result, dialogRef);
          });
      });
  }

  openPasswordChangeDialog(customer: TCustomer): void {
    this.dialog.open(PasswordChangeDialog, {
      minWidth: '480px',
      data: { customerId: customer.id, customerName: customer.name },
    });
  }

  openDeleteConfirmDialog(customer: TCustomer): void {
    if (!customer.id) return;
    const id = customer.id;

    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.delete.customer',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: { customerName: customer.name },
        },
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.customerService
          .remove(id)
          .pipe(take(1))
          .subscribe(() => this.searchCustomers());
      });
  }

  loginAsCustomer(customer: TCustomer): void {
    if (!customer.id) return;
    const id = customer.id;

    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.impersonate.user',
          confirmButtonText: 'button.login',
          cancelButtonText: 'button.cancel',
          params: { customerName: customer.name },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.customerService.impersonate(id)),
        switchMap((user) => {
          this.authService['_currentUser'].set(user);
          return this.authService.init();
        }),
        switchMap(() => this.authService.getCurrentUser()),
        take(1),
      )
      .subscribe(() => {
        this.router.navigate(['/home']);
      });
  }

  private saveCustomer(
    existingCustomer: TCustomer | null,
    formValue: TCustomerFormValue,
    dialogRef: MatDialogRef<CustomerFormDialog>,
  ): void {
    const isNew = !existingCustomer?.id;

    const expiryTime = formValue.expiryTime ? new Date(formValue.expiryTime).getTime() : null;

    const request: TCustomerDTO = {
      id: existingCustomer?.id,
      name: formValue.name,
      firstName: formValue.firstName || undefined,
      lastName: formValue.lastName || undefined,
      language: formValue.language || undefined,
      email: formValue.email || undefined,
      description: formValue.description || undefined,
      accountType: formValue.accountType ?? undefined,
      customerStatus: formValue.customerStatus ?? undefined,
      expiryTime,
      deviceLimit: formValue.deviceLimit ?? 3,
      sizeLimit: formValue.sizeLimit ?? undefined,
      prefix: formValue.prefix || undefined,
      deviceConfigurationId: formValue.deviceConfigurationId ?? undefined,
      configurationIds: isNew ? formValue.configurationIds : undefined,
      copyDesign: formValue.copyDesign,
    };

    this.customerService
      .save(request)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          if (isNew && result?.adminCredentials) {
            const slashIdx = result.adminCredentials.indexOf('/');
            this.dialog.open(AdminCredentialsDialog, {
              data: {
                login: result.adminCredentials.slice(0, slashIdx),
                password: result.adminCredentials.slice(slashIdx + 1),
              },
              minWidth: '400px',
            });
          }
          dialogRef.close();
          this.searchCustomers();
        },
      });
  }

  private buildRequest(): TCustomerSearchRequest {
    return {
      currentPage: this.pageData.pageIndex + 1,
      pageSize: this.pageData.pageSize || 50,
      searchValue: this.searchTerm || undefined,
      accountType: this.accountType,
      customerStatus: this.customerStatus,
      sortValue: this.sortData?.sortBy || undefined,
      sortDirection: this.sortData?.sortDir as 'asc' | 'desc' | undefined,
    };
  }
}
