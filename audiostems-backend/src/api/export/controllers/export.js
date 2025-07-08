"use strict";

const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

module.exports = ({ strapi }) => ({
  // Generate Excel export for Distribution Partner creations
  async exportCreationsExcel(ctx) {
    try {
      const { user } = ctx.state;
      const { filters = {}, columns = [], format = 'detailed' } = ctx.request.body;

      // Check permissions
      if (!user || !['distribution_partner', 'super_admin', 'company_admin'].includes(user.role)) {
        return ctx.forbidden('Insufficient permissions');
      }

      // Fetch creations data
      const creations = await strapi.entityService.findMany('api::creation.creation', {
        filters,
        populate: {
          project: true,
          genre: true,
          artist: {
            populate: ['user']
          }
        }
      });

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'MSC & Co';
      workbook.lastModifiedBy = 'MSC & Co Export System';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Add company branding
      const logo = workbook.addImage({
        filename: path.join(__dirname, '../../../../public/logo.png'),
        extension: 'png',
      });

      // Basic Info Worksheet
      const basicSheet = workbook.addWorksheet('Basic Information');
      basicSheet.columns = [
        { header: 'Song Title', key: 'title', width: 30 },
        { header: 'Artist', key: 'artist', width: 25 },
        { header: 'ISRC', key: 'isrc', width: 15 },
        { header: 'Duration', key: 'duration', width: 12 },
        { header: 'BPM', key: 'bpm', width: 10 },
        { header: 'Key', key: 'key', width: 10 },
        { header: 'Genre', key: 'genre', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Release Date', key: 'releaseDate', width: 15 },
        { header: 'Explicit', key: 'explicit', width: 10 }
      ];

      // Technical Details Worksheet
      const technicalSheet = workbook.addWorksheet('Technical Details');
      technicalSheet.columns = [
        { header: 'Song Title', key: 'title', width: 30 },
        { header: 'Recording Studio', key: 'recordingStudio', width: 25 },
        { header: 'Recording Date', key: 'recordingDate', width: 15 },
        { header: 'Mix Date', key: 'mixDate', width: 15 },
        { header: 'Mastering Date', key: 'masteringDate', width: 15 },
        { header: 'Producer', key: 'producer', width: 25 },
        { header: 'Mixer', key: 'mixer', width: 25 },
        { header: 'Mastering Engineer', key: 'masteringEngineer', width: 25 },
        { header: 'Recording Country', key: 'recordingCountry', width: 20 }
      ];

      // Rights & Publishing Worksheet
      const rightsSheet = workbook.addWorksheet('Rights & Publishing');
      rightsSheet.columns = [
        { header: 'Song Title', key: 'title', width: 30 },
        { header: 'Publishing', key: 'publishing', width: 25 },
        { header: 'Publishing Admin', key: 'publishingAdmin', width: 25 },
        { header: 'Publisher IPI', key: 'publisherIpi', width: 15 },
        { header: 'Publishing Admin IPI', key: 'publishingAdminIpi', width: 20 },
        { header: 'Publishing Type', key: 'publishingType', width: 20 },
        { header: 'Publishing Rights', key: 'publishingRights', width: 40 },
        { header: 'Performance Rights', key: 'performanceRights', width: 40 },
        { header: 'Mechanical Rights', key: 'mechanicalRights', width: 40 }
      ];

      // Production Credits Worksheet
      const creditsSheet = workbook.addWorksheet('Production Credits');
      creditsSheet.columns = [
        { header: 'Song Title', key: 'title', width: 30 },
        { header: 'Vocals', key: 'vocals', width: 25 },
        { header: 'Guitars', key: 'guitars', width: 25 },
        { header: 'Bass', key: 'bass', width: 25 },
        { header: 'Drums', key: 'drums', width: 25 },
        { header: 'Keyboards', key: 'keyboards', width: 25 },
        { header: 'Programming', key: 'programming', width: 25 },
        { header: 'Percussion', key: 'percussion', width: 25 },
        { header: 'Organ', key: 'organ', width: 25 },
        { header: 'Featuring Artists', key: 'featuringArtists', width: 30 }
      ];

      // Add data to worksheets
      creations.forEach(creation => {
        const basicRow = {
          title: creation.title,
          artist: creation.artistName,
          isrc: creation.isrc,
          duration: creation.duration ? formatDuration(creation.duration) : '',
          bpm: creation.bpm,
          key: creation.key,
          genre: creation.genre?.map(g => g.title).join(', ') || '',
          status: creation.status,
          releaseDate: creation.releaseDate,
          explicit: creation.isExplicit ? 'Yes' : 'No'
        };

        const technicalRow = {
          title: creation.title,
          recordingStudio: creation.recordingStudio,
          recordingDate: creation.recordingDate,
          mixDate: creation.mixDate,
          masteringDate: creation.masteringDate,
          producer: creation.producer,
          mixer: creation.mixer,
          masteringEngineer: creation.masteringEngineer,
          recordingCountry: creation.recordingCountry
        };

        const rightsRow = {
          title: creation.title,
          publishing: creation.publishing,
          publishingAdmin: creation.publishingAdmin,
          publisherIpi: creation.publisherIpi,
          publishingAdminIpi: creation.publishingAdminIpi,
          publishingType: creation.publishingType,
          publishingRights: creation.publishingRights,
          performanceRights: creation.performanceRights,
          mechanicalRights: creation.mechanicalRights
        };

        const creditsRow = {
          title: creation.title,
          vocals: creation.vocals,
          guitars: creation.guitars,
          bass: creation.bass,
          drums: creation.drums,
          keyboards: creation.keyboards,
          programming: creation.programming,
          percussion: creation.percussion,
          organ: creation.organ,
          featuringArtists: creation.featuringArtists
        };

        basicSheet.addRow(basicRow);
        technicalSheet.addRow(technicalRow);
        rightsSheet.addRow(rightsRow);
        creditsSheet.addRow(creditsRow);
      });

      // Apply professional formatting
      [basicSheet, technicalSheet, rightsSheet, creditsSheet].forEach(sheet => {
        // Header styling
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' }
        };

        // Add borders
        sheet.eachRow((row, rowNumber) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `msc-creations-export-${timestamp}.xlsx`;

      // Write to buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers
      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.body = buffer;

    } catch (error) {
      console.error('Excel export error:', error);
      ctx.throw(500, 'Failed to generate Excel export');
    }
  },

  // Generate PDF export for Artist earnings
  async exportEarningsPDF(ctx) {
    try {
      const { user } = ctx.state;
      const { month, year, format = 'detailed' } = ctx.request.body;

      // Check permissions
      if (!user || !['artist', 'super_admin', 'company_admin'].includes(user.role)) {
        return ctx.forbidden('Insufficient permissions');
      }

      // Fetch earnings data
      const earnings = await strapi.entityService.findMany('api::monthly-statement.monthly-statement', {
        filters: {
          user: user.id,
          month,
          year
        },
        populate: ['user']
      });

      if (!earnings || earnings.length === 0) {
        return ctx.notFound('No earnings data found for the specified period');
      }

      const statement = earnings[0];

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();

      // Add company branding
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Header
      page.drawText('MSC & Co', {
        x: 50,
        y: height - 50,
        size: 24,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });

      page.drawText('Monthly Earnings Statement', {
        x: 50,
        y: height - 80,
        size: 18,
        font: boldFont,
        color: rgb(0.4, 0.4, 0.4)
      });

      // Statement period
      page.drawText(`Period: ${statement.month}/${statement.year}`, {
        x: 50,
        y: height - 110,
        size: 12,
        font: font,
        color: rgb(0.6, 0.6, 0.6)
      });

      // Artist information
      page.drawText(`Artist: ${statement.user.firstName} ${statement.user.lastName}`, {
        x: 50,
        y: height - 140,
        size: 12,
        font: font,
        color: rgb(0.2, 0.2, 0.2)
      });

      // Earnings summary
      const summaryY = height - 200;
      page.drawText('Earnings Summary', {
        x: 50,
        y: summaryY,
        size: 16,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });

      const earningsData = [
        { label: 'Total Earnings', value: `£${statement.totalEarnings.toFixed(2)}` },
        { label: 'Streaming Revenue', value: `£${statement.streamingRevenue?.toFixed(2) || '0.00'}` },
        { label: 'Performance Revenue', value: `£${statement.performanceRevenue?.toFixed(2) || '0.00'}` },
        { label: 'Publishing Revenue', value: `£${statement.publishingRevenue?.toFixed(2) || '0.00'}` },
        { label: 'Mechanical Revenue', value: `£${statement.mechanicalRevenue?.toFixed(2) || '0.00'}` },
        { label: 'Licensing Revenue', value: `£${statement.licensingRevenue?.toFixed(2) || '0.00'}` },
        { label: 'Sync Revenue', value: `£${statement.syncRevenue?.toFixed(2) || '0.00'}` }
      ];

      earningsData.forEach((item, index) => {
        const y = summaryY - 30 - (index * 25);
        page.drawText(item.label, {
          x: 50,
          y,
          size: 12,
          font: font,
          color: rgb(0.4, 0.4, 0.4)
        });
        page.drawText(item.value, {
          x: 250,
          y,
          size: 12,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2)
        });
      });

      // Statistics
      const statsY = summaryY - 250;
      page.drawText('Performance Statistics', {
        x: 50,
        y: statsY,
        size: 16,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });

      const statsData = [
        { label: 'Total Streams', value: statement.totalStreams?.toLocaleString() || '0' },
        { label: 'Total Downloads', value: statement.totalDownloads?.toLocaleString() || '0' },
        { label: 'Total Licenses', value: statement.totalLicenses?.toLocaleString() || '0' },
        { label: 'Growth %', value: `${statement.growthPercentage?.toFixed(1) || '0'}%` }
      ];

      statsData.forEach((item, index) => {
        const y = statsY - 30 - (index * 25);
        page.drawText(item.label, {
          x: 50,
          y,
          size: 12,
          font: font,
          color: rgb(0.4, 0.4, 0.4)
        });
        page.drawText(item.value, {
          x: 250,
          y,
          size: 12,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2)
        });
      });

      // Footer
      page.drawText('Generated by MSC & Co Export System', {
        x: 50,
        y: 50,
        size: 10,
        font: font,
        color: rgb(0.6, 0.6, 0.6)
      });

      page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 30,
        size: 10,
        font: font,
        color: rgb(0.6, 0.6, 0.6)
      });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `msc-earnings-${statement.month}-${statement.year}-${timestamp}.pdf`;

      // Convert to buffer
      const pdfBytes = await pdfDoc.save();

      // Set response headers
      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.body = Buffer.from(pdfBytes);

    } catch (error) {
      console.error('PDF export error:', error);
      ctx.throw(500, 'Failed to generate PDF export');
    }
  },

  // Generate analytics export for Super Admin
  async exportAnalyticsPDF(ctx) {
    try {
      const { user } = ctx.state;
      const { reportType, dateRange } = ctx.request.body;

      // Check permissions
      if (!user || !['super_admin', 'company_admin'].includes(user.role)) {
        return ctx.forbidden('Insufficient permissions');
      }

      // Fetch analytics data based on report type
      let analyticsData;
      switch (reportType) {
        case 'platform':
          analyticsData = await this.getPlatformAnalytics(dateRange);
          break;
        case 'artist':
          analyticsData = await this.getArtistAnalytics(dateRange);
          break;
        case 'financial':
          analyticsData = await this.getFinancialAnalytics(dateRange);
          break;
        default:
          return ctx.badRequest('Invalid report type');
      }

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Header
      page.drawText('MSC & Co Analytics Report', {
        x: 50,
        y: height - 50,
        size: 24,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });

      page.drawText(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, {
        x: 50,
        y: height - 80,
        size: 14,
        font: font,
        color: rgb(0.4, 0.4, 0.4)
      });

      // Add analytics data to PDF
      let yPosition = height - 120;
      Object.entries(analyticsData).forEach(([key, value]) => {
        if (yPosition < 100) {
          page = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }

        page.drawText(`${key}: ${value}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: font,
          color: rgb(0.2, 0.2, 0.2)
        });
        yPosition -= 20;
      });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `msc-analytics-${reportType}-${timestamp}.pdf`;

      // Convert to buffer
      const pdfBytes = await pdfDoc.save();

      // Set response headers
      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.body = Buffer.from(pdfBytes);

    } catch (error) {
      console.error('Analytics export error:', error);
      ctx.throw(500, 'Failed to generate analytics export');
    }
  },

  // Helper methods for analytics data
  async getPlatformAnalytics(dateRange) {
    // Mock data - replace with actual database queries
    return {
      'Total Users': '1,234',
      'Active Users': '987',
      'Total Revenue': '£45,678',
      'Average Session Duration': '12.5 minutes',
      'Top Performing Platform': 'Spotify',
      'Conversion Rate': '3.2%'
    };
  },

  async getArtistAnalytics(dateRange) {
    return {
      'Total Artists': '456',
      'Active Artists': '234',
      'Top Performing Artist': 'Artist A',
      'Average Earnings per Artist': '£234.56',
      'New Signups': '23',
      'Retention Rate': '87%'
    };
  },

  async getFinancialAnalytics(dateRange) {
    return {
      'Total Revenue': '£123,456',
      'Platform Fees': '£12,345',
      'Artist Payouts': '£98,765',
      'Net Profit': '£12,346',
      'Profit Margin': '10%',
      'Growth Rate': '15%'
    };
  }
});

// Helper function to format duration
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 