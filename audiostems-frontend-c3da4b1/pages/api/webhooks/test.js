// Simple webhook endpoint tester
export default function handler(req, res) {
  const timestamp = new Date().toISOString();
  
  console.log(`🔔 Webhook test received at ${timestamp}`);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  res.status(200).json({ 
    success: true,
    message: 'Webhook endpoint is working!',
    timestamp,
    method: req.method,
    userAgent: req.headers['user-agent'] || 'Unknown'
  });
}