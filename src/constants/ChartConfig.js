/**
 * Enterprise Chart Configurations
 * Defines the standard look and feel for all charts in the Zenith Platform.
 */

export const DEFAULT_CHART_OPTIONS = {
  chart: {
    styledMode: false, // We'll use a mix of JS and CSS
    backgroundColor: 'transparent',
    spacing: [20, 20, 20, 20],
    borderRadius: 12
  },
  
  rangeSelector: {
    enabled: false
  },
  
  credits: {
    enabled: false
  },
  
  scrollbar: {
    enabled: false,
    barBackgroundColor: 'rgba(255,255,255,0.05)',
    trackBackgroundColor: 'transparent',
    buttonBackgroundColor: 'transparent'
  },
  
  navigator: {
    enabled: false,
    outlineColor: 'rgba(255,255,255,0.1)',
    maskFill: 'rgba(56, 189, 248, 0.05)'
  },

  xAxis: {
    gridLineWidth: 0,
    lineColor: 'rgba(255,255,255,0.1)',
    tickColor: 'rgba(255,255,255,0.1)',
    labels: {
      style: {
        color: '#94a3b8',
        fontSize: '11px'
      }
    }
  },

  yAxis: {
    gridLineColor: 'rgba(255,255,255,0.05)',
    gridLineDashStyle: 'Dash',
    labels: {
      align: 'right',
      x: -10,
      style: {
        color: '#94a3b8',
        fontSize: '11px'
      }
    },
    opposite: true
  },

  plotOptions: {
    series: {
      dataGrouping: {
        enabled: false
      },
      states: {
        inactive: {
          opacity: 1
        }
      }
    },
    candlestick: {
      color: '#ef4444',
      upColor: '#22c55e',
      lineColor: '#ef4444',
      upLineColor: '#22c55e'
    }
  },

  tooltip: {
    enabled: true,
    shared: true,
    useHTML: true,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadow: false,
    padding: 0
  }
};
