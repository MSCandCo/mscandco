import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      return handleGetProject(req, res, id);
    case 'PUT':
      return handleUpdateProject(req, res, id);
    case 'DELETE':
      return handleDeleteProject(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

async function handleGetProject(req, res, id) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Project not found' });
      }
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
}

async function handleUpdateProject(req, res, id) {
  try {
    const projectData = req.body;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
      method: 'PUT',
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
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
}

async function handleDeleteProject(req, res, id) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Project not found' });
      }
      throw new Error(`API responded with status: ${response.status}`);
    }

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
} 