
// DOM update functions
class DOMUpdater {
    static updateProductInfo(productInfo) {
        console.log('Updating product info:', productInfo);
        
        const productNameEl = document.getElementById('productName');
        const brandNameEl = document.getElementById('brandName');
        const priceEl = document.getElementById('price');
        
        if (productNameEl) productNameEl.textContent = productInfo['Product Name'] || 'N/A';
        if (brandNameEl) brandNameEl.textContent = productInfo['Brand Name'] || 'N/A';
        if (priceEl) priceEl.textContent = productInfo['Price'] || 'N/A';
        
        console.log('Product info updated in DOM');
    }

    static updatePhrases(phrases) {
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

    static updateButtonState(isAnalyzing) {
        const analyzeBtn = document.querySelector('.btn-blue');
        if (analyzeBtn) {
            analyzeBtn.disabled = isAnalyzing;
            if (isAnalyzing) {
                analyzeBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Analyzing...';
            } else {
                analyzeBtn.innerHTML = '<svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>Analyze CSV';
            }
        }
    }
}

window.DOMUpdater = DOMUpdater;
