import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'ZenithCharts',
      fileName: (format) => `zenith-charts.${format}.js`,
    },
    rollupOptions: {
      external: ['highcharts'],
      output: {
        globals: {
          highcharts: 'Highcharts',
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
