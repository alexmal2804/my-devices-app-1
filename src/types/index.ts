export interface Employee {
    id: string;
    tn: string;
    division: string;
    position: string;
    fio: string;
    location: string;
}

export interface Device {
    id: string;
    nomenclature: string;
    model: string;
    serialNumber: string;
    dateOfReceipt: string;
    status: string;
    ctc: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    employee: Employee | null;
}

export interface DevicesState {
    devices: Device[];
    loading: boolean;
    error: string | null;
}