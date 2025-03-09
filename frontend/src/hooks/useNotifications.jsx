// // Create a new file hooks/useNotifications.js
// import { useEffect, useRef } from 'react';
// import { useSettingsStore } from '../store/useSettingsStore';

// export const useNotifications = () => {
//     const { settings } = useSettingsStore();
//     const audioRef = useRef(null);

//     // Initialize audio
//     useEffect(() => {
//         audioRef.current = new Audio('/notification_sound.mp3');
//         audioRef.current.volume = settings.notifications.volume / 100;
//     }, []);

//     // Update volume when changed
//     useEffect(() => {
//         if (audioRef.current) {
//             audioRef.current.volume = settings.notifications.volume / 100;
//         }
//     }, [settings.notifications.volume]);

//     const playNotification = () => {
//         if (!settings.notifications.mute && audioRef.current) {
//             audioRef.current.play().catch(error => {
//                 console.log('Audio playback failed:', error);
//             });
//         }
//     };

//     return { playNotification };
// };

// hooks/useNotifications.js
import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export const useNotifications = () => {
    const { settings } = useSettingsStore();
    const audioRef = useRef(null);

    // Initialize audio
    useEffect(() => {
        // Use absolute path from public folder
        audioRef.current = new Audio('/notification_sound.mp3');
        audioRef.current.preload = 'auto';
        
        // Handle audio loading errors
        const handleError = (error) => {
            console.error('Audio error:', error);
        };

        audioRef.current.addEventListener('error', handleError);

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('error', handleError);
            }
        };
    }, []);

    // Update volume when changed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = settings.notifications.mute ? 0 : settings.notifications.volume / 100;
        }
    }, [settings.notifications.volume, settings.notifications.mute]);

    const playNotification = () => {
        if (!settings.notifications.mute && audioRef.current) {
            // Create a clone to allow multiple rapid plays
            const audioClone = audioRef.current.cloneNode(true);
            audioClone.volume = settings.notifications.volume / 100;
            
            audioClone.play().catch(error => {
                console.log('Audio playback failed:', error);
            });
        }
    };

    return { playNotification };
};