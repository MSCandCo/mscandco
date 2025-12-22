/**
 * Touring Platform - Financial Report Generator
 * Generates PDF financial reports for tours
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Generate financial report PDF
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const format = searchParams.get('format') || 'html'; // html, json, csv
    
    if (!tourId) {
      return NextResponse.json(
        { error: 'tourId required' },
        { status: 400 }
      );
    }
    
    // Fetch tour
    const { data: tour } = await supabaseAdmin
      .from('tours')
      .select('*')
      .eq('id', tourId)
      .single();
    
    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Fetch expenses
    const { data: expenses } = await supabaseAdmin
      .from('tour_expenses')
      .select('*')
      .eq('tour_id', tourId)
      .order('date', { ascending: false });
    
    // Fetch revenue from all tour dates
    const { data: tourDates } = await supabaseAdmin
      .from('tour_dates')
      .select('id')
      .eq('tour_id', tourId);
    
    let allRevenue = [];
    if (tourDates && tourDates.length > 0) {
      const dateIds = tourDates.map(d => d.id);
      const { data: revenue } = await supabaseAdmin
        .from('tour_revenue')
        .select('*')
        .in('tour_date_id', dateIds)
        .order('created_at', { ascending: false });
      
      allRevenue = revenue || [];
    }
    
    // Calculate totals
    const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) || 0;
    const totalRevenue = allRevenue.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
    
    // Group by category
    const expensesByCategory = {};
    expenses?.forEach(exp => {
      const cat = exp.category || 'other';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + parseFloat(exp.amount || 0);
    });
    
    const revenueBySource = {};
    allRevenue.forEach(rev => {
      const source = rev.source || 'other';
      revenueBySource[source] = (revenueBySource[source] || 0) + parseFloat(rev.amount || 0);
    });
    
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        tour: {
          id: tour.id,
          name: tour.name,
          artist_name: tour.artist_name
        },
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin: parseFloat(profitMargin)
        },
        expenses: {
          total: expenses?.length || 0,
          byCategory: expensesByCategory,
          items: expenses || []
        },
        revenue: {
          total: allRevenue.length,
          bySource: revenueBySource,
          items: allRevenue
        }
      });
    }
    
    if (format === 'csv') {
      const csv = generateFinancialCSV({
        tour,
        expenses: expenses || [],
        revenue: allRevenue,
        summary: { totalRevenue, totalExpenses, netProfit, profitMargin }
      });
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial-report-${tour.id}.csv"`
        }
      });
    }
    
    // Generate HTML for PDF
    const html = generateFinancialHTML({
      tour,
      expenses: expenses || [],
      revenue: allRevenue,
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: parseFloat(profitMargin),
        expensesByCategory,
        revenueBySource
      }
    });
    
    return NextResponse.json({
      success: true,
      html: html,
      tour: {
        id: tour.id,
        name: tour.name
      }
    });
    
  } catch (error) {
    console.error('Financial report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial report', details: error.message },
      { status: 500 }
    );
  }
}

function generateFinancialHTML(data) {
  const { tour, expenses, revenue, summary } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Financial Report - ${tour.name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    .header {
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 5px;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
    }
    .summary-card .amount {
      font-size: 24px;
      font-weight: bold;
    }
    .summary-card.revenue .amount { color: #10b981; }
    .summary-card.expenses .amount { color: #ef4444; }
    .summary-card.profit .amount { color: ${summary.netProfit >= 0 ? '#10b981' : '#ef4444'}; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f0f0f0;
      font-weight: bold;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      border-bottom: 2px solid #000;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FINANCIAL REPORT</h1>
    <h2>${tour.name}</h2>
    <p><strong>${tour.artist_name || 'Artist'}</strong></p>
    <p>Generated: ${new Date().toLocaleDateString()}</p>
  </div>
  
  <div class="summary">
    <div class="summary-card revenue">
      <h3>Total Revenue</h3>
      <div class="amount">${tour.currency || 'GBP'} ${summary.totalRevenue.toLocaleString()}</div>
    </div>
    <div class="summary-card expenses">
      <h3>Total Expenses</h3>
      <div class="amount">${tour.currency || 'GBP'} ${summary.totalExpenses.toLocaleString()}</div>
    </div>
    <div class="summary-card profit">
      <h3>Net Profit</h3>
      <div class="amount">${tour.currency || 'GBP'} ${summary.netProfit.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <h3>Profit Margin</h3>
      <div class="amount">${summary.profitMargin}%</div>
    </div>
  </div>
  
  <div class="section">
    <h2>EXPENSES BY CATEGORY</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Amount</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(summary.expensesByCategory).map(([cat, amount]) => {
          const percentage = summary.totalExpenses > 0 ? ((amount / summary.totalExpenses) * 100).toFixed(1) : 0;
          return `
            <tr>
              <td>${cat}</td>
              <td>${tour.currency || 'GBP'} ${amount.toLocaleString()}</td>
              <td>${percentage}%</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>REVENUE BY SOURCE</h2>
    <table>
      <thead>
        <tr>
          <th>Source</th>
          <th>Amount</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(summary.revenueBySource).map(([source, amount]) => {
          const percentage = summary.totalRevenue > 0 ? ((amount / summary.totalRevenue) * 100).toFixed(1) : 0;
          return `
            <tr>
              <td>${source}</td>
              <td>${tour.currency || 'GBP'} ${amount.toLocaleString()}</td>
              <td>${percentage}%</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>EXPENSE DETAILS</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th>Vendor</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${expenses.map(exp => `
          <tr>
            <td>${new Date(exp.date).toLocaleDateString()}</td>
            <td>${exp.category}</td>
            <td>${exp.description}</td>
            <td>${exp.vendor || '-'}</td>
            <td>${tour.currency || 'GBP'} ${parseFloat(exp.amount).toLocaleString()}</td>
            <td>${exp.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>REVENUE DETAILS</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Source</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Payment Method</th>
        </tr>
      </thead>
      <tbody>
        ${revenue.map(rev => `
          <tr>
            <td>${rev.received_at ? new Date(rev.received_at).toLocaleDateString() : new Date(rev.created_at).toLocaleDateString()}</td>
            <td>${rev.source}</td>
            <td>${rev.description || '-'}</td>
            <td>${tour.currency || 'GBP'} ${parseFloat(rev.amount).toLocaleString()}</td>
            <td>${rev.payment_method || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; text-align: center; color: #666; font-size: 12px;">
    <p>Generated by MSC & Co Touring Platform</p>
    <p>${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
}

function generateFinancialCSV(data) {
  const { tour, expenses, revenue, summary } = data;
  
  let csv = `Financial Report - ${tour.name}\n`;
  csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  csv += `SUMMARY\n`;
  csv += `Total Revenue,${summary.totalRevenue}\n`;
  csv += `Total Expenses,${summary.totalExpenses}\n`;
  csv += `Net Profit,${summary.netProfit}\n`;
  csv += `Profit Margin,${summary.profitMargin}%\n\n`;
  
  csv += `EXPENSES\n`;
  csv += `Date,Category,Description,Vendor,Amount,Status\n`;
  expenses.forEach(exp => {
    csv += `${new Date(exp.date).toLocaleDateString()},${exp.category},"${exp.description}",${exp.vendor || ''},${exp.amount},${exp.status}\n`;
  });
  
  csv += `\nREVENUE\n`;
  csv += `Date,Source,Description,Amount,Payment Method\n`;
  revenue.forEach(rev => {
    const date = rev.received_at || rev.created_at;
    csv += `${new Date(date).toLocaleDateString()},${rev.source},"${rev.description || ''}",${rev.amount},${rev.payment_method || ''}\n`;
  });
  
  return csv;
}

