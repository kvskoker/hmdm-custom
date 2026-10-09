import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Chart } from 'hmdm-ui-kit';
import { ArraySumPipe } from '../../../shared/pipes/array-sum.pipe';
import { STACKED_BAR_CHART_OPTIONS } from '../../const/stacked-bar-chart-options';
import { DashboardFacadeService } from '../../services/dashboard-facade.service';

@Component({
  selector: 'core-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [TranslatePipe, Chart, ArraySumPipe],
  providers: [DashboardFacadeService],
})
export class Dashboard {
  dashboardFacadeService = inject(DashboardFacadeService);
  options = STACKED_BAR_CHART_OPTIONS;
}
