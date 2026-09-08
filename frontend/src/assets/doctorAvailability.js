// Store doctor availability data
export const doctorAvailability = {
    'doc1': {
        workingHours: {
            monday: { start: '10:00', end: '17:00' },
            tuesday: { start: '11:00', end: '19:00' },
            wednesday: { start: '10:00', end: '17:00' },
            thursday: { start: '09:00', end: '16:00' },
            friday: { start: '10:00', end: '18:00' },
            saturday: { start: '10:00', end: '15:00' },
            sunday: null // Doctor not available on Sunday
        },
        busySlots: [
            "2024-03-19T11:00:00",
            "2024-03-19T11:30:00",
            "2024-03-19T14:00:00"
        ]
    },
    'doc2': {
        workingHours: {
            monday: { start: '09:00', end: '16:00' },
            tuesday: { start: '10:00', end: '18:00' },
            wednesday: { start: '11:00', end: '19:00' },
            thursday: { start: '10:00', end: '17:00' },
            friday: { start: '09:00', end: '16:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: null
        },
        busySlots: [
            "2024-03-19T09:30:00",
            "2024-03-19T10:00:00"
        ]
    },
    'doc3': {
        workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: null
        },
        busySlots: []  // All slots available
    },
    'doc4': {
        workingHours: {
            monday: { start: '14:00', end: '20:00' },
            tuesday: { start: '14:00', end: '20:00' },
            wednesday: { start: '14:00', end: '20:00' },
            thursday: { start: '14:00', end: '20:00' },
            friday: { start: '14:00', end: '20:00' },
            saturday: null,
            sunday: null
        },
        busySlots: [
            "2024-03-19T15:00:00",
            "2024-03-19T15:30:00",
            "2024-03-19T16:00:00"
        ]
    },
    'doc5': {
        workingHours: {
            monday: { start: '10:00', end: '18:00' },
            tuesday: { start: '10:00', end: '18:00' },
            wednesday: { start: '10:00', end: '18:00' },
            thursday: { start: '10:00', end: '18:00' },
            friday: { start: '10:00', end: '18:00' },
            saturday: { start: '10:00', end: '15:00' },
            sunday: null
        },
        busySlots: []
    },
    'doc6': {
        workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: null,
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
            saturday: { start: '09:00', end: '13:00' },
            sunday: null
        },
        busySlots: []
    },
    'doc7': {
        workingHours: {
            monday: { start: '11:00', end: '19:00' },
            tuesday: { start: '11:00', end: '19:00' },
            wednesday: { start: '11:00', end: '19:00' },
            thursday: { start: '11:00', end: '19:00' },
            friday: { start: '11:00', end: '19:00' },
            saturday: null,
            sunday: null
        },
        busySlots: []
    },
    'doc8': {
        workingHours: {
            monday: { start: '08:00', end: '16:00' },
            tuesday: { start: '08:00', end: '16:00' },
            wednesday: { start: '08:00', end: '16:00' },
            thursday: { start: '08:00', end: '16:00' },
            friday: { start: '08:00', end: '16:00' },
            saturday: { start: '09:00', end: '13:00' },
            sunday: null
        },
        busySlots: []
    },
    'doc9': {
        workingHours: {
            monday: { start: '10:00', end: '18:00' },
            tuesday: { start: '10:00', end: '18:00' },
            wednesday: { start: '10:00', end: '18:00' },
            thursday: { start: '10:00', end: '18:00' },
            friday: { start: '10:00', end: '16:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: null
        },
        busySlots: []
    },
    'doc10': {
        workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' },
            saturday: null,
            sunday: null
        },
        busySlots: []
    }
};

// Helper function to get day name in lowercase
export const getDayName = (date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
};

// Helper function to check if a slot is within working hours
export const isWithinWorkingHours = (docId, dateTime) => {
    const dayName = getDayName(dateTime);
    const workingHours = doctorAvailability[docId]?.workingHours[dayName];
    
    if (!workingHours) return false; // Not working on this day
    
    const time = dateTime.toTimeString().slice(0, 5);
    return time >= workingHours.start && time <= workingHours.end;
};

// Helper function to check if a slot is busy
export const isSlotBusy = (docId, dateTime) => {
    const slotTime = dateTime.toISOString().slice(0, 19);
    return doctorAvailability[docId]?.busySlots.includes(slotTime);
};

// Helper function to get slot status
export const getSlotStatus = (docId, dateTime) => {
    if (!isWithinWorkingHours(docId, dateTime)) {
        return 'unavailable';
    }
    if (isSlotBusy(docId, dateTime)) {
        return 'busy';
    }
    return 'available';
}; 