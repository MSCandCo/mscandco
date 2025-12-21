'use client';

import { useState, useCallback } from 'react';
import { convertHtmlToPdfViaAPI, downloadPdf, convertElementToPdfClient } from '@/lib/html-to-pdf';

/**
 * React hook for HTML to PDF conversion
 * 
 * @example
 * const { convertToPdf, isGenerating, error } = useHtmlToPdf();
 * 
 * const handleConvert = async () => {
 *   const pdfBlob = await convertToPdf('<html>...</html>');
 *   downloadPdf(pdfBlob, 'document.pdf');
 * };
 */
export function useHtmlToPdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Convert HTML string to PDF
   * @param {string} html - HTML content
   * @param {Object} options - PDF options
   * @returns {Promise<Blob>} PDF blob
   */
  const convertToPdf = useCallback(async (html, options = {}) => {
    setIsGenerating(true);
    setError(null);

    try {
      const pdfBlob = await convertHtmlToPdfViaAPI(html, options);
      return pdfBlob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Convert HTML element to PDF (client-side)
   * @param {HTMLElement} element - HTML element
   * @param {Object} options - PDF options
   */
  const convertElementToPdf = useCallback(async (element, options = {}) => {
    setIsGenerating(true);
    setError(null);

    try {
      await convertElementToPdfClient(element, options);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Convert HTML to PDF and download
   * @param {string} html - HTML content
   * @param {string} filename - Filename
   * @param {Object} options - PDF options
   */
  const convertAndDownload = useCallback(async (html, filename = 'document.pdf', options = {}) => {
    try {
      const pdfBlob = await convertToPdf(html, options);
      downloadPdf(pdfBlob, filename);
    } catch (err) {
      // Error already set by convertToPdf
      throw err;
    }
  }, [convertToPdf]);

  return {
    convertToPdf,
    convertElementToPdf,
    convertAndDownload,
    isGenerating,
    error
  };
}


