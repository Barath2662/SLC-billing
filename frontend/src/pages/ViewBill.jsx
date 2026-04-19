import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiDownload, FiPrinter, FiShare2, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { billAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ViewBill() {
  const { billNumber } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [invoiceHtml, setInvoiceHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billAPI.getInvoiceHtml(billNumber)
      .then((res) => setInvoiceHtml(res.data))
      .catch(() => {
        toast.error('Bill not found');
        navigate('/search-bills');
      })
      .finally(() => setLoading(false));
  }, [billNumber]);

  const createPdfBlobFromInvoiceHtml = async () => {
    if (!iframeRef.current) {
      throw new Error('Invoice preview not ready');
    }

    // Get the iframe's document
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) {
      throw new Error('Cannot access iframe document');
    }

    // Get the .bill element from the iframe
    const billElement = iframeDoc.querySelector('.bill');
    if (!billElement) {
      throw new Error('Invoice markup missing .bill root');
    }

    // Clone the bill element to work with
    const clonedBill = billElement.cloneNode(true);
    
    // Create a temporary container with all necessary styles
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '210mm';
    tempContainer.style.backgroundColor = '#ffffff';
    
    // Get all styles from iframe
    const styleElements = iframeDoc.querySelectorAll('style');
    const styleText = Array.from(styleElements)
      .map(s => s.textContent || '')
      .join('\n');
    
    // Build complete HTML with styles
    tempContainer.innerHTML = `
      <style>
        ${styleText}
      </style>
      ${clonedBill.outerHTML}
    `;
    
    document.body.appendChild(tempContainer);

    try {
      // Wait for browser to render
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Use html2pdf directly on the container with HTML rendering
      return new Promise((resolve, reject) => {
        html2pdf()
          .set({
            margin: 0,
            filename: `invoice-${billNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 1, 
              useCORS: true, 
              backgroundColor: '#ffffff',
              logging: false,
              allowTaint: true,
              removeContainer: true
            },
            jsPDF: { 
              unit: 'mm', 
              format: 'a4', 
              orientation: 'portrait',
              compress: true
            },
            pagebreak: { mode: 'avoid' },
          })
          .from(tempContainer)
          .toPdf()
          .get('pdf')
          .then((pdf) => {
            resolve(pdf.output('blob'));
          })
          .catch((err) => {
            reject(err);
          });
      });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  const downloadBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${billNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const res = await billAPI.getPDF(billNumber);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      downloadBlob(blob);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch {
      try {
        const fallbackBlob = await createPdfBlobFromInvoiceHtml();
        downloadBlob(fallbackBlob);
        toast.success('PDF downloaded (frontend fallback).', { id: 'pdf' });
      } catch {
        toast.error('Failed to generate PDF', { id: 'pdf' });
      }
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById('invoice-frame');
    if (iframe) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  const handleShare = async () => {
    try {
      let blob;
      try {
        const res = await billAPI.getPDF(billNumber);
        blob = new Blob([res.data], { type: 'application/pdf' });
      } catch {
        blob = await createPdfBlobFromInvoiceHtml();
      }

      const file = new File([blob], `invoice-${billNumber}.pdf`, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `Invoice ${billNumber}`, files: [file] });
      } else {
        handleDownloadPDF();
        toast('Share not supported on this device. PDF downloaded instead.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Failed to share');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete bill ${billNumber}?`)) return;
    try {
      await billAPI.delete(billNumber);
      toast.success('Bill deleted');
      navigate('/search-bills');
    } catch {
      toast.error('Failed to delete bill');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Actions Bar */}
      <div className="no-print flex flex-wrap items-center gap-3 mb-6">
        <Link to="/search-bills" className="btn-secondary flex items-center space-x-1 text-sm">
          <FiArrowLeft /><span>Back</span>
        </Link>
        <div className="flex-1" />
        <Link to={`/edit-bill/${billNumber}`} className="btn-secondary flex items-center space-x-1 text-sm">
          <FiEdit /><span>Edit</span>
        </Link>
        <button onClick={handleDownloadPDF} className="btn-primary flex items-center space-x-1 text-sm">
          <FiDownload /><span>Download PDF</span>
        </button>
        <button onClick={handlePrint} className="btn-secondary flex items-center space-x-1 text-sm">
          <FiPrinter /><span>Print</span>
        </button>
        <button onClick={handleShare} className="btn-secondary flex items-center space-x-1 text-sm">
          <FiShare2 /><span>Share</span>
        </button>
        <button onClick={handleDelete} className="btn-danger flex items-center space-x-1 text-sm">
          <FiTrash2 /><span>Delete</span>
        </button>
      </div>

      {/* Invoice Preview — identical to PDF */}
      <div className="bg-white shadow-lg rounded overflow-hidden">
        <iframe
          ref={iframeRef}
          id="invoice-frame"
          srcDoc={invoiceHtml}
          title="Invoice"
          style={{ width: '100%', height: '297mm', border: 'none', display: 'block' }}
        />
      </div>
    </div>
  );
}
