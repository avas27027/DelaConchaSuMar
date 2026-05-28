import admin from "firebase-admin";
import fs from "fs";
import path from "path";

admin.initializeApp({
  credential: admin.credential.cert(path.resolve("serviceAccountKey.json")),
});

const db = admin.firestore();
const BATCH_LIMIT = 500;

async function importar() {
  const data = JSON.parse(fs.readFileSync(path.resolve("products.json"), "utf8"));
  const productsRef = db.collection("products");

  for (let index = 0; index < data.length; index += BATCH_LIMIT) {
    const batch = db.batch();
    const items = data.slice(index, index + BATCH_LIMIT);

    for (const item of items) {
      const docRef = productsRef.doc();
      batch.set(docRef, item);
    }

    await batch.commit();
  }

  console.log(`Importacion terminada: ${data.length} productos`);
}

importar().catch((error) => {
  console.error("Error durante la importacion:", error);
  process.exit(1);
});
