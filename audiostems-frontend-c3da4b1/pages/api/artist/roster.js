export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Return empty roster for ground zero state
      return res.status(200).json([]);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('API: Error in roster handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 