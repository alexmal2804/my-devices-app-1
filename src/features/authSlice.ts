import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Employee {
  id: string;
  tn: string;
  division: string;
  position: string;
  fio: string;
  location: string;
}

interface AuthState {
  employee: Employee | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  employee: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<Employee>) {
      state.employee = action.payload;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.employee = null;
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;