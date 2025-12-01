import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { PostmanCollection } from '../src/types/postman';

const getCollectionPath = () => path.join(app.getPath('userData'), 'collection.json');

const createDefaultCollection = (): PostmanCollection => ({
  info: {
    name: 'Rentgen Collection',
    description: 'Saved HTTP requests from Rentgen',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    {
      id: 'default',
      name: 'default',
      item: [],
    },
  ],
});

export function registerCollectionHandlers(): void {
  ipcMain.handle('load-collection', async () => {
    const collectionPath = getCollectionPath();
    try {
      if (fs.existsSync(collectionPath)) {
        const data = fs.readFileSync(collectionPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    }
    return createDefaultCollection();
  });

  ipcMain.handle('save-collection', async (_, collection) => {
    const collectionPath = getCollectionPath();
    try {
      fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Error saving collection:', error);
      return { success: false, error: String(error) };
    }
  });
}
