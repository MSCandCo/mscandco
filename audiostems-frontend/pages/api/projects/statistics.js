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
    const { artistId } = req.query;

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (artistId) queryParams.append('artistId', artistId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/statistics?${queryParams.toString()}`, {
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
    console.error('Error fetching project statistics:', error);
    return res.status(500).json({ error: 'Failed to fetch project statistics' });
  }
} 