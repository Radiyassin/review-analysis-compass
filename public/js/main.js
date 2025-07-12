
let sentimentChart, distributionChart, countChart;

window.addEventListener('load', () => {
    setTimeout(() => {
        const intro = document.getElementById('intro-gif');
        if (intro) intro.style.display = 'none';
    }, 3000);
});

async function analyze() {
    // Get file from React component instead of DOM element
    const file = (window as any).selectedCsvFile;
    if (!file) {
        alert('Please select a CSV file');
        return;
    }

    const analyzeBtn = document.querySelector('button[onclick="analyze()"]') || 
                      document.querySelector('.btn-blue');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Analysis data received:', data);

        const resultsElement = document.getElementById('results');
        if (resultsElement) {
            resultsElement.style.display = 'block';
        }

        setTimeout(() => {
            renderSentimentStars(data.sentiment_score);
        }, 50);

        setupPdfDownload();
        updateProductInfo(data.product_info);
        renderCharts(data.chart_data);
        renderPhrases(data.common_phrases || []);
        renderWordCloud(data.common_phrases || []);
        renderSalesTrend(data.sales_trend);

        if (data.rating_stats) {
            renderRatingStats(data.rating_stats);
        }

    } catch (err) {
        console.error('Analysis error:', err);
        alert('Analysis failed: ' + err.message);
    } finally {
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze CSV';
        }
    }
}

function updateProductInfo(info) {
    const productNameEl = document.getElementById('productName');
    const brandNameEl = document.getElementById('brandName');
    const priceEl = document.getElementById('price');
    
    if (productNameEl) productNameEl.textContent = info["Product Name"] || 'N/A';
    if (brandNameEl) brandNameEl.textContent = info["Brand Name"] || 'N/A';
    if (priceEl) {
        const price = info["Price"];
        priceEl.textContent = price !== 'N/A' ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
    }
}

