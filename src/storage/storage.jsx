import * as SQLite from 'expo-sqlite';
import { SEED_IDEAS } from '../data/seedData.jsx';

const DB_NAME = 'lenslog.db';
// Increase this number if you ever add new seed data in the future
const SEED_VERSION = 1;

let dbPromise = null;
let initPromise = null;

// ---------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------

// Opens the database once and re-uses the same connection
function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

// Every function below calls this, so they are safe even if
// they run before initializeDatabase() has finished.
async function getReadyDb() {
  await initializeDatabase();
  return getDb();
}

// SQL column lists. "AS" renames snake_case columns to camelCase
// so the screens can use idea.shutterSpeed, shoot.shutterSpeed, etc.
const IDEA_COLUMNS =
  'i.id, i.title, i.category, i.description, i.iso, i.aperture, i.shutter_speed AS shutterSpeed';

const SHOOT_COLUMNS =
  'id, title, location, date, category, notes, iso, aperture, shutter_speed AS shutterSpeed, created_at AS createdAt';

// ---------------------------------------------------------------
// Database setup
// ---------------------------------------------------------------

async function runInitialization() {
  try {
    const db = await getDb();

    // Create tables (does nothing if they already exist)
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS ideas (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        iso TEXT NOT NULL,
        aperture TEXT NOT NULL,
        shutter_speed TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS shoots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        iso TEXT NOT NULL DEFAULT '',
        aperture TEXT NOT NULL DEFAULT '',
        shutter_speed TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS favorites (
        idea_id INTEGER PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
      );
    `);

    // Seed only once, using SQLite's built-in user_version number
    const row = await db.getFirstAsync('PRAGMA user_version');
    const currentVersion = row ? row.user_version : 0;

    if (currentVersion < SEED_VERSION) {
      await db.withTransactionAsync(async () => {
        for (const idea of SEED_IDEAS) {
          // INSERT OR IGNORE never overwrites an existing row
          await db.runAsync(
            `INSERT OR IGNORE INTO ideas
               (id, title, category, description, iso, aperture, shutter_speed)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              idea.id,
              idea.title,
              idea.category,
              idea.description,
              idea.iso,
              idea.aperture,
              idea.shutterSpeed,
            ]
          );
        }
      });
      await db.execAsync(`PRAGMA user_version = ${SEED_VERSION}`);
    }
  } catch (error) {
    console.error('initializeDatabase failed:', error);
    throw error;
  }
}

// Safe to call many times: the work only runs once
export function initializeDatabase() {
  if (!initPromise) {
    initPromise = runInitialization().catch((error) => {
      initPromise = null; // allow a retry
      throw error;
    });
  }
  return initPromise;
}

// ---------------------------------------------------------------
// Ideas
// ---------------------------------------------------------------

// Optional search text and category filter. Defaults return everything.
export async function getIdeas(searchText = '', category = 'All') {
  try {
    const db = await getReadyDb();
    let sql = `SELECT ${IDEA_COLUMNS} FROM ideas i WHERE 1 = 1`;
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND i.category = ?';
      params.push(category);
    }

    const text = (searchText || '').trim();
    if (text) {
      sql += ' AND (i.title LIKE ? OR i.description LIKE ?)';
      params.push(`%${text}%`, `%${text}%`);
    }

    sql += ' ORDER BY i.id ASC';
    return await db.getAllAsync(sql, params);
  } catch (error) {
    console.error('getIdeas failed:', error);
    throw error;
  }
}

export async function getIdeaById(id) {
  try {
    const db = await getReadyDb();
    const idea = await db.getFirstAsync(
      `SELECT ${IDEA_COLUMNS} FROM ideas i WHERE i.id = ?`,
      [id]
    );
    return idea || null;
  } catch (error) {
    console.error('getIdeaById failed:', error);
    throw error;
  }
}

// ---------------------------------------------------------------
// Shoots (journal records)
// ---------------------------------------------------------------

export async function getShoots(searchText = '', category = 'All') {
  try {
    const db = await getReadyDb();
    let sql = `SELECT ${SHOOT_COLUMNS} FROM shoots WHERE 1 = 1`;
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    const text = (searchText || '').trim();
    if (text) {
      sql += ' AND (title LIKE ? OR location LIKE ? OR notes LIKE ?)';
      params.push(`%${text}%`, `%${text}%`, `%${text}%`);
    }

    sql += ' ORDER BY date DESC, id DESC';
    return await db.getAllAsync(sql, params);
  } catch (error) {
    console.error('getShoots failed:', error);
    throw error;
  }
}

export async function getShootById(id) {
  try {
    const db = await getReadyDb();
    const shoot = await db.getFirstAsync(
      `SELECT ${SHOOT_COLUMNS} FROM shoots WHERE id = ?`,
      [id]
    );
    return shoot || null;
  } catch (error) {
    console.error('getShootById failed:', error);
    throw error;
  }
}

