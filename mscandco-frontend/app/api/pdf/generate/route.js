import { NextResponse } from 'next/server';
import { convertHtmlToPdfServer } from '@/lib/html-to-pdf';

/**
 * POST /api/pdf/generate
 * Generate PDF from HTML content
 * 
 * Body:
 * {
 *   html: string,           // HTML content to convert
 *   url?: string,           // Alternative: URL to convert
 *   options?: {             // PDF generation options
 *     format?: string,      // 'A4', 'Letter', etc.
 *     margin?: object,      // { top, right, bottom, left }
 *     landscape?: boolean,
 *     printBackground?: boolean,
 *     scale?: number,
 *     width?: string,
 *     height?: string,
 *     displayHeaderFooter?: boolean,
 *     headerTemplate?: string,
 *     footerTemplate?: string
 *   }
 * }
 */
export async function POST(request) {
  try {
    // Enterprise pattern: Dynamic import prevents build-time analysis
    const { convertHtmlToPdfServer } = await import('@/lib/html-to-pdf');
    
    const body = await request.json();
    const { html, url, options = {} } = body;

    if (!html && !url) {
      return NextResponse.json(
        { error: 'Either html or url must be provided' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await convertHtmlToPdfServer({
      html,
      url,
      pdfOptions: {
        format: options.format || 'A4',
        margin: options.margin || {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        landscape: options.landscape || false,
        printBackground: options.printBackground !== false,
        scale: options.scale || 1,
        width: options.width,
        height: options.height,
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate || '',
        footerTemplate: options.footerTemplate || '',
        ...options
      }
    });

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pdf/generate?url=<url>
 * Generate PDF from URL
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const format = searchParams.get('format') || 'A4';
    const landscape = searchParams.get('landscape') === 'true';

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Generate PDF from URL
    const pdfBuffer = await convertHtmlToPdfServer({
      url,
      pdfOptions: {
        format,
        landscape,
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      }
    });

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


