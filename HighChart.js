import 'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js';
import "https://code.highcharts.com/stock/highstock.js";
import "https://code.highcharts.com/stock/modules/exporting.js";
import "https://code.highcharts.com/modules/data.js";
import "https://code.highcharts.com/modules/exporting.js";
import "https://code.highcharts.com/modules/export-data.js";
import "https://code.highcharts.com/modules/accessibility.js";
import "https://rawgit.com/highcharts/rounded-corners/master/rounded-corners.js";


var chartOptions;
var chartReferenceArray = [];
var chartReference;
var chartLineChartData;

export function CreateChart(seriesobject, id, _isscrollchart, _isvolumechart, _iscomparechart, StockSymbol, SelectedRange, DateRange) {
    var startingValue = 0;
    for (var i = 0; i < seriesobject.length; i++) {

        if ((seriesobject[i].type === 'line' || seriesobject[i].type === 'candlestick') && seriesobject[i].isCompare === false) {
            startingValue = seriesobject[i].data[0][1];
        }
    }
    var stocknameandinitalvalue = [];

    chartOptions =
    {
        chart:
        {
            styledMode: true,
            events: {
                render: function () {
                    var price = 0;
                    var name = '';
                    this.series.filter(s => {
                        if (s.type === 'line' || s.type === 'candlestick') {
                            startingValue = s.yData[0];
                            price = s.yData[s.yData.length - 1][3];
                            console.log(s.userOptions.name[0]);
                            name = s.userOptions.name[0];
                        }
                    });
                    onChartRender(this, id, price, name);
                },
                load: function () {

                }
            },
            borderRadius: 0
        },

        rangeSelector:
        {
            enabled: false
        },

        navigator:
        {
            enabled: _isscrollchart,
            xAxis: {
                labels: {
                    y: -8
                }
            }
        },

        scrollbar:
        {
            enabled: _isscrollchart
        },

        xAxis:
        {
            className: 'highcharts-xcolor-0',
            ordinal: true,
            minRange: 1,
            crosshair: false,
            tickLength: 5,
            min: DateRange != null ? Date.parse(DateRange.startDate) : SetMin(SelectedRange),
            max: DateRange != null ? Date.parse(DateRange.endDate) : new Date().getTime(),
            events: {
                afterSetExtremes: function (event) {
                    if (_iscomparechart) {
                        stocknameandinitalvalue = [];
                        for (var i = 0; i < this.series.length; i++) {
                            var stocknameandinitalvalueobj = {
                                "name": this.series[i].name,
                                "initialvalue": this.series[i].processedYData[1]
                            };
                            stocknameandinitalvalue.push(stocknameandinitalvalueobj);
                        }
                    }
                }
            }
        },

        plotOptions:
        {
            series:
            {
                compare: _iscomparechart == true ? 'percent' : false
            }
        },
        yAxis: [
            {
                /*  className: 'highcharts-ycolor-0',*/
                labels:
                {
                    align: 'left',
                    x: 5
                },
                crosshair: {
                    label: {
                        enabled: true,
                        formatter: function (value) {
                            return `<span>${value.toFixed(2)}</span>`;
                        }
                    }
                },
                resize: {
                    enabled: true
                },
                opposite: true,
                tickAmount: 8,
                alignTicks: false,
                gridLineWidth: 1,
                gridZIndex: 3
            },

            {
                labels:
                {
                    align: 'right',
                },
                opposite: true,
                alignTicks: false,
                visible: false
            }
        ],

        tooltip: {
            /*headerFormat: '',*/
            enabled: true,
            shared: true,
            shape: 'rect',
            useHTML: true,
            pointFormatter: function () {
                var points = this;
                var pointIndex = points.index;
                var SelectedIndex = points.dataGroup != undefined ? points.dataGroup.start : points.index;
                var volume = points.series.userOptions.data[SelectedIndex][5];
                var per = points.series.userOptions.data[SelectedIndex][6] * 100;
                var obj = stocknameandinitalvalue.find(o => o.name === points.series.name);
                var ReferenceValue = obj != undefined ? obj.initialvalue : '';
                var percantage = ReferenceValue != '' ? (points.series.userOptions.data[SelectedIndex][1] - ReferenceValue) / ReferenceValue * 100 : null;
                var settopoint = percantage != null ? percantage : per;
                var dataLength = points.series.userOptions.data.length;
                var stockPrice = points.series.userOptions.data[dataLength - 1][4];
                if (points.series.userOptions.type == "candlestick" || points.series.userOptions.type == "line") {
                    return `<div class="custom-tooltip">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>Open</span>
                                            <span class="text-end">${(points.series.userOptions.data[SelectedIndex][1]).toFixed(2).toLocaleString('en-US')}</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>High</span>
                                            <span class="text-end">${(points.series.userOptions.data[SelectedIndex][2]).toFixed(2).toLocaleString('en-US')}</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Low</span>
                                            <span class="text-end">${(points.series.userOptions.data[SelectedIndex][3]).toFixed(2).toLocaleString('en-US')}</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Close</span>
                                            <span class="text-end">${(points.series.userOptions.data[SelectedIndex][4]).toFixed(2).toLocaleString('en-US')}</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Volume</span>
                                            <span class="text-end">${volume.toLocaleString('en-US')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                }
                else if (points.series.userOptions.type == "column") {
                    return "";
                }
                else if (points.series.userOptions.type == "flags") {
                    var displayvalue = points.title == "D" ? "Dividend" : "Split Ratio";
                    return `<div class="custom-tooltip custom-tooltip-flag">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <span>${displayvalue}</span>
                                            <span class="text-end">${points.text}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                }
                else {
                    return "";
                }
            },
            positioner: function (width, height, point) {
                var chart = this.chart,
                    position;
                if (point.isHeader) {
                    position = {
                        x: Math.max(
                            // Left side limit
                            0,
                            Math.min(
                                point.plotX + chart.plotLeft - width / 2,
                                // Right side limit
                                chart.chartWidth - width - chart.marginRight
                            )
                        ),
                        y: point.plotY
                    };
                } else {
                    if (point.series == undefined) {
                        position = {
                            //x: point.plotX,
                            //y: point.plotY - chart.plotTop + 50
                            x: chart.plotLeft,
                            y: chart.plotTop + 50
                        };
                    }
                    else {
                        position = {
                            x: point.series.chart.plotLeft,
                            y: point.series.yAxis.top - chart.plotTop + 50
                        };
                    }
                }
                return position;
            },
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                states: {
                    inactive: {
                        opacity: 1
                    }
                },
                dataGrouping: {
                    enabled: false
                },
                compare: _iscomparechart == true ? 'percent' : false,
            },

        },
        series: seriesobject,
    }

    chartReference = Highcharts.stockChart(id, chartOptions);

    if (chartOptions.series.find(x => x.type === 'line')) {
        chartLineChartData = chartOptions.series.find(x => x.type === 'line' && x.isCompare == false).data;
    }
    const index = chartReferenceArray.findIndex((e) => e.id === StockSymbol);
    if (index === -1) {
        chartReferenceArray.push({ id: StockSymbol, chartref: chartReference });
    } else {
        chartReferenceArray[index] = { id: StockSymbol, chartref: chartReference };
    }
}

