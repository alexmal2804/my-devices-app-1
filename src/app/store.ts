import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import devicesReducer from '../features/devicesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    devices: devicesReducer,
  },
});

export default store;