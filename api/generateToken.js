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

    if (!livekitApiKey || !livekitSecret) {
        console.error('Missing LiveKit API Key or Secret Key');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const token = new AccessToken(livekitApiKey, livekitSecret, {
            identity: userId,
        });

        token.addGrant({ roomJoin: true, room: roomName });
        token.ttl = 3600; // 1 hour

        // Await the toJwt() if it's asynchronous
        const jwt = await token.toJwt();

        console.log("Generated JWT:", jwt);

        return res.status(200).json({jwt});
    } catch (error) {
        console.error('Error generating token:', error);
        return res.status(500).json({ error: 'Failed to generate token' });
    }
}
