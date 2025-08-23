// Simple playlists API endpoint to prevent 404 errors
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return empty playlists for now
    res.status(200).json([]);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
