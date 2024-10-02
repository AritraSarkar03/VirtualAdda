import { AccessToken } from 'livekit-server-sdk';
import jwt_decode from 'jwt-decode'; // Install this package via npm

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

    if (!livekitApiKey || !livekitSecret) {
        console.error('Missing LiveKit API Key or Secret Key');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const token = new AccessToken(livekitApiKey, livekitSecret, {
            identity: userId,
        });

        token.addGrant({ roomJoin: true, room: roomName });
        token.setExpiration(Math.floor(Date.now() / 1000) + (60 * 60)); // 1 hour

        const jwt = token.toJwt();

        // Decode the JWT to inspect its claims
        const decoded = jwt_decode(jwt);
        console.log("Generated JWT:", jwt);
        console.log("Decoded JWT:", decoded);

        return res.status(200).json({ token: jwt });
    } catch (error) {
        console.error('Error generating token:', error);
        return res.status(500).json({ error: 'Failed to generate token' });
    }
}
