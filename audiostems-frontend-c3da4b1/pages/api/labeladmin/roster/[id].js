export default function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  switch (method) {
    case 'GET':
      // Return 404 for any specific artist lookup in ground zero state
      return res.status(404).json({ message: 'Artist not found' });

    case 'PUT':
      // TODO: Update artist in Supabase database
      return res.status(404).json({ message: 'Artist not found' });

    case 'DELETE':
      // TODO: Delete artist from Supabase database
      return res.status(404).json({ message: 'Artist not found' });

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
