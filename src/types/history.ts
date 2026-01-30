export interface HistoryEntry {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  headers: string;
  body: string;
}
