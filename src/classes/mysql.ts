import AdmZip from "adm-zip";
import mysql from "mysql";

export class MySQL {
  constructor() {}

  dump = async (connectionString: string, dir: string) => {
    const connection = mysql.createConnection(connectionString);
    connection.connect();

    const zip = new AdmZip();

    const databases = await new Promise<string[]>((resolve, reject) => {
      connection.query("SHOW DATABASES", (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.map((result: any) => result.Database));
        }
      });
    });

    for (const database of databases) {
      const tables = await new Promise<string[]>((resolve, reject) => {
        connection.query(`SHOW TABLES FROM ${database}`, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              results.map((result: any) => result[`Tables_in_${database}`])
            );
          }
        });
      });

      for (const table of tables) {
        const data = await new Promise<any[]>((resolve, reject) => {
          connection.query(
            `SELECT * FROM ${database}.${table}`,
            (err, results) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
              }
            }
          );
        });

        zip.addFile(
          `${database}/${table}.json`,
          Buffer.from(JSON.stringify(data))
        );
      }
    }

    const hostname = new URL(connectionString).hostname;

    const out = `${dir}/${hostname}_${Date.now()}.zip`;

    zip.writeZip(out);

    connection.end();

    return out;
  };

  restore = async (connectionString: string, src: string) => {
    const connection = mysql.createConnection(connectionString);
    connection.connect();

    const zip = new AdmZip(src);

    const zipEntries = zip.getEntries();

    for (const entry of zipEntries) {
      const [database, table] = entry.entryName.replace(".json", "").split("/");
      const data = JSON.parse(entry.getData().toString("utf8"));

      await new Promise<void>((resolve, reject) => {
        connection.query(`DELETE FROM ${database}.${table}`, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      await new Promise<void>((resolve, reject) => {
        connection.query(
          `INSERT INTO ${database}.${table} VALUES ?`,
          [data.map((row: any) => Object.values(row))],
          (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }

    connection.end();

    return;
  };

  verify = async (connectionString: string) => {
    const connection = mysql.createConnection(connectionString);
    connection.connect();

    await new Promise<void>((resolve, reject) => {
      connection.query("SELECT 1", (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    connection.end();
  };
}
