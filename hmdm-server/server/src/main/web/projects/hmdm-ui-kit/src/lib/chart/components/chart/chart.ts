import { Component, input, InputSignal } from '@angular/core';
import { ChartConfiguration, ChartType, Plugin } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

/**
 * A reusable chart component that supports different chart types from Chart.js
 *
 * @example
 * <hmdm-chart
 *   [chartType]="'bar'"
 *   [data]="myChartData"
 *   [options]="myChartOptions"
 *   [showLegend]="true">
 * </hmdm-chart>
 */
@Component({
  selector: 'hmdm-chart',
  imports: [BaseChartDirective],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class Chart {
  /** Type of chart to display (bar, line, pie, doughnut, etc.) */
  chartType: InputSignal<ChartType> = input.required<ChartType>();

  /** Chart data including labels and datasets */
  data: InputSignal<ChartConfiguration['data']> = input.required<ChartConfiguration['data']>();

  /** Chart configuration options */
  options: InputSignal<ChartConfiguration['options']> = input<ChartConfiguration['options']>({
    responsive: true,
    maintainAspectRatio: false,
  });

  /** Whether to show the legend */
  showLegend: InputSignal<boolean> = input<boolean>(true);

  /** Chart plugins to use */
  plugins: InputSignal<Plugin[]> = input<Plugin[]>([]);

  height: InputSignal<number | string> = input<number | string>('400px');
}
