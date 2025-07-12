
// TypeScript declarations for the global DataStore
interface DataStore {
  setData(key: string, value: any): void;
  getData(key: string): any;
  getAllData(): Record<string, any>;
  subscribe(callback: (key: string, value: any, allData: Record<string, any>) => void): () => void;
  notifyListeners(key: string, value: any): void;
  clear(): void;
}

declare global {
  interface Window {
    dataStore: DataStore;
    analyze: () => Promise<void>;
    selectedCsvFile: File | null;
  }
}

export {};
