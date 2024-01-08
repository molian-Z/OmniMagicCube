// db.ts
import Dexie from 'dexie';
import {
  dbName
} from './defaultData'
const db: any = new Dexie(dbName);
db.version(2).stores({
  i18n: '++id, key, UIName, value',
  attrs: '++id, key, UIName, value',
  slots: '++id, key, UIName, value'
});
/**
 * 获取指定表名对应的数据表中指定UI的记录
 * @param {string} tableName - 表名
 * @param {string} currentUI - 当前UI名称
 * @returns {Promise<Array>} - 返回数据记录的数组
 */
export async function get(tableName: string, currentUI: string): Promise<Array<any>> {
  return await db[tableName].where("UIName").eq(currentUI).toArray()
}

export async function getAll(currentUI: string) {
  const tables = []
  for (let i = 0; i < db.tables.length; i++) {
    tables.push({
      type: db.tables[i].name,
      data: await db[db.tables[i].name].where("UIName").equals(currentUI).toArray()
    })
  }
  return tables
}

export async function add(tableName: string, data: any) {
  return db[tableName].add(data)
}
export async function deleteById(tableName: string, id: string | number) {
  return db[tableName].delete(id)
}
export async function update(tableName: string, query: any, data: any) {
  return db[tableName].update(query, data)
}