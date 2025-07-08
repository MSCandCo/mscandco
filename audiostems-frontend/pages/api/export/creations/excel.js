import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user has permission to export creations
    if (!['distribution_partner', 'super_admin', 'company_admin'].includes(session.user.userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { filters, columns, format, detailLevel } = req.body;

    // Forward the request to the backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/export/creations/excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        filters,
        columns,
        format,
        detailLevel
      })
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.text();
      return res.status(backendResponse.status).json({ message: error });
    }

    const blob = await backendResponse.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="msc-creations-export.xlsx"');
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 