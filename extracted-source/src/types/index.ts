export type CategoryType = 'RETAIL_SHOP' | 'MECHANIC' | 'REBORER' | 'ID_DATA';

export interface CustomFieldDefinition {
  id: string;
  name: string;
}

export interface RetailShop {
  customFields?: Record<string, string>;
  id: string;
  shopName: string;
  ownerName: string;
  mobileNumber: string; // Exactly 10 digits
  address: string;
  dateOfBirth?: string; // YYYY-MM-DD
  segment: string;
  createdAt: number;
  updatedAt: number;
  synced?: boolean;
}

export interface Mechanic {
  customFields?: Record<string, string>;
  id: string;
  garageName: string;
  ownerName: string;
  ownerMobileNumber: string; // Exactly 10 digits
  foremanName?: string;
  foremanMobileNumber?: string; // 10 digits if entered
  address: string;
  dateOfBirth?: string;
  dealInSegments: string[]; // Multi-select
  purchaseName?: string;
  remark?: string;
  createdAt: number;
  updatedAt: number;
  synced?: boolean;
}

export interface Reborer {
  customFields?: Record<string, string>;
  id: string;
  repoweringName: string;
  ownerMobileNumber: string; // Exactly 10 digits
  address: string;
  dateOfBirth?: string;
  segment: string;
  remark?: string;
  createdAt: number;
  updatedAt: number;
  synced?: boolean;
}

export interface Employee {
  id: string;
  employeeName: string;
  dateOfBirth?: string;
  mobileNumber: string; // 10 digits
  createdAt: number;
  updatedAt: number;
  synced?: boolean;
}

export interface IdData {
  customFields?: Record<string, string>;
  id: string;
  firmName: string;
  name: string;
  idName: string;
  encryptedPassword: {
    ciphertext: string;
    iv: string;
    tag: string;
  };
  aadhaarNumber: string; // Exactly 12 digits, validated by Verhoeff
  panNumber: string; // Exactly 10 chars, [A-Z]{5}[0-9]{4}[A-Z]{1}
  createdAt: number;
  updatedAt: number;
  synced?: boolean;
}

// Relational linking models
export interface ShopMechanicLink {
  id: string;
  shopId: string;
  mechanicId: string;
  linkedAt: number;
}

export interface ReborerEmployeeLink {
  id: string;
  reborerId: string;
  employeeId: string;
  linkedAt: number;
}

export interface AppConfig {
  segments: string[];
  customFields?: Partial<Record<CategoryType, CustomFieldDefinition[]>>;
  firebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  lastSyncTime?: number;
}

export interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'retailShops' | 'mechanics' | 'reborers' | 'employees' | 'idData' | 'shopMechanicLinks' | 'reborerEmployeeLinks';
  recordId: string;
  payload?: any;
  timestamp: number;
}

export interface DatabaseBackup {
  app: string;
  version: string;
  exportedAt: string;
  schemaVersion: number;
  metadata: {
    totalShops: number;
    totalMechanics: number;
    totalReborers: number;
    totalEmployees: number;
    totalIdRecords: number;
    totalShopMechanicLinks: number;
    totalReborerEmployeeLinks: number;
  };
  data: {
    retailShops: RetailShop[];
    mechanics: Mechanic[];
    reborers: Reborer[];
    employees: Employee[];
    idData: IdData[];
    shopMechanicLinks: ShopMechanicLink[];
    reborerEmployeeLinks: ReborerEmployeeLink[];
    segments: string[];
    appConfig?: AppConfig;
  };
}

export interface BackupValidationResult {
  isValid: boolean;
  app?: string;
  version?: string;
  exportedAt?: string;
  counts: {
    retailShops: number;
    mechanics: number;
    reborers: number;
    employees: number;
    idData: number;
    shopMechanicLinks: number;
    reborerEmployeeLinks: number;
    segments: number;
  };
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  mode: 'merge' | 'replace';
  restoredCounts: {
    retailShops: number;
    mechanics: number;
    reborers: number;
    employees: number;
    idData: number;
    shopMechanicLinks: number;
    reborerEmployeeLinks: number;
  };
  timestamp: string;
  error?: string;
}
