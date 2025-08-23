export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Return empty roster for ground zero state
      res.status(200).json([]);
      break;

    case 'POST':
      // Handle adding new artist to label roster
      const newArtist = {
        id: `la-artist-${Date.now()}`,
        name: req.body.name,
        type: req.body.type,
        isni: req.body.isni,
        thumbnail: req.body.thumbnail || null,
        signedDate: new Date().toISOString().split('T')[0],
        contractStatus: 'active',
        releases: 0,
        totalStreams: 0
      };

      // TODO: Save to Supabase database
      res.status(201).json(newArtist);
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
