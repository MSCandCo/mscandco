/**
 * Touring Platform - Day Sheet Report Generator
 * Generates PDF day sheets for tour dates
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET - Generate day sheet PDF
 */
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const tourDateId = searchParams.get('tourDateId');
    
    if (!tourDateId) {
      return NextResponse.json(
        { error: 'tourDateId required' },
        { status: 400 }
      );
    }
    
    // Fetch tour date with all related data
    const { data: tourDate } = await supabaseAdmin
      .from('tour_dates')
      .select(`
        *,
        tours (*),
        venues (*)
      `)
      .eq('id', tourDateId)
      .single();
    
    if (!tourDate) {
      return NextResponse.json(
        { error: 'Tour date not found' },
        { status: 404 }
      );
    }
    
    // Fetch itinerary
    const { data: itinerary } = await supabaseAdmin
      .from('itinerary_items')
      .select('*')
      .eq('tour_date_id', tourDateId)
      .order('start_time', { ascending: true });
    
    // Fetch crew
    const { data: crew } = await supabaseAdmin
      .from('tour_crew')
      .select('*')
      .eq('tour_id', tourDate.tour_id)
      .order('role', { ascending: true });
    
    // Fetch guest list
    const { data: guests } = await supabaseAdmin
      .from('guest_lists')
      .select('*')
      .eq('tour_date_id', tourDateId)
      .order('guest_name', { ascending: true });
    
    // Fetch setlist
    const { data: setlists } = await supabaseAdmin
      .from('setlists')
      .select('*, setlist_songs(*, songs(*))')
      .eq('tour_date_id', tourDateId)
      .limit(1);
    
    const setlist = setlists?.[0];
    
    // Generate HTML for PDF
    const html = generateDaySheetHTML({
      tourDate,
      tour: tourDate.tours,
      venue: tourDate.venues,
      itinerary: itinerary || [],
      crew: crew || [],
      guests: guests || [],
      setlist: setlist || null
    });
    
    // Return HTML (can be converted to PDF on frontend or server)
    return NextResponse.json({
      success: true,
      html: html,
      tourDate: {
        id: tourDate.id,
        date: tourDate.date,
        city: tourDate.city,
        venue: tourDate.venues?.name
      }
    });
    
  } catch (error) {
    console.error('Day sheet generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate day sheet', details: error.message },
      { status: 500 }
    );
  }
}

function generateDaySheetHTML(data) {
  const { tourDate, tour, venue, itinerary, crew, guests, setlist } = data;
  const date = new Date(tourDate.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Day Sheet - ${formattedDate}</title>
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
    .header h2 {
      margin: 5px 0;
      font-size: 18px;
      color: #666;
    }
    .section {
      margin: 20px 0;
      page-break-inside: avoid;
    }
    .section h3 {
      background: #f0f0f0;
      padding: 8px;
      margin: 0 0 10px 0;
      font-size: 16px;
      border-left: 4px solid #000;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 10px 0;
    }
    .info-item {
      margin: 5px 0;
    }
    .info-label {
      font-weight: bold;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f0f0f0;
      font-weight: bold;
    }
    .itinerary-item {
      margin: 10px 0;
      padding: 10px;
      border-left: 3px solid #000;
      background: #f9f9f9;
    }
    .time {
      font-weight: bold;
      color: #000;
    }
    @media print {
      body { margin: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>DAY SHEET</h1>
    <h2>${formattedDate}</h2>
    <p><strong>${tour?.artist_name || 'Artist'}</strong> - ${tour?.name || 'Tour'}</p>
  </div>
  
  <div class="section">
    <h3>SHOW INFORMATION</h3>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Venue:</span> ${venue?.name || tourDate.city || 'TBA'}
      </div>
      <div class="info-item">
        <span class="info-label">City:</span> ${tourDate.city || 'TBA'}, ${tourDate.country || 'TBA'}
      </div>
      <div class="info-item">
        <span class="info-label">Doors:</span> ${tourDate.doors_time || 'TBA'}
      </div>
      <div class="info-item">
        <span class="info-label">Show Time:</span> ${tourDate.show_time || 'TBA'}
      </div>
      <div class="info-item">
        <span class="info-label">Capacity:</span> ${tourDate.capacity ? tourDate.capacity.toLocaleString() : 'TBA'}
      </div>
      <div class="info-item">
        <span class="info-label">Status:</span> ${tourDate.status || 'pending'}
      </div>
    </div>
    ${venue?.address ? `<p><strong>Address:</strong> ${venue.address}</p>` : ''}
    ${venue?.phone ? `<p><strong>Venue Phone:</strong> ${venue.phone}</p>` : ''}
  </div>
  
  ${itinerary.length > 0 ? `
  <div class="section">
    <h3>ITINERARY</h3>
    ${itinerary.map(item => `
      <div class="itinerary-item">
        <span class="time">${new Date(item.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
        ${item.end_time ? ` - ${new Date(item.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : ''}
        <strong> ${item.title}</strong>
        ${item.location ? `<br><em>${item.location}</em>` : ''}
        ${item.description ? `<br>${item.description}` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${crew.length > 0 ? `
  <div class="section">
    <h3>CREW</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Contact</th>
        </tr>
      </thead>
      <tbody>
        ${crew.map(member => `
          <tr>
            <td>${member.name}</td>
            <td>${member.role}</td>
            <td>${member.phone || member.email || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  ${setlist ? `
  <div class="section">
    <h3>SET LIST</h3>
    <ol>
      ${setlist.setlist_songs.map((song, index) => {
        if (song.is_break) {
          return `<li><strong>BREAK</strong> (${song.break_duration || 5} minutes)</li>`;
        }
        return `<li>${song.songs?.title || 'Song'}${song.songs?.artist ? ` - ${song.songs.artist}` : ''}</li>`;
      }).join('')}
    </ol>
  </div>
  ` : ''}
  
  ${guests.length > 0 ? `
  <div class="section">
    <h3>GUEST LIST</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Pass Type</th>
          <th>Guests</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${guests.map(guest => `
          <tr>
            <td>${guest.guest_name}</td>
            <td>${guest.pass_type}</td>
            <td>${1 + (guest.plus_ones || 0)}</td>
            <td>${guest.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
  
  ${tourDate.notes ? `
  <div class="section">
    <h3>NOTES</h3>
    <p>${tourDate.notes.replace(/\n/g, '<br>')}</p>
  </div>
  ` : ''}
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; text-align: center; color: #666; font-size: 12px;">
    <p>Generated by MSC & Co Touring Platform</p>
    <p>${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
}

