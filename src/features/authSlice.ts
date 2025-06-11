import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

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

export const fetchEmployeeData = createAsyncThunk(
  'auth/fetchEmployeeData',
  async (tn: string, { dispatch }) => {
    const q = query(collection(db, 'employees'), where('tn', '==', tn));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const employee = { id: doc.id, ...doc.data() } as Employee;
    dispatch(login(employee)); // <--- добавлено, чтобы employee попадал в store
    return employee;
  }
);

export const selectEmployee = (state: { auth: AuthState }) => state.auth.employee;

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