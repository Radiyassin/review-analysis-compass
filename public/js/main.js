let sentimentChart, distributionChart, countChart;

window.addEventListener('load', () => {
    console.log('main.js loaded successfully');
    
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

    console.log('Selected file:', selectedFile.name, 'Size:', selectedFile.size);
    
    // Show loading state
    const analyzeBtn = document.querySelector('.btn-blue');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Analyzing...';
    }

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
            const errorText = await response.text();
            console.error('Server Error Response:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('=== RECEIVED DATA FROM BACKEND ===');
        console.log('Full response:', JSON.stringify(data, null, 2));

        if (!data.success && !data.chart_data) {
            console.error('Invalid response format:', data);
            alert('Invalid response from server');
            return;
        }

        // Store data globally for React components FIRST
        window.currentSentimentScore = data.sentiment_score || 0;
        window.currentSalesTrend = data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' };
        window.currentProductInfo = data.product_info || { 'Product Name': 'N/A', 'Brand Name': 'N/A', 'Price': 'N/A' };
        window.currentChartData = data.chart_data || {};
        window.currentPhrases = data.common_phrases || [];

        console.log('=== STORED GLOBAL DATA ===');
        console.log('Sentiment Score:', window.currentSentimentScore);
        console.log('Sales Trend:', window.currentSalesTrend);
        console.log('Product Info:', window.currentProductInfo);
        console.log('Chart Data:', window.currentChartData);

        // Update DOM-based UI components
        updateProductInfo(data.product_info || {});
        updatePhrases(data.common_phrases || []);
        
        if (data.chart_data) {
            updateCharts(data.chart_data);
        }

        // Wait a bit then dispatch events for React components
        setTimeout(() => {
            console.log('=== DISPATCHING EVENTS TO REACT ===');
            
            // Update sentiment stars component
            const sentimentEvent = new CustomEvent('sentimentDataUpdate', {
                detail: { sentimentScore: data.sentiment_score || 0 }
            });
            window.dispatchEvent(sentimentEvent);
            console.log('Dispatched sentimentDataUpdate event with score:', data.sentiment_score);

            // Update sales forecast component
            const salesEvent = new CustomEvent('salesTrendUpdate', {
                detail: data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' }
            });
            window.dispatchEvent(salesEvent);
            console.log('Dispatched salesTrendUpdate event with trend:', data.sales_trend);
            
            // Dispatch analysis completion event to show results in UI
            const completionEvent = new CustomEvent('analysisCompleted');
            window.dispatchEvent(completionEvent);
            console.log('Dispatched analysisCompleted event');
            
        }, 200);

        // Also dispatch events immediately (double dispatch for reliability)
        console.log('=== DISPATCHING IMMEDIATE EVENTS ===');
        
        const immediateEvent1 = new CustomEvent('sentimentDataUpdate', {
            detail: { sentimentScore: data.sentiment_score || 0 }
        });
        window.dispatchEvent(immediateEvent1);

        const immediateEvent2 = new CustomEvent('salesTrendUpdate', {
            detail: data.sales_trend || { trend: 'Stable', avg_sentiment: 0, message: 'No data' }
        });
        window.dispatchEvent(immediateEvent2);

        // Dispatch completion event immediately as well
        const immediateCompletionEvent = new CustomEvent('analysisCompleted');
        window.dispatchEvent(immediateCompletionEvent);

        console.log('=== ANALYSIS COMPLETED ===');
        
    } catch (error) {
        console.error('=== FETCH ERROR ===');
        console.error('Error details:', error);
        alert(`Analysis failed: ${error.message}`);
    } finally {
        // Reset button state
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>Analyze CSV';
        }
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
    
    console.log('Product info updated in DOM');
}

function updatePhrases(phrases) {
    console.log('Updating phrases:', phrases);
    const phraseList = document.getElementById('phraseList');
    if (phraseList && phrases && phrases.length > 0) {
        phraseList.innerHTML = phrases
            .slice(0, 10)
            .map(([phrase, count]) => `<li class="text-gray-700">${phrase} (${count})</li>`)
            .join('');
        console.log('Phrases updated in DOM');
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
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    } else {
        console.error('Chart.js not loaded');
    }
}

function updateCharts(chartData) {
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
