
// Chart management functions
let sentimentChart, distributionChart, countChart;

class ChartManager {
    static initialize() {
        const ctx1 = document.getElementById('sentimentChart');
        const ctx2 = document.getElementById('distributionChart');
        const ctx3 = document.getElementById('countChart');
        
        if (!ctx1 || !ctx2 || !ctx3) {
            console.log('Chart canvases not found, will retry later');
            return false;
        }
        
        console.log('Initializing charts...');
        
        if (typeof Chart !== 'undefined') {
            try {
                sentimentChart = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: ['Positive', 'Negative'],
                        datasets: [{
                            label: 'Sentiment Scores',
                            data: [0, 0],
                            backgroundColor: ['#10B981', '#EF4444']
                        }]
                    },
                    options: { responsive: true, plugins: { legend: { display: false } } }
                });

                distributionChart = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: ['Positive', 'Neutral', 'Negative'],
                        datasets: [{
                            data: [0, 0, 0],
                            backgroundColor: ['#10B981', '#6B7280', '#EF4444']
                        }]
                    },
                    options: { responsive: true }
                });

                countChart = new Chart(ctx3, {
                    type: 'bar',
                    data: {
                        labels: ['Total Reviews'],
                        datasets: [{
                            label: 'Count',
                            data: [0],
                            backgroundColor: ['#3B82F6']
                        }]
                    },
                    options: { responsive: true, plugins: { legend: { display: false } } }
                });
                
                console.log('Charts initialized successfully');
                return true;
            } catch (error) {
                console.error('Error initializing charts:', error);
                return false;
            }
        } else {
            console.error('Chart.js not loaded');
            return false;
        }
    }

    static update(chartData) {
        console.log('Updating charts with data:', chartData);
        
        try {
            if (sentimentChart && chartData.sentiment) {
                sentimentChart.data.datasets[0].data = chartData.sentiment.means || [0, 0];
                sentimentChart.update();
                console.log('Sentiment chart updated');
            }
            
            if (distributionChart && chartData.distribution) {
                distributionChart.data.datasets[0].data = chartData.distribution.values || [0, 0, 0];
                distributionChart.update();
                console.log('Distribution chart updated');
            }
            
            if (countChart && chartData.counts) {
                countChart.data.datasets[0].data = chartData.counts.values || [0];
                countChart.update();
                console.log('Count chart updated');
            }
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }
}

window.ChartManager = ChartManager;
