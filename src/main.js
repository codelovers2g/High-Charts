/**
 * Zenith Charting Platform - Enterprise API
 * Main entry point for the charting engine.
 */

import Highcharts from 'highcharts/highstock';
import { ChartEngine } from './core/ChartEngine.js';
import './styles/charts.css';

const chartManager = {
  instances: new Map(),
  currentOptions: null,
  lineChartData: null
};

/**
 * Initializes a new chart instance
 */
export function CreateChart(series, containerId, isScrollable, isVolume, isCompare, symbol, selectedRange, dateRange) {
  // Store global data for restoration (mirroring original behavior but cleaner)
  const lineSeries = series.find(s => s.type === 'line' && !s.isCompare);
  if (lineSeries) {
    chartManager.lineChartData = lineSeries.data;
  }

  let engine = chartManager.instances.get(containerId);
  if (engine) {
    engine.destroy();
  }

  engine = new ChartEngine(containerId);
  engine.create(series, {
    isScrollable,
    isCompare,
    symbol,
    selectedRange,
    dateRange
  });

  chartManager.instances.set(containerId, engine);
  chartManager.instances.set(symbol, engine); // Also store by symbol for back-compat
}

/**
 * Serializes chart state for persistence
 */
export async function getJsonObject(id) {
  const engine = chartManager.instances.get(id);
  if (!engine || !engine.chart) return null;

  const chart = engine.chart;
  const options = JSON.parse(JSON.stringify(chart.userOptions));
  
  // Clean up data for transport
  options.series.forEach(s => {
    s.data = s.type === 'flags' ? s.data : null;
  });

  options.xAxinMin = chart.xAxis[0].min;
  options.xAxinMax = chart.xAxis[0].max;

  return JSON.stringify(options);
}

/**
 * Restores a chart from a serialized state
 */
export async function restoreChart(id, serializedOptions, containerId) {
  const engine = chartManager.instances.get(id);
  if (!engine) return "Error: Instance not found";

  const options = JSON.parse(serializedOptions);
  
  // Re-hydrate data
  options.series.forEach(s => {
    if (s.type !== 'flags') {
      s.data = hydrateData(s.type);
    }
  });

  engine.destroy();
  const newEngine = new ChartEngine(containerId);
  newEngine.chart = Highcharts.stockChart(containerId, options);
  newEngine.chart.xAxis[0].setExtremes(options.xAxinMin, options.xAxinMax);
  
  chartManager.instances.set(containerId, newEngine);
  return "Success";
}

/**
 * Helper to hydrate data based on type
 */
function hydrateData(type) {
  const baseData = chartManager.lineChartData;
  if (!baseData) return [];

  switch (type) {
    case 'line':
      return baseData;
    case 'column':
      return baseData.map(d => [d[0], d[5]]);
    case 'candlestick':
      return baseData.map(d => [d[0], d[2], d[3], d[4], d[1], d[5], d[6], d[7]]);
    default:
      return [];
  }
}
