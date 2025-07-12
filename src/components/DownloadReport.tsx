
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DownloadReport = () => {
  const handleDownload = async () => {
    console.log('📄 DownloadReport: Starting PDF generation...');
    
    try {
      // Get all the analysis data from dataStore
      if (!window.dataStore) {
        alert('No analysis data available for download');
        return;
      }

      const allData = window.dataStore.getAllData();
      console.log('📄 DownloadReport: Retrieved data:', allData);

      if (!allData.analysisComplete) {
        alert('Please complete the analysis first before downloading the report');
        return;
      }

      // Show loading state
      const button = document.querySelector('button') as HTMLButtonElement;
      const originalText = button?.textContent;
      if (button) {
        button.textContent = 'Generating PDF...';
        button.disabled = true;
      }

      // Take screenshot of the entire page
      const canvas = await html2canvas(document.body, {
        height: document.body.scrollHeight,
        width: document.body.scrollWidth,
        useCORS: true,
        scale: 0.5, // Reduce scale for better performance
        scrollX: 0,
        scrollY: 0
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add the image to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `sentiment-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('📄 DownloadReport: PDF downloaded successfully');
      
      // Reset button state
      if (button && originalText) {
        button.textContent = originalText;
        button.disabled = false;
      }
      
    } catch (error) {
      console.error('📄 DownloadReport: Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Reset button state on error
      const button = document.querySelector('button') as HTMLButtonElement;
      if (button) {
        button.textContent = 'Download Product Report (PDF)';
        button.disabled = false;
      }
    }
  };

  return (
    <div className="text-center pt-8">
      <Button 
        onClick={handleDownload}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
      >
        <Download className="h-5 w-5 mr-2" />
        Download Product Report (PDF)
      </Button>
    </div>
  );
};

export default DownloadReport;
