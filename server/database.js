import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, 'knowledge.db');
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error abriendo base de datos:', err.message);
          reject(err);
        } else {
          console.log('📁 Base de datos SQLite conectada:', this.dbPath);
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const createKnowledgeTable = `
      CREATE TABLE IF NOT EXISTS knowledge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        contenido TEXT NOT NULL,
        categoria TEXT,
        pclave TEXT,
        urls TEXT,
        imgs TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.run(createKnowledgeTable, (err) => {
        if (err) {
          console.error('❌ Error creando tabla knowledge:', err.message);
          reject(err);
        } else {
          console.log('✅ Tabla knowledge creada/verificada');
          resolve();
        }
      });
    });
  }

  // CRUD Operations para Knowledge
  async addKnowledge(data) {
    const { titulo, contenido, categoria, pclave, urls, imgs } = data;
    const sql = `
      INSERT INTO knowledge (titulo, contenido, categoria, pclave, urls, imgs)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [titulo, contenido, categoria, pclave, urls, imgs], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...data });
        }
      });
    });
  }

  async getAllKnowledge() {
    const sql = 'SELECT * FROM knowledge ORDER BY created_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getKnowledgeById(id) {
    const sql = 'SELECT * FROM knowledge WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getKnowledgeByCategory(categoria) {
    const sql = 'SELECT * FROM knowledge WHERE categoria = ? ORDER BY created_at DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, [categoria], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async searchKnowledge(query) {
    const sql = `
      SELECT * FROM knowledge
      WHERE titulo LIKE ? OR contenido LIKE ? OR pclave LIKE ?
      ORDER BY created_at DESC
    `;
    const searchTerm = `%${query}%`;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async updateKnowledge(id, data) {
    const { titulo, contenido, categoria, pclave, urls, imgs } = data;
    const sql = `
      UPDATE knowledge
      SET titulo = ?, contenido = ?, categoria = ?, pclave = ?, urls = ?, imgs = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [titulo, contenido, categoria, pclave, urls, imgs, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes, ...data });
        }
      });
    });
  }

  async deleteKnowledge(id) {
    const sql = 'DELETE FROM knowledge WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  async getCategories() {
    const sql = 'SELECT DISTINCT categoria FROM knowledge WHERE categoria IS NOT NULL ORDER BY categoria';

    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.categoria));
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Error cerrando base de datos:', err.message);
        } else {
          console.log('✅ Conexión a base de datos cerrada');
        }
      });
    }
  }
}

export default Database;