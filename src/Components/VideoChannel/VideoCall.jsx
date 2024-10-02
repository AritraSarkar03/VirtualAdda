import React, { useEffect, useState } from 'react';
import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { IconButton, Spinner, Box, Center } from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa6';
import { auth } from '../../firebase';
import jwt_decode from 'jwt-decode'; // Install via npm: npm install jwt-decode

// MyVideoConference Component
export const MyVideoConference = () => {
    const tracks = useTracks(
        [
            { source: 'camera', withPlaceholder: true },
            { source: 'microphone', withPlaceholder: true }, // Use 'microphone' instead of Track.Source.Audio
        ],
        { onlySubscribed: false },
    );

    const audioTrack = tracks.find(track => track.source === 'microphone');
    const videoTrack = tracks.find(track => track.source === 'camera');

    const toggleAudio = () => {
        if (audioTrack) {
            audioTrack.isMuted ? audioTrack.unmute() : audioTrack.mute();
        }
    };

    const toggleVideo = () => {
        if (videoTrack) {
            videoTrack.isEnabled ? videoTrack.disable() : videoTrack.enable();
        }
    };

    return (
        <div>
            <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
                <ParticipantTile />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <IconButton
                        onClick={toggleVideo}
                        icon={videoTrack && videoTrack.isEnabled ? <FaVideoSlash /> : <FaVideo />}
                        isRound
                        aria-label="Toggle Video"
                        m={2}
                    />
                    <IconButton
                        onClick={toggleAudio}
                        icon={audioTrack && !audioTrack.isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        isRound
                        aria-label="Toggle Audio"
                        m={2}
                    />
                </div>
            </GridLayout>
        </div>
    );
}

// VideoCall Component
const VideoCall = ({ roomName }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = auth.currentUser;
    const userId = user ? user.uid : null;

    useEffect(() => {
        if (!userId || !roomName) {
            setError('User not authenticated or room name missing.');
            setLoading(false);
            return;
        }

        const fetchToken = async () => {
            try {
                const response = await fetch('/api/generateToken', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId, roomName }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch token');
                }

                const data = await response.json();
                setToken(data.token);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching token:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchToken();
    }, [userId, roomName]);

    if (loading) {
        return (
            <Center height="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center height="100vh">
                <Box color="red.500">Error: {error}</Box>
            </Center>
        );
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.REACT_APP_WEBSOCKET_URL} // Ensure this is set correctly
            data-lk-theme="default"
            style={{ height: '100vh' }}
        >
            <MyVideoConference />
            <RoomAudioRenderer />
            <ControlBar />
        </LiveKitRoom>
    );
}

export default VideoCall;
