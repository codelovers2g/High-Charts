import Highcharts from 'highcharts/highstock';
import { DEFAULT_CHART_OPTIONS } from '../constants/ChartConfig.js';
import { calculateMinDate, formatCurrency } from '../utils/DateUtils.js';

/**
 * Zenith Chart Engine
 * Encapsulates Highcharts logic with enterprise patterns.
 */
export class ChartEngine {
  constructor(containerId) {
    this.containerId = containerId;
    this.chart = null;
    this.instances = new Map();
  }

  //Initializes or updates a chart instance
  create(series, options = {}) {
    const {
      isScrollable = false,
      isCompare = false,
      symbol = 'GENERIC',
      dateRange = null,
      selectedRange = null
    } = options;

    const chartOptions = {
      ...DEFAULT_CHART_OPTIONS,
      chart: {
        ...DEFAULT_CHART_OPTIONS.chart,
        events: {
          render: (event) => this._handleRender(event.target, series, symbol),
        }
      },
      navigator: { enabled: isScrollable },
      scrollbar: { enabled: isScrollable },
      xAxis: {
        ...DEFAULT_CHART_OPTIONS.xAxis,
        min: dateRange ? Date.parse(dateRange.startDate) : calculateMinDate(selectedRange),
        max: dateRange ? Date.parse(dateRange.endDate) : Date.now()
      },
      plotOptions: {
        ...DEFAULT_CHART_OPTIONS.plotOptions,
        series: {
          ...DEFAULT_CHART_OPTIONS.plotOptions.series,
          compare: isCompare ? 'percent' : false
        }
      },
      tooltip: {
        ...DEFAULT_CHART_OPTIONS.tooltip,
        formatter: function() {
          return ChartEngine.generateTooltipHTML(this);
        }
      },
      series
    };

    this.chart = Highcharts.stockChart(this.containerId, chartOptions);
    return this.chart;
  }

  /**
   * Internal render handler for custom UI elements
   */
  _handleRender(chart, series, symbol) {
    const mainSeries = chart.series.find(s => s.type === 'line' || s.type === 'candlestick');
    if (!mainSeries) return;

    const currentPrice = mainSeries.yData[mainSeries.yData.length - 1];
    // Price might be an array [O,H,L,C] for candlestick or a number for line
    const priceValue = Array.isArray(currentPrice) ? currentPrice[3] : currentPrice;
    
    this._updatePriceOverlay(chart, symbol, priceValue);
  }

  /**
   * Updates the floating price overlay
   */
  _updatePriceOverlay(chart, name, price) {
    let overlay = chart.container.querySelector('.stock-price-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'stock-price-overlay';
      chart.container.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="price-name">${name}</div>
      <div class="price-value">${formatCurrency(price)}</div>
    `;
  }

  /**
   * Static helper for generating professional tooltips
   */
  static generateTooltipHTML(context) {
    const points = context.points || [context.point];
    const mainPoint = points.find(p => p.series.type === 'line' || p.series.type === 'candlestick') || points[0];
    
    // In stock charts with data grouping, data is stored differently
    const dataIndex = mainPoint.dataGroup ? mainPoint.dataGroup.start : mainPoint.index;
    const rawData = mainPoint.series.userOptions.data[dataIndex];

    let content = `
      <div class="custom-tooltip">
        <div class="stock-header">${mainPoint.series.name}</div>
    `;

    if (mainPoint.series.type === 'candlestick' || mainPoint.series.type === 'line') {
      const [ts, open, high, low, close, volume] = rawData;
      
      content += `
        <div class="metric-row">
          <span class="metric-label">Open</span>
          <span class="metric-value">${formatCurrency(open)}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">High</span>
          <span class="metric-value">${formatCurrency(high)}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Low</span>
          <span class="metric-value">${formatCurrency(low)}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Close</span>
          <span class="metric-value">${formatCurrency(close)}</span>
        </div>
        <div class="metric-row" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
          <span class="metric-label">Volume</span>
          <span class="metric-value">${volume?.toLocaleString() || 'N/A'}</span>
        </div>
      `;
    } else if (mainPoint.series.type === 'flags') {
      content += `
        <div class="metric-row">
          <span class="metric-label">${mainPoint.point.title === 'D' ? 'Dividend' : 'Split'}</span>
          <span class="metric-value">${mainPoint.point.text}</span>
        </div>
      `;
    }

    content += `</div>`;
    return content;
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
