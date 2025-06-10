import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../firebase/config'; // Assuming you have a Firebase setup in config.ts
import { Device } from '../types'; // Importing the Device type

// Async thunk to fetch devices from Firebase
export const fetchDevices = createAsyncThunk('devices/fetchDevices', async (employeeId: string) => {
    const devicesRef = db.collection('devices'); // Adjust the collection name as per your Firestore structure
    const snapshot = await devicesRef.where('employeeId', '==', employeeId).get();
    const devices: Device[] = [];
    snapshot.forEach(doc => {
        devices.push({ id: doc.id, ...doc.data() } as Device);
    });
    return devices;
});

const devicesSlice = createSlice({
    name: 'devices',
    initialState: {
        devices: [] as Device[],
        loading: false,
        error: null as string | null,
    },
    reducers: {
        clearDevices: (state) => {
            state.devices = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDevices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDevices.fulfilled, (state, action) => {
                state.loading = false;
                state.devices = action.payload;
            })
            .addCase(fetchDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch devices';
            });
    },
});

export const { clearDevices } = devicesSlice.actions;

export default devicesSlice.reducer;