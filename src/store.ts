import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from './features/authSlice';
import devicesReducer from './features/devicesSlice';

// Корневой reducer
const rootReducer = combineReducers({
    auth: authReducer,
    devices: devicesReducer,
    // ...other reducers...
});

// Конфиг для redux-persist
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'devices'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);