function renderCharts(data) {
    if (sentimentChart) sentimentChart.destroy();
    if (distributionChart) distributionChart.destroy();
    if (countChart) countChart.destroy();

    const sentimentChartEl = document.getElementById('sentimentChart');
    const distributionChartEl = document.getElementById('distributionChart');
    const countChartEl = document.getElementById('countChart');

    if (sentimentChartEl && typeof Chart !== 'undefined') {
        const sc = sentimentChartEl.getContext('2d');
        sentimentChart = new Chart(sc, {
            type: 'bar',
            data: {
                labels: data.sentiment.labels,
                datasets: [{
                    label: 'Mean Score',
                    data: data.sentiment.means,
                    backgroundColor: ['#4CAF50', '#F44336']
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 1 }
                }
            }
        });
    }

    if (distributionChartEl && typeof Chart !== 'undefined') {
        const dc = distributionChartEl.getContext('2d');
        distributionChart = new Chart(dc, {
            type: 'pie',
            data: {
                labels: data.distribution.labels,
                datasets: [{
                    data: data.distribution.values,
                    backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
                }]
            }
        });
    }

    if (countChartEl && typeof Chart !== 'undefined') {
        const cc = countChartEl.getContext('2d');
        countChart = new Chart(cc, {
            type: 'bar',
            data: {
                labels: data.counts.labels,
                datasets: [{
                    label: 'Reviews',
                    data: data.counts.values,
                    backgroundColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

function renderPhrases(phrases) {
    const ul = document.getElementById('phraseList');
    if (ul) {
        ul.innerHTML = phrases.length
            ? phrases.map(p => `<li>${p[0]} (${p[1]}x)</li>`).join('')
            : '<li>No common phrases found</li>';
    }
}

function renderWordCloud(phrases) {
    const container = document.getElementById('wordCloud');
    if (!container || typeof d3 === 'undefined') return;
    
    container.innerHTML = '';

    if (!phrases.length) {
        container.innerHTML = '<p>No words for word cloud</p>';
        return;
    }

    const words = phrases.map(p => ({
        text: p[0],
        size: 10 + p[1] * 3
    }));

    if (typeof d3.layout === 'undefined' || typeof d3.layout.cloud === 'undefined') {
        container.innerHTML = '<p>Word cloud library not available</p>';
        return;
    }

    const layout = d3.layout.cloud()
        .size([container.clientWidth, 400])
        .words(words)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Impact")
        .fontSize(d => d.size)
        .on("end", draw);
    layout.start();

    function draw(words) {
        d3.select("#wordCloud")
            .append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", `translate(${layout.size()[0]/2},${layout.size()[1]/2})`)
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("font-family", "Impact")
            .style("fill", (_, i) => d3.schemeCategory10[i % 10])
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
            .text(d => d.text);
    }
}

function renderRatingStats(stats) {
    console.log("Rating stats:", stats);
}

function renderSentimentStars(sentimentScore) {
    const container = document.getElementById('sentimentStars');
    if (!container) {
        console.error("Element with ID 'sentimentStars' not found.");
        return;
    }

    const clampedScore = Math.max(-1, Math.min(1, sentimentScore));
    const scoreOutOf5 = ((clampedScore + 1) / 2) * 5;

    const fullStars = Math.floor(scoreOutOf5);
    const halfStar = scoreOutOf5 - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    container.innerHTML = '<h3>Predicted Sentiment Rating</h3>';
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-display';

    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        starsContainer.appendChild(star);
    }

    if (halfStar) {
        const star = document.createElement('i');
        star.className = 'fas fa-star-half-alt';
        starsContainer.appendChild(star);
    }

    for (let i = 0; i < emptyStars; i++) {
        const star = document.createElement('i');
        star.className = 'far fa-star';
        starsContainer.appendChild(star);
    }

    const ratingText = document.createElement('span');
    ratingText.id = 'starText';
    ratingText.textContent = ` (${scoreOutOf5.toFixed(1)}/5)`;

    container.appendChild(starsContainer);
    container.appendChild(ratingText);
}

function setupPdfDownload() {
    const btn = document.getElementById('downloadPdfBtn');
    if (btn && !btn.hasAttribute('data-initialized')) {
        btn.setAttribute('data-initialized', 'true');
        btn.addEventListener('click', async () => {
            const container = document.querySelector('.container');
            if (!container || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
                alert('PDF generation libraries not available');
                return;
            }
            
            const clone = container.cloneNode(true);

            const canvases = container.querySelectorAll('canvas');
            const cloneCanvases = clone.querySelectorAll('canvas');

            for (let i = 0; i < canvases.length; i++) {
                const img = document.createElement('img');
                img.src = canvases[i].toDataURL('image/png');
                img.style.maxWidth = '100%';
                cloneCanvases[i].replaceWith(img);
            }

            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            document.body.appendChild(clone);

            try {
                const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('product_report.pdf');
            } finally {
                document.body.removeChild(clone);
            }
        });
    }
}

function renderSalesTrend(trendData) {
    const el = document.getElementById('salesTrendMessage');
    if (!trendData || !el) return;

    let explanation = "";
    switch (trendData.trend) {
        case 'Up':
            explanation = "Customers are mostly satisfied, so the product is likely to sell well.";
            break;
        case 'Down':
            explanation = "Many customers are unhappy, which may reduce future sales.";
            break;
        case 'Stable':
            explanation = "Customer opinions are mixed, so sales are expected to stay the same.";
            break;
    }

    const icon = trendData.trend === 'Up' ? '📈'
                : trendData.trend === 'Down' ? '📉'
                : '➡️';

    el.innerHTML = `${icon} <strong>${trendData.trend}</strong> — ${explanation}`;
}

function toggleChatbot() {
    const chatbox = document.getElementById('chatbox');
    if (chatbox) {
        chatbox.classList.toggle('chat-hidden');
    }
}

async function askBot() {
    const input = document.getElementById('userQuestion');
    if (!input) return;
    
    const question = input.value.trim();
    if (!question) return;

    appendMessage('user', question);
    input.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        appendMessage('bot', data.answer || 'Sorry, no response.');
    } catch (err) {
        console.error('Chat error:', err);
        appendMessage('bot', 'An error occurred while contacting the assistant.');
    }
}

function appendMessage(sender, text) {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;
    
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatLog.appendChild(msg);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Make functions globally available
window.analyze = analyze;
window.toggleChatbot = toggleChatbot;
window.askBot = askBot;
window.renderSentimentStars = renderSentimentStars;
window.updateProductInfo = updateProductInfo;
window.renderCharts = renderCharts;
window.renderPhrases = renderPhrases;
window.renderWordCloud = renderWordCloud;
window.renderSalesTrend = renderSalesTrend;
window.setupPdfDownload = setupPdfDownload;
