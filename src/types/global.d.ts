
declare global {
  interface Window {
    analyze: () => Promise<void>;
    toggleChatbot: () => void;
    askBot: () => Promise<void>;
    renderSentimentStars: (score: number) => void;
    updateProductInfo: (info: any) => void;
    renderCharts: (data: any) => void;
    renderPhrases: (phrases: any[]) => void;
    renderWordCloud: (phrases: any[]) => void;
    renderSalesTrend: (trendData: any) => void;
    setupPdfDownload: () => void;
    Chart: any;
    d3: any;
    html2canvas: any;
    jsPDF: any;
  }
}

export {};
