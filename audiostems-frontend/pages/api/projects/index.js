import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetProjects(req, res);
    case 'POST':
      return handleCreateProject(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

async function handleGetProjects(req, res) {
  try {
    const { search, status, releaseType, artist, genre, submissionDateFrom, submissionDateTo, expectedReleaseDateFrom, expectedReleaseDateTo, tags, budgetMin, budgetMax, sortBy = 'lastUpdated', sortOrder = 'desc' } = req.query;

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (releaseType) queryParams.append('releaseType', releaseType);
    if (artist) queryParams.append('artist', artist);
    if (genre) queryParams.append('genre', genre);
    if (submissionDateFrom) queryParams.append('submissionDateFrom', submissionDateFrom);
    if (submissionDateTo) queryParams.append('submissionDateTo', submissionDateTo);
    if (expectedReleaseDateFrom) queryParams.append('expectedReleaseDateFrom', expectedReleaseDateFrom);
    if (expectedReleaseDateTo) queryParams.append('expectedReleaseDateTo', expectedReleaseDateTo);
    if (tags) queryParams.append('tags', tags);
    if (budgetMin) queryParams.append('budgetMin', budgetMin);
    if (budgetMax) queryParams.append('budgetMax', budgetMax);
    if (sortBy) queryParams.append('sort', `${sortBy}:${sortOrder}`);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects?${queryParams.toString()}`, {
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
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function handleCreateProject(req, res) {
  try {
    const projectData = req.body;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: projectData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
} 