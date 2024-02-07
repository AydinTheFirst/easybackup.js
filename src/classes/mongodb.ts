import { MongoClient } from "mongodb";
import AdmZip from "adm-zip";

export class MongoDB {
  constructor() {}

  dump = async (connectionString: string, dir: string) => {
    const client = new MongoClient(connectionString);

    await client.connect();
    const db = client.db();

    const collections = await db.listCollections().toArray();

    const zip = new AdmZip();

    for (const collection of collections) {
      const data = await db.collection(collection.name).find().toArray();
      zip.addFile(`${collection.name}.json`, Buffer.from(JSON.stringify(data)));
    }

    const hostname = new URL(connectionString).hostname;
    const out = `${dir}/${hostname}_${db.databaseName}_${Date.now()}.zip`;

    zip.writeZip(out);

    await client.close();

    return out;
  };

  restore = async (connectionString: string, src: string) => {
    const client = new MongoClient(connectionString);

    await client.connect();

    const db = client.db();

    for (const collection of await db.listCollections().toArray()) {
      await db.collection(collection.name).deleteMany({});
    }

    const zip = new AdmZip(src);

    const zipEntries = zip.getEntries();

    for (const entry of zipEntries) {
      const data = JSON.parse(entry.getData().toString("utf8"));
      await db.collection(entry.name.replace(".json", "")).insertMany(data);
    }

    await client.close();
  };

  verify = async (connectionString: string) => {
    const client = new MongoClient(connectionString);

    await client.connect();
    await client.db().command({ ping: 1 });
    await client.close();
  };
}
