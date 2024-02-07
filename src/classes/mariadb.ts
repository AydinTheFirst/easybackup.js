import AdmZip from "adm-zip";
import mariadb from "mariadb";

export class MariaDB {
  constructor() {}

  dump = async (connectionString: string, dir: string) => {
    const pool = mariadb.createPool(connectionString);
    const conn = await pool.getConnection();

    const databases = await conn.query("SHOW DATABASES");

    const zip = new AdmZip();

    for (const database of databases) {
      const tables = await conn.query(`SHOW TABLES FROM ${database.Database}`);

      for (const table of tables) {
        const data = await conn.query(
          `SELECT * FROM ${database.Database}.${table}`
        );

        zip.addFile(
          `${database.Database}/${table}.json`,
          Buffer.from(JSON.stringify(data))
        );
      }
    }

    const hostname = new URL(connectionString).hostname;
    const out = `${dir}/${hostname}_${Date.now()}.zip`;

    zip.writeZip(out);

    conn.release();
    await pool.end();

    return out;
  };

  restore = async (connectionString: string, src: string) => {
    const pool = mariadb.createPool(connectionString);
    const conn = await pool.getConnection();

    const zip = new AdmZip(src);

    const zipEntries = zip.getEntries();

    for (const entry of zipEntries) {
      const [database, table] = entry.name.replace(".json", "").split("/");

      await conn.query(`DELETE FROM ${database}.${table}`);

      const data = JSON.parse(entry.getData().toString("utf8"));
      await conn.query(
        `INSERT INTO ${database}.${table} VALUES (${data.join(",")})`
      );
    }

    await conn.release();
    await pool.end();
  };

  verify = async (connectionString: string) => {
    const pool = mariadb.createPool(connectionString);
    const conn = await pool.getConnection();

    await conn.query("SELECT 1");

    conn.release();
    await pool.end();
  };
}
