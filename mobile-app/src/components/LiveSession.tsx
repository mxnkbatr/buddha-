
import * as React from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { LiveKitRoom, useTracks, VideoTrack, TrackReferenceOrPlaceholder } from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function LiveSession({ token, serverUrl, roomName, onDisconnect }: { token: string, serverUrl: string, roomName: string, onDisconnect: () => void }) {
    const [micEnabled, setMicEnabled] = React.useState(true);
    const [camEnabled, setCamEnabled] = React.useState(true);

    return (
        <View style={{ flex: 1, backgroundColor: '#800000' }}>
            <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                video={camEnabled}
                audio={micEnabled}
                onDisconnected={onDisconnect}
                options={{ adaptiveStream: true }}
            >
                <VideoConference
                    onToggleMic={() => setMicEnabled(!micEnabled)}
                    onToggleCam={() => setCamEnabled(!camEnabled)}
                    micEnabled={micEnabled}
                    camEnabled={camEnabled}
                    onDisconnect={onDisconnect}
                />
            </LiveKitRoom>
        </View>
    );
}

function VideoConference({ onToggleMic, onToggleCam, micEnabled, camEnabled, onDisconnect }: any) {
    const tracks = useTracks([
        Track.Source.Camera,
        Track.Source.ScreenShare,
    ]);

    const renderTrack = (track: TrackReferenceOrPlaceholder) => {
        if (!track.publication) return null;
        return (
            <View style={styles.participantView} key={track.participant.identity}>
                <VideoTrack
                    trackRef={track as any}
                    style={styles.videoTrack}
                    zOrder={1}
                />
                <View style={styles.participantLabel}>
                    <Text style={styles.participantName}>{track.participant.identity}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.videoGrid}>
                {tracks.map((track) => renderTrack(track))}
                {tracks.length === 0 && (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-white">Waiting for others to join...</Text>
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={onToggleMic} style={[styles.controlBtn, !micEnabled && styles.disabledBtn]}>
                    {micEnabled ? <Mic size={28} color="#800000" /> : <MicOff size={28} color="#800000" />}
                </TouchableOpacity>

                <TouchableOpacity onPress={onDisconnect} style={[styles.controlBtn, { backgroundColor: '#FFD700', width: 70, height: 70, borderRadius: 35 }]}>
                    <X size={36} color="#800000" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onToggleCam} style={[styles.controlBtn, !camEnabled && styles.disabledBtn]}>
                    {camEnabled ? <Video size={28} color="#800000" /> : <VideoOff size={28} color="#800000" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    participantView: {
        flex: 1,
        minWidth: '50%',
        minHeight: '50%',
        margin: 2,
        backgroundColor: '#292524',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    videoTrack: {
        flex: 1,
    },
    participantLabel: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 4,
        borderRadius: 4,
    },
    participantName: {
        color: 'white',
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 30,
    },
    controlBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFD700', // Gold
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    disabledBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        opacity: 0.5,
    }
});
