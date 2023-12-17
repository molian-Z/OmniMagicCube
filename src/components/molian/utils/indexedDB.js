// db.js
import Dexie from 'dexie';
import {
  dbName
} from './defaultData'
const db = new Dexie(dbName);
db.version(2).stores({
  i18n: '++id, key, UIName, value',
  attrs: '++id, key, UIName, value',
  slots: '++id, key, UIName, value'
});

export async function get(tableName, currentUI) {
  return await db[tableName].where("UIName").eq(currentUI).toArray()
}

export async function getAll(currentUI) {
  const tables = []
  for (let i = 0; i < db.tables.length; i++) {
    tables.push({
      type: db.tables[i].name,
      data: await db[db.tables[i].name].where("UIName").equals(currentUI).toArray()
    })
  }
  return tables
}

export async function add(tableName, data) {
  return db[tableName].add(data)
}
export async function deleteById(tableName, id) {
  return db[tableName].delete(id)
}
export async function update(tableName, query, data) {
  return db[tableName].update(query, data)
}