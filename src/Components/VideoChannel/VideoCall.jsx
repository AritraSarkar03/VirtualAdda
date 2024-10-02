import React from 'react';
import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";

export const MyVideoConference = () => {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.Audio, withPlaceholder: true }, // Make sure to include audio
        ],
        { onlySubscribed: false },
    );

    const audioTrack = tracks.find(track => track.source === Track.Source.Audio);
    const videoTrack = tracks.find(track => track.source === Track.Source.Camera);

    const toggleAudio = () => {
        if (audioTrack) {
            audioTrack.isMuted ? audioTrack.unmute() : audioTrack.mute();
        }
    };

    const toggleVideo = () => {
        if (videoTrack) {
            videoTrack.isMuted ? videoTrack.unmute() : videoTrack.mute();
        }
    };

    return (
        <div>
            <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
                <ParticipantTile />
            </GridLayout>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <IconButton
                    onClick={toggleVideo}
                    icon={videoTrack && videoTrack.isMuted ? <FaVideo /> : <FaVideoSlash />}
                    isRound
                />
                <IconButton
                    onClick={toggleAudio}
                    icon={audioTrack && audioTrack.isMuted ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    isRound
                />
            </div>
        </div>
    );
}

const VideoCall = ({ token }) => {
    const serverUrl = process.env.NEXT_PUBLIC_LK_SERVER_URL;

    if (!serverUrl) {
        console.error('No LiveKit URL provided.');
        return <div>Error: LiveKit URL is missing.</div>; // Optionally render an error UI
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={serverUrl}
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
