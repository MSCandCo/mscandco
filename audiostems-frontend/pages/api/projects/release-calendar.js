import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { startDate, endDate, releaseType, status, artist } = req.query;

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (releaseType) queryParams.append('releaseType', releaseType);
    if (status) queryParams.append('status', status);
    if (artist) queryParams.append('artist', artist);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/release-calendar?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching release calendar data:', error);
    return res.status(500).json({ error: 'Failed to fetch release calendar data' });
  }
} 