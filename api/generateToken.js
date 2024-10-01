// api/generateToken.js
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, roomName } = req.body;

  if (!userId || !roomName) {
    return res.status(400).json({ error: 'Missing userId or roomName' });
  }

  const livekitApiKey = process.env.LIVEKIT_API_KEY; // Set these in Vercel environment variables
  const livekitSecret = process.env.LIVEKIT_SECRET;

  const token = new AccessToken(livekitApiKey, livekitSecret, {
    identity: userId,
  });

  token.addGrant({ roomJoin: true, room: roomName });
  token.ttl = 3600; // Token expires in 1 hour

  res.json({ token: token.toJwt() });
}