// Returns the id of the new record
export async function addShoot(shoot) {
  try {
    if (!shoot || !shoot.title || !shoot.title.trim()) {
      throw new Error('A shoot needs a title.');
    }
    const db = await getReadyDb();
    const result = await db.runAsync(
      `INSERT INTO shoots
         (title, location, date, category, notes, iso, aperture, shutter_speed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shoot.title.trim(),
        shoot.location ?? '',
        shoot.date ?? '',
        shoot.category ?? '',
        shoot.notes ?? '',
        shoot.iso ?? '',
        shoot.aperture ?? '',
        shoot.shutterSpeed ?? '',
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('addShoot failed:', error);
    throw error;
  }
}

export async function updateShoot(id, shoot) {
  try {
    if (!shoot || !shoot.title || !shoot.title.trim()) {
      throw new Error('A shoot needs a title.');
    }
    const db = await getReadyDb();
    await db.runAsync(
      `UPDATE shoots
         SET title = ?, location = ?, date = ?, category = ?, notes = ?,
             iso = ?, aperture = ?, shutter_speed = ?
       WHERE id = ?`,
      [
        shoot.title.trim(),
        shoot.location ?? '',
        shoot.date ?? '',
        shoot.category ?? '',
        shoot.notes ?? '',
        shoot.iso ?? '',
        shoot.aperture ?? '',
        shoot.shutterSpeed ?? '',
        id,
      ]
    );
  } catch (error) {
    console.error('updateShoot failed:', error);
    throw error;
  }
}

export async function deleteShoot(id) {
  try {
    const db = await getReadyDb();
    await db.runAsync('DELETE FROM shoots WHERE id = ?', [id]);
  } catch (error) {
    console.error('deleteShoot failed:', error);
    throw error;
  }
}

// ---------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------

// Returns the full idea objects that are favorited, newest first
export async function getFavorites() {
  try {
    const db = await getReadyDb();
    return await db.getAllAsync(
      `SELECT ${IDEA_COLUMNS}
         FROM favorites f
         JOIN ideas i ON i.id = f.idea_id
        ORDER BY f.created_at DESC, i.id DESC`
    );
  } catch (error) {
    console.error('getFavorites failed:', error);
    throw error;
  }
}

export async function isFavorite(ideaId) {
  try {
    const db = await getReadyDb();
    const row = await db.getFirstAsync(
      'SELECT idea_id FROM favorites WHERE idea_id = ?',
      [ideaId]
    );
    return row !== null && row !== undefined;
  } catch (error) {
    console.error('isFavorite failed:', error);
    throw error;
  }
}

export async function addFavorite(ideaId) {
  try {
    const db = await getReadyDb();
    // OR IGNORE: adding the same favorite twice does nothing
    await db.runAsync('INSERT OR IGNORE INTO favorites (idea_id) VALUES (?)', [
      ideaId,
    ]);
  } catch (error) {
    console.error('addFavorite failed:', error);
    throw error;
  }
}

export async function removeFavorite(ideaId) {
  try {
    const db = await getReadyDb();
    await db.runAsync('DELETE FROM favorites WHERE idea_id = ?', [ideaId]);
  } catch (error) {
    console.error('removeFavorite failed:', error);
    throw error;
  }
}

// ---------------------------------------------------------------
// Dashboard statistics (calculated live, never hardcoded)
// ---------------------------------------------------------------

export async function getDashboardStatistics() {
  try {
    const db = await getReadyDb();

    const ideasRow = await db.getFirstAsync('SELECT COUNT(*) AS count FROM ideas');
    const shootsRow = await db.getFirstAsync('SELECT COUNT(*) AS count FROM shoots');
    const favoritesRow = await db.getFirstAsync(
      'SELECT COUNT(*) AS count FROM favorites'
    );
    const recentIdeas = await db.getAllAsync(
      `SELECT ${IDEA_COLUMNS} FROM ideas i ORDER BY i.id DESC LIMIT 5`
    );

    return {
      totalIdeas: ideasRow ? ideasRow.count : 0,
      totalShoots: shootsRow ? shootsRow.count : 0,
      totalFavorites: favoritesRow ? favoritesRow.count : 0,
      recentIdeas,
    };
  } catch (error) {
    console.error('getDashboardStatistics failed:', error);
    throw error;
  }
}

// ---------------------------------------------------------------
// Clear user data (used by the Settings screen in Phase 9)
// Deletes shoots and favorites. Built-in ideas are kept.
// ---------------------------------------------------------------

export async function clearUserData() {
  try {
    const db = await getReadyDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM shoots');
      await db.runAsync('DELETE FROM favorites');
    });
  } catch (error) {
    console.error('clearUserData failed:', error);
    throw error;
  }
}