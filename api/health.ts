// Vercel Serverless Function for /api/health

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    status: 'ok',
    service: 'The Weather Company - AeroPulse Digital Air Intelligence (Vercel Serverless)',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.OPENWEATHER_API_KEY,
  });
}
