
import { ref, set, onValue, update, onDisconnect, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { StudentProfile, LearningStats } from '../types';

export interface StudentSessionData {
    id: string;
    profile: StudentProfile;
    stats: LearningStats;
    isOnline: boolean;
    lastActive: number;
    currentActivity?: string; // e.g., "Speaking", "Video On", "Idle"
}

// Generate a consistent ID for this device
const getDeviceId = () => {
    let id = localStorage.getItem('lumi_device_id');
    if (!id) {
        id = 'student_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('lumi_device_id', id);
    }
    return id;
};

export const syncStudentStatus = (
    profile: StudentProfile, 
    stats: LearningStats, 
    status: string,
    activity: string
) => {
    if (!db) return;

    const deviceId = getDeviceId();
    const studentRef = ref(db, `students/${deviceId}`);

    // Data payload
    const data = {
        id: deviceId,
        profile,
        stats,
        isOnline: status === 'connected',
        lastActive: serverTimestamp(),
        currentActivity: activity,
        statusLabel: status
    };

    // Update data
    update(studentRef, data);

    // Setup "Presence" - if user disconnects/closes tab, mark as offline automatically
    const onlineRef = ref(db, `students/${deviceId}/isOnline`);
    onDisconnect(onlineRef).set(false);
    
    const statusRef = ref(db, `students/${deviceId}/statusLabel`);
    onDisconnect(statusRef).set('offline');
};

export const subscribeToAllStudents = (callback: (students: StudentSessionData[]) => void) => {
    if (!db) return () => {};

    const studentsRef = ref(db, 'students');
    
    const unsubscribe = onValue(studentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const studentList = Object.values(data) as StudentSessionData[];
            // Sort by online status first, then last active
            studentList.sort((a, b) => {
                if (a.isOnline === b.isOnline) return b.lastActive - a.lastActive;
                return a.isOnline ? -1 : 1;
            });
            callback(studentList);
        } else {
            callback([]);
        }
    });

    return unsubscribe;
};
