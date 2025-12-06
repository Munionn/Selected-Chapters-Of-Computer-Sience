/**
 * Chart.js Mathematical Functions - arccos(x) Series Expansion
 * Demonstrates plotting mathematical functions using Chart.js
 */

let mathChart = null;
let chartData = {
    series: [],
    math: []
};

/**
 * Calculate factorial
 */
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

/**
 * Calculate arccos(x) using series expansion
 * arccos(x) = π/2 - arcsin(x)
 * arcsin(x) = Σ(n=0 to ∞) [(2n)! / (4^n · (n!)^2 · (2n+1))] · x^(2n+1)
 */
function arccosSeries(x, nTerms) {
    if (Math.abs(x) > 1) {
        return NaN; // Domain error
    }
    
    // arccos(x) = π/2 - arcsin(x)
    const piOver2 = Math.PI / 2;
    
    // Calculate arcsin(x) using series
    let arcsin = 0;
    for (let n = 0; n < nTerms; n++) {
        const numerator = factorial(2 * n);
        const denominator = Math.pow(4, n) * Math.pow(factorial(n), 2) * (2 * n + 1);
        const term = (numerator / denominator) * Math.pow(x, 2 * n + 1);
        arcsin += term;
    }
    
    return piOver2 - arcsin;
}

/**
 * Calculate arccos(x) using math.js
 */
function arccosMath(x) {
    try {
        if (typeof math !== 'undefined' && math.acos) {
            return math.acos(x);
        }
        // Fallback to native Math.acos
        return Math.acos(x);
    } catch (e) {
        return Math.acos(x);
    }
}

/**
 * Generate data points for chart
 */
function generateChartData(xMin, xMax, pointsCount, nTerms) {
    const data = {
        labels: [],
        series: [],
        math: [],
        tableData: []
    };
    
    const step = (xMax - xMin) / (pointsCount - 1);
    
    for (let i = 0; i < pointsCount; i++) {
        const x = xMin + i * step;
        const xRounded = Math.round(x * 1000) / 1000; // Round to 3 decimal places
        
        // Calculate using series
        const seriesValue = arccosSeries(x, nTerms);
        
        // Calculate using math.js
        const mathValue = arccosMath(x);
        
        // Store data
        data.labels.push(xRounded.toFixed(2));
        data.series.push(isNaN(seriesValue) ? null : seriesValue);
        data.math.push(isNaN(mathValue) ? null : mathValue);
        
        // Store table data (sample every 10th point for table)
        if (i % Math.max(1, Math.floor(pointsCount / 20)) === 0) {
            const difference = Math.abs(seriesValue - mathValue);
            data.tableData.push({
                x: xRounded,
                series: seriesValue,
                math: mathValue,
                difference: difference,
                n: nTerms
            });
        }
    }
    
    return data;
}

/**
 * Build chart with Chart.js
 */
function buildChart(animate = false) {
    const xMin = parseFloat(document.getElementById('xMin').value) || -1;
    const xMax = parseFloat(document.getElementById('xMax').value) || 1;
    const nTerms = parseInt(document.getElementById('nTerms').value) || 10;
    const pointsCount = parseInt(document.getElementById('pointsCount').value) || 100;
    
    // Validate inputs
    if (xMin < -1 || xMax > 1 || xMin >= xMax) {
        alert('Ошибка: X должен быть в диапазоне [-1, 1] и xMin < xMax');
        return;
    }
    
    // Generate data
    const data = generateChartData(xMin, xMax, pointsCount, nTerms);
    chartData = data;
    
    // Get canvas context
    const ctx = document.getElementById('mathChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (mathChart) {
        mathChart.destroy();
    }
    
    // Create new chart
    mathChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'F(x) - разложение в ряд (n=' + nTerms + ')',
                    data: data.series,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Math.acos(x) - точное значение',
                    data: data.math,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: animate ? {
                duration: 2000,
                easing: 'easeInOutQuart'
            } : {
                duration: 0
            },
            plugins: {
                title: {
                    display: true,
                    text: 'График функции arccos(x)',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(6);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x (аргумент)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 15
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'F(x) = arccos(x)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
    
    // Update table
    updateDataTable(data.tableData);
}

/**
 * Update data table
 */
function updateDataTable(tableData) {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return;
    
    if (tableData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Нет данных</td></tr>';
        return;
    }
    
    let html = '';
    tableData.forEach(function(row, index) {
        html += '<tr>';
        html += '<td>' + (index + 1) + '</td>';
        html += '<td>' + row.x.toFixed(3) + '</td>';
        html += '<td>' + (isNaN(row.series) ? 'N/A' : row.series.toFixed(6)) + '</td>';
        html += '<td>' + row.n + '</td>';
        html += '<td>' + (isNaN(row.math) ? 'N/A' : row.math.toFixed(6)) + '</td>';
        html += '<td>' + (isNaN(row.difference) ? 'N/A' : row.difference.toFixed(6)) + '</td>';
        html += '</tr>';
    });
    
    tbody.innerHTML = html;
}

/**
 * Save chart as image
 */
function saveChart() {
    if (!mathChart) {
        alert('Сначала постройте график!');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'arccos-chart-' + new Date().getTime() + '.png';
    link.href = mathChart.toBase64Image();
    link.click();
}

/**
 * Animate chart building
 */
function animateChart() {
    if (!mathChart) {
        buildChart(true);
        return;
    }
    
    // Reset chart data
    mathChart.data.datasets[0].data = [];
    mathChart.data.datasets[1].data = [];
    mathChart.update('none');
    
    const xMin = parseFloat(document.getElementById('xMin').value) || -1;
    const xMax = parseFloat(document.getElementById('xMax').value) || 1;
    const nTerms = parseInt(document.getElementById('nTerms').value) || 10;
    const pointsCount = parseInt(document.getElementById('pointsCount').value) || 100;
    
    const data = generateChartData(xMin, xMax, pointsCount, nTerms);
    chartData = data;
    
    // Animate adding points
    let index = 0;
    const interval = setInterval(function() {
        if (index < data.labels.length) {
            mathChart.data.labels = data.labels.slice(0, index + 1);
            mathChart.data.datasets[0].data = data.series.slice(0, index + 1);
            mathChart.data.datasets[1].data = data.math.slice(0, index + 1);
            mathChart.update('active');
            index += Math.max(1, Math.floor(pointsCount / 50)); // Update every 2% of points
        } else {
            clearInterval(interval);
            updateDataTable(data.tableData);
        }
    }, 20);
}

/**
 * Reset chart
 */
function resetChart() {
    if (mathChart) {
        mathChart.destroy();
        mathChart = null;
    }
    const tbody = document.getElementById('dataTableBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Нажмите "Построить график" для генерации данных</td></tr>';
    }
}

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const buildChartBtn = document.getElementById('buildChartBtn');
    const saveChartBtn = document.getElementById('saveChartBtn');
    const animateChartBtn = document.getElementById('animateChartBtn');
    const resetChartBtn = document.getElementById('resetChartBtn');
    
    if (buildChartBtn) {
        buildChartBtn.addEventListener('click', function() {
            buildChart(false);
        });
    }
    
    if (saveChartBtn) {
        saveChartBtn.addEventListener('click', saveChart);
    }
    
    if (animateChartBtn) {
        animateChartBtn.addEventListener('click', animateChart);
    }
    
    if (resetChartBtn) {
        resetChartBtn.addEventListener('click', resetChart);
    }
});

