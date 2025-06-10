import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Device } from '../types'; // Importing the Device type

// Async thunk to fetch devices from Firebase
export const fetchDevices = createAsyncThunk('devices/fetchDevices', async (employeeId: string) => {
    const q = query(collection(db, 'devices'), where('empID', '==', employeeId));
    const snapshot = await getDocs(q);
    const devices: Device[] = [];
    snapshot.forEach((doc: any) => {
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