function onChartRender(chartRef, id, price, name) {
    injectStockPrice(chartRef, id, price, name);
    bindMouseEventChartPoints(chartRef, id);
}

export async function getJsonObject(id) {
    const index = chartReferenceArray.findIndex((e) => e.id === id);
    if (index !== -1) {
        var option = JSON.parse(JSON.stringify(chartOptions));
        option.series = [];
        chartReferenceArray[index].chartref.series.filter(s => {
            if (s.type !== 'areaspline') {

                option.series.push(s.userOptions)
            }
        });
        option.xAxinMin = chartReferenceArray[index].chartref.xAxis[0].min;
        option.xAxinMax = chartReferenceArray[index].chartref.xAxis[0].max;
    }
    option.series.forEach(x => {
        x.data = x.type != 'flags' ? null : x.data;
    });
    return JSON.stringify(option);
}

export async function restoreChart(id, chartOption, chartId) {
    const index = chartReferenceArray.findIndex((e) => e.id === id);
    if (index !== -1) {
        var option = JSON.parse(chartOption);
        option.series.forEach(x => {
            var retrievData = x.type != 'flags' ? setDataAccordingToState(x.type) : x.data;
            x.data = retrievData;
        });
        chartReferenceArray[index].chartref.destroy();
        chartReferenceArray[index].chartref = Highcharts.stockChart(chartId, option);
        chartReferenceArray[index].chartref.xAxis[0].setExtremes(option.xAxinMin, option.xAxinMax);
    }
    return "Success";
}

