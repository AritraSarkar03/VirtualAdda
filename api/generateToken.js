import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, roomName } = req.body;
    if (!userId || !roomName) {
        return res.status(400).json({ error: 'Missing userId or roomName' });
    }

    const livekitApiKey = process.env.LIVEKIT_API_KEY; 
    const livekitSecret = process.env.LIVEKIT_SECRET_KEY;
    const token = new AccessToken(livekitApiKey, livekitSecret, {
        identity: userId, // Use the provided userId
    });
    
    token.addGrant({ roomJoin: true, room: roomName });
    token.ttl = 3600; // Token valid for 1 hour
    console.log(token);
    console.log("token:", token.toJwt())
    // Return the generated token
    return res.json({ token: token.toJwt() });
}
