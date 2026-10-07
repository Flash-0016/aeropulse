// Vercel Serverless Function for /api/telemetry

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = new Date();
  res.status(200).json({
    pipelineStatus: 'OPERATIONAL',
    uptimePercentage: 99.98,
    ingestRatePerSec: Math.floor(1380 + Math.random() * 80),
    activeNodesCount: 84,
    lastSyncTimestamp: now.toISOString(),
    sensorDriftAvg: Number((0.05 + Math.random() * 0.04).toFixed(3)),
    networkLatencyMs: Math.floor(28 + Math.random() * 12),
    cpcbDataRelayMs: Math.floor(110 + Math.random() * 30),
    packetsDropped24h: 3,
    validationChecksum: 'SHA256:8f9a2c10b7d...6e41',
  });
}
