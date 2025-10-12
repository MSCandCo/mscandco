'use strict';

const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

module.exports = {
  // PDF Export for Creations
  async exportCreationsPDF(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Get user's creations based on role
      let creations;
      if (user.role?.name === 'admin') {
        creations = await strapi.entityService.findMany('api::creation.creation', {
          populate: ['artist', 'project', 'genre', 'audioFile'],
          sort: { createdAt: 'desc' }
        });
      } else {
        // For artists, get their own creations
        const artist = await strapi.entityService.findMany('api::artist.artist', {
          filters: { user: user.id },
          populate: ['creations.project', 'creations.genre', 'creations.audioFile']
        });
        creations = artist[0]?.creations || [];
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const filename = `creations_export_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../../../public', filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Add title
      doc.fontSize(24).text('Creations Export Report', { align: 'center' });
      doc.moveDown();

      // Add export info
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`);
      doc.text(`Total Creations: ${creations.length}`);
      doc.moveDown();

      // Add creations data
      creations.forEach((creation, index) => {
        doc.fontSize(16).text(`${index + 1}. ${creation.title}`);
        doc.fontSize(12).text(`Artist: ${creation.artist?.stageName || 'N/A'}`);
        doc.text(`Project: ${creation.project?.title || 'N/A'}`);
        doc.text(`Duration: ${creation.duration ? `${Math.floor(creation.duration / 60)}:${(creation.duration % 60).toString().padStart(2, '0')}` : 'N/A'}`);
        doc.text(`BPM: ${creation.bpm || 'N/A'}`);
        doc.text(`Key: ${creation.key || 'N/A'}`);
        doc.text(`Genre: ${creation.genre?.map(g => g.title).join(', ') || 'N/A'}`);
        doc.moveDown();
      });

      doc.end();

      // Return file download
      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.body = fs.createReadStream(filepath);

    } catch (error) {
      console.error('PDF Export Error:', error);
      ctx.throw(500, 'Failed to generate PDF export');
    }
  },

  // Excel Export for Creations
  async exportCreationsExcel(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Get user's creations based on role
      let creations;
      if (user.role?.name === 'admin') {
        creations = await strapi.entityService.findMany('api::creation.creation', {
          populate: ['artist', 'project', 'genre', 'audioFile'],
          sort: { createdAt: 'desc' }
        });
      } else {
        // For artists, get their own creations
        const artist = await strapi.entityService.findMany('api::artist.artist', {
          filters: { user: user.id },
          populate: ['creations.project', 'creations.genre', 'creations.audioFile']
        });
        creations = artist[0]?.creations || [];
      }

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Creations');

      // Add headers
      worksheet.columns = [
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Artist', key: 'artist', width: 20 },
        { header: 'Project', key: 'project', width: 25 },
        { header: 'Duration', key: 'duration', width: 15 },
        { header: 'BPM', key: 'bpm', width: 10 },
        { header: 'Key', key: 'key', width: 10 },
        { header: 'Genre', key: 'genre', width: 20 },
        { header: 'Created', key: 'created', width: 15 }
      ];

      // Add data
      creations.forEach(creation => {
        worksheet.addRow({
          title: creation.title,
          artist: creation.artist?.stageName || 'N/A',
          project: creation.project?.title || 'N/A',
          duration: creation.duration ? `${Math.floor(creation.duration / 60)}:${(creation.duration % 60).toString().padStart(2, '0')}` : 'N/A',
          bpm: creation.bpm || 'N/A',
          key: creation.key || 'N/A',
          genre: creation.genre?.map(g => g.title).join(', ') || 'N/A',
          created: new Date(creation.createdAt).toLocaleDateString()
        });
      });

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Generate file
      const filename = `creations_export_${Date.now()}.xlsx`;
      const filepath = path.join(__dirname, '../../../public', filename);
      
      await workbook.xlsx.writeFile(filepath);

      // Return file download
      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.body = fs.createReadStream(filepath);

    } catch (error) {
      console.error('Excel Export Error:', error);
      ctx.throw(500, 'Failed to generate Excel export');
    }
  },

  // PDF Export for Earnings
  async exportEarningsPDF(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Get earnings data based on role
      let earnings = [];
      if (user.role?.name === 'admin') {
        // Admin can see all earnings
        earnings = await strapi.entityService.findMany('api::monthly-statement.monthly-statement', {
          populate: ['artist'],
          sort: { createdAt: 'desc' }
        });
      } else {
        // Artists see their own earnings
        const artist = await strapi.entityService.findMany('api::artist.artist', {
          filters: { user: user.id },
          populate: ['monthlyStatements']
        });
        earnings = artist[0]?.monthlyStatements || [];
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const filename = `earnings_export_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../../../public', filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Add title
      doc.fontSize(24).text('Earnings Export Report', { align: 'center' });
      doc.moveDown();

      // Add export info
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`);
      doc.text(`Total Records: ${earnings.length}`);
      doc.moveDown();

      // Add earnings data
      earnings.forEach((earning, index) => {
        doc.fontSize(16).text(`${index + 1}. ${earning.artist?.stageName || 'N/A'}`);
        doc.fontSize(12).text(`Period: ${earning.period || 'N/A'}`);
        doc.text(`Revenue: $${earning.revenue || 0}`);
        doc.text(`Expenses: $${earning.expenses || 0}`);
        doc.text(`Net Earnings: $${earning.netEarnings || 0}`);
        doc.moveDown();
      });

      doc.end();

      // Return file download
      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.body = fs.createReadStream(filepath);

    } catch (error) {
      console.error('Earnings PDF Export Error:', error);
      ctx.throw(500, 'Failed to generate earnings PDF export');
    }
  },

  // Excel Export for Earnings
  async exportEarningsExcel(ctx) {
    try {
      const { user } = ctx.state;
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Get earnings data based on role
      let earnings = [];
      if (user.role?.name === 'admin') {
        earnings = await strapi.entityService.findMany('api::monthly-statement.monthly-statement', {
          populate: ['artist'],
          sort: { createdAt: 'desc' }
        });
      } else {
        const artist = await strapi.entityService.findMany('api::artist.artist', {
          filters: { user: user.id },
          populate: ['monthlyStatements']
        });
        earnings = artist[0]?.monthlyStatements || [];
      }

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Earnings');

      // Add headers
      worksheet.columns = [
        { header: 'Artist', key: 'artist', width: 25 },
        { header: 'Period', key: 'period', width: 15 },
        { header: 'Revenue', key: 'revenue', width: 15 },
        { header: 'Expenses', key: 'expenses', width: 15 },
        { header: 'Net Earnings', key: 'netEarnings', width: 15 },
        { header: 'Date', key: 'date', width: 15 }
      ];

      // Add data
      earnings.forEach(earning => {
        worksheet.addRow({
          artist: earning.artist?.stageName || 'N/A',
          period: earning.period || 'N/A',
          revenue: earning.revenue || 0,
          expenses: earning.expenses || 0,
          netEarnings: earning.netEarnings || 0,
          date: new Date(earning.createdAt).toLocaleDateString()
        });
      });

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Generate file
      const filename = `earnings_export_${Date.now()}.xlsx`;
      const filepath = path.join(__dirname, '../../../public', filename);
      
      await workbook.xlsx.writeFile(filepath);

      // Return file download
      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.body = fs.createReadStream(filepath);

    } catch (error) {
      console.error('Earnings Excel Export Error:', error);
      ctx.throw(500, 'Failed to generate earnings Excel export');
    }
  }
}; 