function setDataAccordingToState(chartType) {
    if (chartType == 'line') {
        return chartLineChartData;
    }
    else if (chartType == 'column') {
        let columnData = [];
        for (var i = 0; i < chartLineChartData.length; i++) {
            let columnNewData = [chartLineChartData[i][0], chartLineChartData[i][5]];
            columnData.push(columnNewData);
        }
        return columnData;
    }
    else if (chartType == 'candlestick') {
        let candleStickData = [];
        for (var i = 0; i < chartLineChartData.length; i++) {
            let columnNewData = [chartLineChartData[i][0], chartLineChartData[i][2], chartLineChartData[i][3], chartLineChartData[i][4], chartLineChartData[i][1], chartLineChartData[i][5], chartLineChartData[i][6], chartLineChartData[i][7]];
            candleStickData.push(columnNewData);
        }
        return candleStickData;
    }
}

function SetMin(SelectedRange) {
    if (SelectedRange.type === 0) {
        return new Date().setFullYear(new Date().getFullYear() - SelectedRange.count)
    }
    else if (SelectedRange.type === 1) {
        return new Date().setMonth(new Date().getMonth() - SelectedRange.count)
    }
    else if (SelectedRange.type === 2) {
        return new Date().setDate(new Date().getDay() - SelectedRange.count)
    }
    else if (SelectedRange.type === 3) {
        return new Date().setMonth(new Date().getMonth() - SelectedRange.count)
    }
}

function injectStockPrice(chartRef, id, price, name) {
    var el = document.createElement('div');
    el.classList.add('stock-price');
    chartRef.container.appendChild(el);
    el.innerHTML = `<div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <span>${name}</span>
                                <span class="text-end">${price}</span>
                            </div>
                        </div>
                    </div>`;
}

function bindMouseEventChartPoints(chartRef, id) {
    var elementRoot = document.getElementById(id);
    var elements = elementRoot.querySelectorAll(`#${id} .highcharts-series, #${id} .highcharts-markers, #${id} .highcharts-flags-series`);

    elementRoot.addEventListener('mouseover', function (event) {
        if (!event.target.classList.contains('highcharts-point')) {
            if (event.target.classList.value != 'highcharts-label-box') {
                if (event.target.classList.value != '') {
                    var tooltipElements = elementRoot.querySelectorAll(".highcharts-tooltip, .highcharts-label .highcharts-tooltip");
                    tooltipElements.forEach(tooltip => {
                        tooltip.style.opacity = 0;
                        if (tooltip.innerHTML == '') {
                            tooltip.remove();
                        }
                    });

                    if (chartRef.options?.tooltip.enabled)
                        chartRef.options.tooltip.enabled = false;
                }
            }
        }
        
    });

    elements.forEach(element => {
        element.addEventListener('mouseover', function (event) {            
            if (event.target.classList.contains('highcharts-point')) {
                if (!chartRef.options?.tooltip.enabled)
                    chartRef.options.tooltip.enabled = true;

                var tooltipElements = elementRoot.querySelectorAll("div.highcharts-tooltip, .highcharts-label .highcharts-tooltip");                
                tooltipElements.forEach(tooltip => {
                    tooltip.style.visibility = '';
                    tooltip.style.opacity = 1;
                });
            }
        });

        element.addEventListener('mouseout', function (event) {
            if (event.target.classList.contains('highcharts-point')) {
                var tooltipElements = elementRoot.querySelectorAll("div.highcharts-tooltip, .highcharts-label .highcharts-tooltip");                
                tooltipElements.forEach(tooltip => {
                    tooltip.style.visibility = 'hidden';
                    tooltip.style.opacity = 0;
                    if (tooltip.innerHTML == '') {
                        tooltip.remove();
                    }
                });
            }
        });
    });

}