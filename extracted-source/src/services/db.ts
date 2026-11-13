import {
  RetailShop,
  Mechanic,
  Reborer,
  Employee,
  IdData,
  ShopMechanicLink,
  ReborerEmployeeLink,
  AppConfig,
  SyncQueueItem,
  DatabaseBackup,
  BackupValidationResult,
  RestoreResult,
  CategoryType,
  CustomFieldDefinition,
} from '../types';

const DB_NAME = 'JayAmbeDataEntryDB';
const DB_VERSION = 1;

export const DEFAULT_SEGMENTS = [
  '2-Wheeler',
  '3-Wheeler',
  '4-Wheeler (Passenger)',
  'Commercial Vehicle (LCV/HCV)',
  'Tractor & Agriculture',
  'Heavy Earthmover & Machinery',
  'Stationary & Industrial Engine',
];

class DatabaseService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Retail Shops
        if (!db.objectStoreNames.contains('retailShops')) {
          const store = db.createObjectStore('retailShops', { keyPath: 'id' });
          store.createIndex('shopName', 'shopName', { unique: false });
          store.createIndex('mobileNumber', 'mobileNumber', { unique: false });
          store.createIndex('ownerName', 'ownerName', { unique: false });
        }

        // 2. Mechanics
        if (!db.objectStoreNames.contains('mechanics')) {
          const store = db.createObjectStore('mechanics', { keyPath: 'id' });
          store.createIndex('garageName', 'garageName', { unique: false });
          store.createIndex('ownerMobileNumber', 'ownerMobileNumber', { unique: false });
          store.createIndex('ownerName', 'ownerName', { unique: false });
        }

        // 3. Reborers
        if (!db.objectStoreNames.contains('reborers')) {
          const store = db.createObjectStore('reborers', { keyPath: 'id' });
          store.createIndex('repoweringName', 'repoweringName', { unique: false });
          store.createIndex('ownerMobileNumber', 'ownerMobileNumber', { unique: false });
        }

        // 4. Employees
        if (!db.objectStoreNames.contains('employees')) {
          const store = db.createObjectStore('employees', { keyPath: 'id' });
          store.createIndex('employeeName', 'employeeName', { unique: false });
          store.createIndex('mobileNumber', 'mobileNumber', { unique: false });
        }

        // 5. ID Data
        if (!db.objectStoreNames.contains('idData')) {
          const store = db.createObjectStore('idData', { keyPath: 'id' });
          store.createIndex('firmName', 'firmName', { unique: false });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('aadhaarNumber', 'aadhaarNumber', { unique: false });
          store.createIndex('panNumber', 'panNumber', { unique: false });
        }

        // 6. Shop-Mechanic Links
        if (!db.objectStoreNames.contains('shopMechanicLinks')) {
          const store = db.createObjectStore('shopMechanicLinks', { keyPath: 'id' });
          store.createIndex('shopId', 'shopId', { unique: false });
          store.createIndex('mechanicId', 'mechanicId', { unique: false });
        }

        // 7. Reborer-Employee Links
        if (!db.objectStoreNames.contains('reborerEmployeeLinks')) {
          const store = db.createObjectStore('reborerEmployeeLinks', { keyPath: 'id' });
          store.createIndex('repoweringId', 'reborerId', { unique: false });
          store.createIndex('employeeId', 'employeeId', { unique: false });
        }

        // 8. App Config / Settings
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }

        // 9. Sync Queue
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T> | void
  ): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      if (request) {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } else {
        transaction.oncomplete = () => resolve(undefined as unknown as T);
        transaction.onerror = () => reject(transaction.error);
      }
    });
  }

  // =================== CATEGORY CUSTOM FIELDS ===================

  async getCustomFields(category: CategoryType): Promise<CustomFieldDefinition[]> {
    const config = await this.getAppConfig();
    return config.customFields?.[category] || [];
  }

  async saveCustomFields(category: CategoryType, fields: CustomFieldDefinition[]): Promise<void> {
    const config = await this.getAppConfig();
    await this.saveAppConfig({
      customFields: { ...(config.customFields || {}), [category]: fields },
    });
  }

  // =================== CONFIG & SEGMENTS ===================

  async getSegments(): Promise<string[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('config', 'readonly');
        const store = tx.objectStore('config');
        const req = store.get('segments');
        req.onsuccess = () => {
          if (req.result && Array.isArray(req.result.value)) {
            resolve(req.result.value);
          } else {
            resolve(DEFAULT_SEGMENTS);
          }
        };
        req.onerror = () => resolve(DEFAULT_SEGMENTS);
      });
    } catch {
      return DEFAULT_SEGMENTS;
    }
  }

  async saveSegments(segments: string[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('config', 'readwrite');
      const store = tx.objectStore('config');
      const req = store.put({ key: 'segments', value: segments });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async addSegment(segment: string): Promise<string[]> {
    const current = await this.getSegments();
    const trimmed = segment.trim();
    if (!trimmed || current.includes(trimmed)) return current;
    const updated = [...current, trimmed];
    await this.saveSegments(updated);
    return updated;
  }

  async getAppConfig(): Promise<AppConfig> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('config', 'readonly');
        const store = tx.objectStore('config');
        const req = store.get('appConfig');
        req.onsuccess = () => {
          if (req.result && req.result.value) {
            resolve(req.result.value);
          } else {
            resolve({ segments: DEFAULT_SEGMENTS });
          }
        };
        req.onerror = () => resolve({ segments: DEFAULT_SEGMENTS });
      });
    } catch {
      return { segments: DEFAULT_SEGMENTS };
    }
  }

  async saveAppConfig(config: Partial<AppConfig>): Promise<void> {
    const current = await this.getAppConfig();
    const updated = { ...current, ...config };
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('config', 'readwrite');
      const store = tx.objectStore('config');
      const req = store.put({ key: 'appConfig', value: updated });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // =================== RETAIL SHOP CRUD ===================

  async getRetailShops(): Promise<RetailShop[]> {
    return this.performTransaction<RetailShop[]>('retailShops', 'readonly', (store) =>
      store.getAll()
    );
  }

  async getRetailShopById(id: string): Promise<RetailShop | undefined> {
    return this.performTransaction<RetailShop | undefined>('retailShops', 'readonly', (store) =>
      store.get(id)
    );
  }

  async saveRetailShop(shop: RetailShop): Promise<void> {
    await this.performTransaction('retailShops', 'readwrite', (store) =>
      store.put(shop)
    );
    await this.addToSyncQueue('retailShops', shop.id, 'UPDATE', shop);
  }

  async deleteRetailShop(id: string): Promise<void> {
    // Safely remove relations without deleting the linked mechanics
    const links = await this.getLinksForShop(id);
    for (const link of links) {
      await this.deleteShopMechanicLink(link.id);
    }
    await this.performTransaction('retailShops', 'readwrite', (store) =>
      store.delete(id)
    );
    await this.addToSyncQueue('retailShops', id, 'DELETE');
  }

  // =================== MECHANIC CRUD ===================

  async getMechanics(): Promise<Mechanic[]> {
    return this.performTransaction<Mechanic[]>('mechanics', 'readonly', (store) =>
      store.getAll()
    );
  }

  async getMechanicById(id: string): Promise<Mechanic | undefined> {
    return this.performTransaction<Mechanic | undefined>('mechanics', 'readonly', (store) =>
      store.get(id)
    );
  }

  async findMechanicByNameOrMobile(query: string): Promise<Mechanic[]> {
    const all = await this.getMechanics();
    const cleanQuery = query.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    return all.filter((m) => {
      const matchGarage = m.garageName?.toLowerCase().includes(cleanQuery);
      const matchOwner = m.ownerName?.toLowerCase().includes(cleanQuery);
      const matchMobile = cleanDigits && (
        m.ownerMobileNumber?.includes(cleanDigits) ||
        m.foremanMobileNumber?.includes(cleanDigits)
      );
      return matchGarage || matchOwner || matchMobile;
    });
  }

  async saveMechanic(mechanic: Mechanic): Promise<void> {
    await this.performTransaction('mechanics', 'readwrite', (store) =>
      store.put(mechanic)
    );
    await this.addToSyncQueue('mechanics', mechanic.id, 'UPDATE', mechanic);
  }

  async deleteMechanic(id: string): Promise<void> {
    // Remove links safely without deleting retail shops
    const links = await this.getLinksForMechanic(id);
    for (const link of links) {
      await this.deleteShopMechanicLink(link.id);
    }
    await this.performTransaction('mechanics', 'readwrite', (store) =>
      store.delete(id)
    );
    await this.addToSyncQueue('mechanics', id, 'DELETE');
  }

  // =================== REBORER CRUD ===================

  async getReborers(): Promise<Reborer[]> {
    return this.performTransaction<Reborer[]>('reborers', 'readonly', (store) =>
      store.getAll()
    );
  }

  async getReborerById(id: string): Promise<Reborer | undefined> {
    return this.performTransaction<Reborer | undefined>('reborers', 'readonly', (store) =>
      store.get(id)
    );
  }

  async saveReborer(reborer: Reborer): Promise<void> {
    await this.performTransaction('reborers', 'readwrite', (store) =>
      store.put(reborer)
    );
    await this.addToSyncQueue('reborers', reborer.id, 'UPDATE', reborer);
  }

  async deleteReborer(id: string): Promise<void> {
    // Remove employee links safely without deleting employees
    const links = await this.getLinksForReborer(id);
    for (const link of links) {
      await this.deleteReborerEmployeeLink(link.id);
    }
    await this.performTransaction('reborers', 'readwrite', (store) =>
      store.delete(id)
    );
    await this.addToSyncQueue('reborers', id, 'DELETE');
  }

  // =================== EMPLOYEE CRUD ===================

  async getEmployees(): Promise<Employee[]> {
    return this.performTransaction<Employee[]>('employees', 'readonly', (store) =>
      store.getAll()
    );
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    return this.performTransaction<Employee | undefined>('employees', 'readonly', (store) =>
      store.get(id)
    );
  }

  async findEmployeeByNameOrMobile(query: string): Promise<Employee[]> {
    const all = await this.getEmployees();
    const cleanQuery = query.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    return all.filter((e) => {
      const matchName = e.employeeName?.toLowerCase().includes(cleanQuery);
      const matchMobile = cleanDigits && e.mobileNumber?.includes(cleanDigits);
      return matchName || matchMobile;
    });
  }

  async saveEmployee(employee: Employee): Promise<void> {
    await this.performTransaction('employees', 'readwrite', (store) =>
      store.put(employee)
    );
    await this.addToSyncQueue('employees', employee.id, 'UPDATE', employee);
  }

  async deleteEmployee(id: string): Promise<void> {
    // Remove links safely without deleting reborers
    const links = await this.getLinksForEmployee(id);
    for (const link of links) {
      await this.deleteReborerEmployeeLink(link.id);
    }
    await this.performTransaction('employees', 'readwrite', (store) =>
      store.delete(id)
    );
    await this.addToSyncQueue('employees', id, 'DELETE');
  }

  // =================== ID DATA CRUD ===================

  async getIdDataList(): Promise<IdData[]> {
    return this.performTransaction<IdData[]>('idData', 'readonly', (store) =>
      store.getAll()
    );
  }

  async getIdDataById(id: string): Promise<IdData | undefined> {
    return this.performTransaction<IdData | undefined>('idData', 'readonly', (store) =>
      store.get(id)
    );
  }

  async saveIdData(record: IdData): Promise<void> {
    await this.performTransaction('idData', 'readwrite', (store) =>
      store.put(record)
    );
    await this.addToSyncQueue('idData', record.id, 'UPDATE', record);
  }

  async deleteIdData(id: string): Promise<void> {
    await this.performTransaction('idData', 'readwrite', (store) =>
      store.delete(id)
    );
    await this.addToSyncQueue('idData', id, 'DELETE');
  }

  // =================== RELATIONSHIPS & LINKING ===================

  // --- Shop <-> Mechanic ---
  async getAllShopMechanicLinks(): Promise<ShopMechanicLink[]> {
    return this.performTransaction<ShopMechanicLink[]>('shopMechanicLinks', 'readonly', (store) =>
      store.getAll()
    );
  }

  async getLinksForShop(shopId: string): Promise<ShopMechanicLink[]> {
    const all = await this.getAllShopMechanicLinks();
    return all.filter((link) => link.shopId === shopId);
  }

  async getLinksForMechanic(mechanicId: string): Promise<ShopMechanicLink[]> {
    const all = await this.getAllShopMechanicLinks();
    return all.filter((link) => link.mechanicId === mechanicId);
  }

  async getLinkedMechanicsForShop(shopId: string): Promise<Mechanic[]> {
    const links = await this.getLinksForShop(shopId);
    const mechanics: Mechanic[] = [];
    for (const link of links) {
      const m = await this.getMechanicById(link.mechanicId);
      if (m) mechanics.push(m);
    }
    return mechanics;
  }

  async getLinkedShopsForMechanic(mechanicId: string): Promise<RetailShop[]> {
    const links = await this.getLinksForMechanic(mechanicId);
    const shops: RetailShop[] = [];
    for (const link of links) {
      const s = await this.getRetailShopById(link.shopId);
      if (s) shops.push(s);
    }
    return shops;
  }

  async linkMechanicToShop(shopId: string, mechanicId: string): Promise<ShopMechanicLink> {
    // Check if already linked
    const existing = await this.getLinksForShop(shopId);
    const duplicate = existing.find((l) => l.mechanicId === mechanicId);
    if (duplicate) return duplicate;

    const link: ShopMechanicLink = {
      id: `link_sm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      shopId,
      mechanicId,
      linkedAt: Date.now(),
    };

    await this.performTransaction('shopMechanicLinks', 'readwrite', (store) =>
      store.put(link)
    );
    await this.addToSyncQueue('shopMechanicLinks', link.id, 'CREATE', link);
    return link;
  }

  async unlinkMechanicFromShop(shopId: string, mechanicId: string): Promise<void> {
    const links = await this.getLinksForShop(shopId);
    const target = links.find((l) => l.mechanicId === mechanicId);
    if (target) {
      await this.deleteShopMechanicLink(target.id);
    }
  }

  private async deleteShopMechanicLink(linkId: string): Promise<void> {
    await this.performTransaction('shopMechanicLinks', 'readwrite', (store) =>
      store.delete(linkId)
    );
    await this.addToSyncQueue('shopMechanicLinks', linkId, 'DELETE');
  }

  // --- Reborer <-> Employee ---
  async getAllReborerEmployeeLinks(): Promise<ReborerEmployeeLink[]> {
    return this.performTransaction<ReborerEmployeeLink[]>('reborerEmployeeLinks', 'readonly', (store) =>
      store.getAll()
    );
  }

  async getLinksForReborer(reborerId: string): Promise<ReborerEmployeeLink[]> {
    const all = await this.getAllReborerEmployeeLinks();
    return all.filter((l) => l.reborerId === reborerId);
  }

  async getLinksForEmployee(employeeId: string): Promise<ReborerEmployeeLink[]> {
    const all = await this.getAllReborerEmployeeLinks();
    return all.filter((l) => l.employeeId === employeeId);
  }

  async getLinkedEmployeesForReborer(reborerId: string): Promise<Employee[]> {
    const links = await this.getLinksForReborer(reborerId);
    const employees: Employee[] = [];
    for (const link of links) {
      const e = await this.getEmployeeById(link.employeeId);
      if (e) employees.push(e);
    }
    return employees;
  }

  async getLinkedReborersForEmployee(employeeId: string): Promise<Reborer[]> {
    const links = await this.getLinksForEmployee(employeeId);
    const reborers: Reborer[] = [];
    for (const link of links) {
      const r = await this.getReborerById(link.reborerId);
      if (r) reborers.push(r);
    }
    return reborers;
  }

  async linkEmployeeToReborer(reborerId: string, employeeId: string): Promise<ReborerEmployeeLink> {
    // Check if already linked
    const existing = await this.getLinksForReborer(reborerId);
    const duplicate = existing.find((l) => l.employeeId === employeeId);
    if (duplicate) return duplicate;

    const link: ReborerEmployeeLink = {
      id: `link_re_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reborerId,
      employeeId,
      linkedAt: Date.now(),
    };

    await this.performTransaction('reborerEmployeeLinks', 'readwrite', (store) =>
      store.put(link)
    );
    await this.addToSyncQueue('reborerEmployeeLinks', link.id, 'CREATE', link);
    return link;
  }

  async unlinkEmployeeFromReborer(reborerId: string, employeeId: string): Promise<void> {
    const links = await this.getLinksForReborer(reborerId);
    const target = links.find((l) => l.employeeId === employeeId);
    if (target) {
      await this.deleteReborerEmployeeLink(target.id);
    }
  }

  private async deleteReborerEmployeeLink(linkId: string): Promise<void> {
    await this.performTransaction('reborerEmployeeLinks', 'readwrite', (store) =>
      store.delete(linkId)
    );
    await this.addToSyncQueue('reborerEmployeeLinks', linkId, 'DELETE');
  }

  // =================== SYNC QUEUE ===================

  private async addToSyncQueue(
    entity: SyncQueueItem['entity'],
    recordId: string,
    action: SyncQueueItem['action'],
    payload?: any
  ): Promise<void> {
    try {
      const item: SyncQueueItem = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        action,
        entity,
        recordId,
        payload,
        timestamp: Date.now(),
      };
      await this.performTransaction('syncQueue', 'readwrite', (store) =>
        store.put(item)
      );
    } catch (e) {
      console.warn('Could not add to sync queue:', e);
    }
  }

  async getPendingSyncCount(): Promise<number> {
    try {
      const items = await this.performTransaction<SyncQueueItem[]>('syncQueue', 'readonly', (store) =>
        store.getAll()
      );
      return items.length;
    } catch {
      return 0;
    }
  }

  async clearSyncQueue(): Promise<void> {
    await this.performTransaction('syncQueue', 'readwrite', (store) =>
      store.clear()
    );
  }

  // =================== OVERALL STATS ===================

  async getDashboardStats() {
    const [shops, mechanics, reborers, employees, idData, shopLinks] = await Promise.all([
      this.getRetailShops(),
      this.getMechanics(),
      this.getReborers(),
      this.getEmployees(),
      this.getIdDataList(),
      this.getAllShopMechanicLinks(),
    ]);

    return {
      totalShops: shops.length,
      totalMechanics: mechanics.length,
      totalReborers: reborers.length,
      totalIdRecords: idData.length,
      totalEmployees: employees.length,
      totalConnectedMechanics: shopLinks.length,
    };
  }

  // =================== COMPREHENSIVE BACKUP & RESTORE ===================

  async exportDatabaseBackup(): Promise<DatabaseBackup> {
    const [shops, mechanics, reborers, employees, idData, shopLinks, rebLinks, segments, appConfig] =
      await Promise.all([
        this.getRetailShops(),
        this.getMechanics(),
        this.getReborers(),
        this.getEmployees(),
        this.getIdDataList(),
        this.getAllShopMechanicLinks(),
        this.getAllReborerEmployeeLinks(),
        this.getSegments(),
        this.getAppConfig(),
      ]);

    const backup: DatabaseBackup = {
      app: 'JAY AMBE DATA ENTRY APP',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      schemaVersion: DB_VERSION,
      metadata: {
        totalShops: shops.length,
        totalMechanics: mechanics.length,
        totalReborers: reborers.length,
        totalEmployees: employees.length,
        totalIdRecords: idData.length,
        totalShopMechanicLinks: shopLinks.length,
        totalReborerEmployeeLinks: rebLinks.length,
      },
      data: {
        retailShops: shops,
        mechanics,
        reborers,
        employees,
        idData,
        shopMechanicLinks: shopLinks,
        reborerEmployeeLinks: rebLinks,
        segments,
        appConfig,
      },
    };

    return backup;
  }

  validateBackupFile(parsed: any): BackupValidationResult {
    const emptyCounts = {
      retailShops: 0,
      mechanics: 0,
      reborers: 0,
      employees: 0,
      idData: 0,
      shopMechanicLinks: 0,
      reborerEmployeeLinks: 0,
      segments: 0,
    };

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, counts: emptyCounts, error: 'File is not a valid JSON object.' };
    }

    // Support both structured backup format { data: { ... } } and raw data export
    const payload = parsed.data || parsed;

    const counts = {
      retailShops: Array.isArray(payload.retailShops) ? payload.retailShops.length : 0,
      mechanics: Array.isArray(payload.mechanics) ? payload.mechanics.length : 0,
      reborers: Array.isArray(payload.reborers) ? payload.reborers.length : 0,
      employees: Array.isArray(payload.employees) ? payload.employees.length : 0,
      idData: Array.isArray(payload.idData) ? payload.idData.length : 0,
      shopMechanicLinks: Array.isArray(payload.shopMechanicLinks) ? payload.shopMechanicLinks.length : 0,
      reborerEmployeeLinks: Array.isArray(payload.reborerEmployeeLinks) ? payload.reborerEmployeeLinks.length : 0,
      segments: Array.isArray(payload.segments) ? payload.segments.length : 0,
    };

    const totalRecords =
      counts.retailShops +
      counts.mechanics +
      counts.reborers +
      counts.employees +
      counts.idData +
      counts.shopMechanicLinks +
      counts.reborerEmployeeLinks;

    if (totalRecords === 0 && counts.segments === 0) {
      return {
        isValid: false,
        counts,
        error: 'No recognized database records or tables found in this file.',
      };
    }

    return {
      isValid: true,
      app: parsed.app || 'JAY AMBE DATA ENTRY APP',
      version: parsed.version || '1.0',
      exportedAt: parsed.exportedAt,
      counts,
    };
  }

  async restoreDatabaseBackup(backup: any, mode: 'merge' | 'replace' = 'merge'): Promise<RestoreResult> {
    const payload = backup.data || backup;

    if (mode === 'replace') {
      await this.clearAllDatabaseData();
    }

    const restoredCounts = {
      retailShops: 0,
      mechanics: 0,
      reborers: 0,
      employees: 0,
      idData: 0,
      shopMechanicLinks: 0,
      reborerEmployeeLinks: 0,
    };

    // 1. Retail Shops
    if (Array.isArray(payload.retailShops)) {
      for (const shop of payload.retailShops) {
        if (shop && shop.id && shop.shopName) {
          await this.performTransaction('retailShops', 'readwrite', (store) => store.put(shop));
          restoredCounts.retailShops++;
        }
      }
    }

    // 2. Mechanics
    if (Array.isArray(payload.mechanics)) {
      for (const mech of payload.mechanics) {
        if (mech && mech.id && mech.garageName) {
          await this.performTransaction('mechanics', 'readwrite', (store) => store.put(mech));
          restoredCounts.mechanics++;
        }
      }
    }

    // 3. Reborers
    if (Array.isArray(payload.reborers)) {
      for (const reb of payload.reborers) {
        if (reb && reb.id && reb.repoweringName) {
          await this.performTransaction('reborers', 'readwrite', (store) => store.put(reb));
          restoredCounts.reborers++;
        }
      }
    }

    // 4. Employees
    if (Array.isArray(payload.employees)) {
      for (const emp of payload.employees) {
        if (emp && emp.id && emp.employeeName) {
          await this.performTransaction('employees', 'readwrite', (store) => store.put(emp));
          restoredCounts.employees++;
        }
      }
    }

    // 5. ID Data
    if (Array.isArray(payload.idData)) {
      for (const item of payload.idData) {
        if (item && item.id && item.firmName) {
          await this.performTransaction('idData', 'readwrite', (store) => store.put(item));
          restoredCounts.idData++;
        }
      }
    }

    // 6. Shop-Mechanic Links
    if (Array.isArray(payload.shopMechanicLinks)) {
      for (const link of payload.shopMechanicLinks) {
        if (link && link.id && link.shopId && link.mechanicId) {
          await this.performTransaction('shopMechanicLinks', 'readwrite', (store) => store.put(link));
          restoredCounts.shopMechanicLinks++;
        }
      }
    }

    // 7. Reborer-Employee Links
    if (Array.isArray(payload.reborerEmployeeLinks)) {
      for (const link of payload.reborerEmployeeLinks) {
        if (link && link.id && link.reborerId && link.employeeId) {
          await this.performTransaction('reborerEmployeeLinks', 'readwrite', (store) => store.put(link));
          restoredCounts.reborerEmployeeLinks++;
        }
      }
    }

    // 8. Segments
    if (Array.isArray(payload.segments) && payload.segments.length > 0) {
      if (mode === 'replace') {
        await this.saveSegments(payload.segments);
      } else {
        const currentSegments = await this.getSegments();
        const merged = Array.from(new Set([...currentSegments, ...payload.segments]));
        await this.saveSegments(merged);
      }
    }

    // 9. App Config
    if (payload.appConfig) {
      await this.saveAppConfig(payload.appConfig);
    }

    return {
      success: true,
      mode,
      restoredCounts,
      timestamp: new Date().toISOString(),
    };
  }

  async clearAllDatabaseData(): Promise<void> {
    const stores = [
      'retailShops',
      'mechanics',
      'reborers',
      'employees',
      'idData',
      'shopMechanicLinks',
      'reborerEmployeeLinks',
      'syncQueue',
    ];

    for (const storeName of stores) {
      await this.performTransaction(storeName, 'readwrite', (store) => store.clear());
    }
  }
}

export const dbService = new DatabaseService();
