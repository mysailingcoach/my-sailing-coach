import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'sailingcoach.db');

let db;

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS races (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            filePath TEXT,
            data TEXT NOT NULL,
            uploadDate DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) { reject(err); return; }

          db.run(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL UNIQUE,
              passwordHash TEXT NOT NULL,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
    });
  });
}

export function saveRace(raceData) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO races (name, filePath, data, uploadDate)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      raceData.name,
      raceData.filePath,
      JSON.stringify(raceData.data),
      raceData.uploadDate,
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export function getRaces() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT id, name, uploadDate, createdAt FROM races 
      ORDER BY createdAt DESC
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export function getRaceById(id) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM races WHERE id = ?
    `, [id], (err, row) => {
      if (err) reject(err);
      else {
        if (row) {
          row.data = JSON.parse(row.data);
        }
        resolve(row);
      }
    });
  });
}

export function deleteRace(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM races WHERE id = ?`, [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

export function updateRaceData(id, newData) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE races SET data = ? WHERE id = ?`, [JSON.stringify(newData), id], function(err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

export function initUsersTable() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function createUser({ name, email, passwordHash }) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)`,
      [name, email, passwordHash],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, name, email, createdAt FROM users WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
