
// api/generateToken.js
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
    // Check for POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, roomName } = req.body;

    // Validate input
    if (!userId || !roomName) {
        return res.status(400).json({ error: 'Missing userId or roomName' });
    }

    // Get LiveKit credentials from environment variables
    const livekitApiKey = process.env.LIVEKIT_API_KEY; 
    const livekitSecret = process.env.LIVEKIT_SECRET_KEY;
    console.log(livekitApiKey,livekitSecret);
    // Create the access token
    const token = new AccessToken(livekitApiKey, livekitSecret, {
        identity: userId, // Use the provided userId
    });
    console.log(token);

    // Grant room join permissions
    token.addGrant({ roomJoin: true, room: roomName });
    token.ttl = 3600; // Token valid for 1 hour
    console.log(token);
    // Return the generated token
    return res.json({ token: token.toJwt() });
}
