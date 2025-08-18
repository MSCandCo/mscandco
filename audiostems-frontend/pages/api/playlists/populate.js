// Playlists populate API endpoint to prevent 404 errors
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return empty result for now
    res.status(200).json({ success: true, data: [] });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
