
let sentimentChart, distributionChart, countChart;

window.addEventListener('load', () => {
    console.info('main.js loaded successfully');
    
    // Initialize charts when the page loads
    setTimeout(() => {
        initializeCharts();
    }, 1000);
});

// Global analyze function that can be called from React
window.analyze = async function() {
    console.log('=== ANALYZE FUNCTION CALLED ===');
    
    const selectedFile = window.selectedCsvFile;
    if (!selectedFile) {
        alert('Please select a CSV file first!');
        return;
    }

    console.log('Selected file:', selectedFile.name);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        console.log('Sending file to Flask backend...');
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            alert(`Error: ${errorData.error || 'Upload failed'}`);
            return;
        }

        const data = await response.json();
        console.log('=== RECEIVED DATA FROM BACKEND ===');
        console.log('Full response:', data);

        if (!data.success && !data.chart_data) {
            console.error('Invalid response format:', data);
            alert('Invalid response from server');
            return;
        }

        // Store data globally for React components
        window.currentSentimentScore = data.sentiment_score || 0;
        window.currentSalesTrend = data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' };
        window.currentProductInfo = data.product_info || { 'Product Name': 'N/A', 'Brand Name': 'N/A', 'Price': 'N/A' };
        window.currentChartData = data.chart_data || {};
        window.currentPhrases = data.common_phrases || [];

        console.log('=== STORED GLOBAL DATA ===');
        console.log('Sentiment Score:', window.currentSentimentScore);
        console.log('Sales Trend:', window.currentSalesTrend);
        console.log('Product Info:', window.currentProductInfo);

        // Dispatch events for React components with a small delay
        setTimeout(() => {
            console.log('=== DISPATCHING EVENTS TO REACT ===');
            
            // Update sentiment stars component
            window.dispatchEvent(new CustomEvent('sentimentDataUpdate', {
                detail: { sentimentScore: data.sentiment_score || 0 }
            }));
            console.log('Dispatched sentimentDataUpdate event');

            // Update sales forecast component
            window.dispatchEvent(new CustomEvent('salesTrendUpdate', {
                detail: data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' }
            }));
            console.log('Dispatched salesTrendUpdate event');
            
            // Update product info
            if (data.product_info) {
                updateProductInfo(data.product_info);
            }
            
            // Update charts
            if (data.chart_data) {
                updateCharts(data.chart_data);
            }
            
            // Update phrases
            if (data.common_phrases) {
                updatePhrases(data.common_phrases);
            }
            
        }, 100);

        console.log('=== ANALYSIS COMPLETED ===');
        
    } catch (error) {
        console.error('=== FETCH ERROR ===');
        console.error('Error details:', error);
        alert(`Network error: ${error.message}`);
    }
};

function updateProductInfo(productInfo) {
    console.log('Updating product info:', productInfo);
    
    const productNameEl = document.getElementById('productName');
    const brandNameEl = document.getElementById('brandName');
    const priceEl = document.getElementById('price');
    
    if (productNameEl) productNameEl.textContent = productInfo['Product Name'] || 'N/A';
    if (brandNameEl) brandNameEl.textContent = productInfo['Brand Name'] || 'N/A';
    if (priceEl) priceEl.textContent = productInfo['Price'] || 'N/A';
}

function updatePhrases(phrases) {
    console.log('Updating phrases:', phrases);
    const phraseList = document.getElementById('phraseList');
    if (phraseList && phrases && phrases.length > 0) {
        phraseList.innerHTML = phrases
            .slice(0, 10)
            .map(([phrase, count]) => `<li class="text-gray-700">${phrase} (${count})</li>`)
            .join('');
    }
}

function initializeCharts() {
    const ctx1 = document.getElementById('sentimentChart');
    const ctx2 = document.getElementById('distributionChart');
    const ctx3 = document.getElementById('countChart');
    
    if (!ctx1 || !ctx2 || !ctx3) {
        console.log('Chart canvases not found, will retry later');
        return;
    }
    
    console.log('Initializing charts...');
    
    // Initialize empty charts
    if (typeof Chart !== 'undefined') {
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
    }
}

function updateCharts(chartData) {
    console.log('Updating charts with data:', chartData);
    
    if (sentimentChart && chartData.sentiment) {
        sentimentChart.data.datasets[0].data = chartData.sentiment.means || [0, 0];
        sentimentChart.update();
    }
    
    if (distributionChart && chartData.distribution) {
        distributionChart.data.datasets[0].data = chartData.distribution.values || [0, 0, 0];
        distributionChart.update();
    }
    
    if (countChart && chartData.counts) {
        countChart.data.datasets[0].data = chartData.counts.values || [0];
        countChart.update();
    }
}

// Chatbot functions
window.toggleChatbot = function() {
    const chatbox = document.getElementById('chatbox');
    if (chatbox) {
        chatbox.classList.toggle('chat-hidden');
    }
};

window.askBot = async function() {
    const questionInput = document.getElementById('userQuestion');
    const chatLog = document.getElementById('chat-log');
    
    if (!questionInput || !chatLog) return;
    
    const question = questionInput.value.trim();
    if (!question) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user bg-blue-100 p-3 rounded-lg text-sm max-w-xs ml-auto text-right';
    userMsg.textContent = question;
    chatLog.appendChild(userMsg);
    
    questionInput.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        
        const data = await response.json();
        
        // Add bot response
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot bg-gray-100 p-3 rounded-lg text-sm';
        botMsg.textContent = data.answer || 'Sorry, I could not process your question.';
        chatLog.appendChild(botMsg);
        
        chatLog.scrollTop = chatLog.scrollHeight;
        
    } catch (error) {
        console.error('Chat error:', error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'message bot bg-gray-100 p-3 rounded-lg text-sm';
        errorMsg.textContent = 'Sorry, there was an error processing your question.';
        chatLog.appendChild(errorMsg);
    }
};
