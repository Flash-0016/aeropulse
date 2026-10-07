// Vercel Serverless Function for /api/geocode

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query?.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
  const customKey = (req.headers['x-api-key'] as string) || (req.query?.apiKey as string);
  const activeKey = customKey && customKey.trim().length > 0 ? customKey.trim() : OPENWEATHER_API_KEY;

  try {
    if (activeKey && activeKey.trim().length > 0) {
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${activeKey}`;
      const response = await fetch(geocodeUrl);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    }

    const openGeoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const openRes = await fetch(openGeoUrl);
    if (openRes.ok) {
      const openGeo = await openRes.json();
      const mapped = (openGeo.results || []).map((r: any) => ({
        name: r.name,
        lat: r.latitude,
        lon: r.longitude,
        country: r.country_code || r.country,
        state: r.admin1,
      }));
      return res.json(mapped);
    }

    res.status(502).json({ error: 'Geocoding request failed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
