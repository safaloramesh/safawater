
export enum SaleType {
  GENERAL = 'GENERAL',
  SMALL = 'SMALL',
  LARGE = 'LARGE'
}

export enum Role {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export type PaymentMethod = 'CASH' | 'CREDIT';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  createdAt: number;
}

export interface CustomerPricing {
  general: number;
  small: number;
  large: number;
}

export interface SystemInfo {
  companyName: string;
  tagline: string;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicleNo?: string;
  defaultTier?: SaleType;
  pricing: CustomerPricing;
  isCredit: boolean;
  balance: number;
  creditLimit: number;
  createdAt: number;
}

export interface Pump {
  id: number;
  name: string;
  currentReading: number;
  status: 'active' | 'maintenance';
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  pumpId: number;
  startReading: number;
  endReading: number;
  quantity: number;
  rate: number;
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  currency: string;
  timestamp: number;
  vehicleNo: string;
  driverName: string;
  deliveryStatus: 'COLLECTED' | 'DELIVERED';
}

export interface AppState {
  customers: Customer[];
  pumps: Pump[];
  sales: Sale[];
  users: User[];
  defaultPricing: CustomerPricing;
  systemInfo: SystemInfo;
}
