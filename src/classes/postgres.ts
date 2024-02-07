import AdmZip from "adm-zip";
import postgres from "postgres";

export class Postgres {
  constructor() {}

  dump = async (connectionString: string, dir: string) => {
    const db = postgres(connectionString);
    const databases =
      await db`SELECT datname FROM pg_database WHERE datistemplate = false`;

    const zip = new AdmZip();

    for (const database of databases) {
      const tables =
        await db`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;

      for (const table of tables) {
        const data =
          await db`SELECT * FROM ${database.datname}.${table.table_name}`;

        zip.addFile(
          `${database.datname}/${table.table_name}.json`,
          Buffer.from(JSON.stringify(data))
        );
      }
    }

    const hostname = new URL(connectionString).hostname;
    const out = `${dir}/${hostname}_${Date.now()}.zip`;

    zip.writeZip(out);
    await db.end();

    return out;
  };

  restore = async (connectionString: string, src: string) => {
    const db = postgres(connectionString);

    const zip = new AdmZip(src);

    const zipEntries = zip.getEntries();

    for (const entry of zipEntries) {
      const [database, table] = entry.name.replace(".json", "").split("/");

      await db`DELETE FROM ${database}.${table}`;

      const data = JSON.parse(entry.getData().toString("utf8"));
      await db`INSERT INTO ${database}.${table} VALUES (${data.join(",")})`;
    }

    await db.end();

    return;
  };

  verify = async (connectionString: string) => {
    const db = postgres(connectionString);
    await db`SELECT 1`;
    await db.end();
  };
}
