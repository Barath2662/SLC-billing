import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiDownload, FiPrinter, FiShare2, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
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
    if (!invoiceHtml) {
      throw new Error('Invoice preview not ready');
    }

    const parsed = new DOMParser().parseFromString(invoiceHtml, 'text/html');
    const bill = parsed.querySelector('.bill');
    if (!bill) {
      throw new Error('Invoice markup missing .bill root');
    }

    const styleText = Array.from(parsed.querySelectorAll('style'))
      .map((s) => s.textContent || '')
      .join('\n');

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.background = '#fff';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    container.innerHTML = `<style>${styleText}</style>${bill.outerHTML}`;
    document.body.appendChild(container);

    try {
      // Let browser layout cloned DOM before html2canvas snapshot
      await new Promise((resolve) => setTimeout(resolve, 50));

      const worker = html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `invoice-${billNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(container)
        .toPdf();

      const pdf = await worker.get('pdf');
      const pdfBlob = pdf.output('blob');

      return pdfBlob;
    } finally {
      document.body.removeChild(container);
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
