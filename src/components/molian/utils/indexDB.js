// db.js
import Dexie from 'dexie';
import {dbName} from './defaultData'
export const db = new Dexie(dbName);
console.log(db)
// db.version(1).stores({
//   friends: '++id, name, age', // Primary key and indexed props
// });