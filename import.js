const fs = require('fs');
const csv = require('csv-parser');
const db = require('./db');

async function createTable() {
  await db.query('DROP TABLE IF EXISTS universities');
  const query = `
    CREATE TABLE universities (
      id SERIAL PRIMARY KEY,
      country_code TEXT,
      name TEXT,
      website TEXT
    );
  `;
  await db.query(query);
  console.log('Table "universities" created.');
}

async function importData() {
  try {
    await createTable();

    const results = [];
    fs.createReadStream('world-universities.csv')
      .pipe(csv({
        headers: ['country_code', 'name', 'website'],
      }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`CSV file read successfully. Found ${results.length} rows.`);
        console.log('Importing into database in batches...');

        const client = await db.pool.connect();
        try {
          await client.query('BEGIN');

          const batchSize = 1000;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);

            const values = [];
            const rowsQuery = [];
            let placeholderCount = 1;

            batch.forEach(row => {
              rowsQuery.push(`($${placeholderCount}, $${placeholderCount + 1}, $${placeholderCount + 2})`);
              values.push(row.country_code, row.name, row.website);
              placeholderCount += 3;
            });

            const queryText = `INSERT INTO universities (country_code, name, website) VALUES ${rowsQuery.join(', ')}`;
            await client.query(queryText, values);
            console.log(`Inserted rows ${i} to ${i + batch.length - 1}`);
          }

          await client.query('COMMIT');
          console.log(`Successfully imported ${results.length} universities.`);
        } catch (e) {
          await client.query('ROLLBACK');
          console.error('Error during import:', e);
        } finally {
          client.release();
          process.exit(0);
        }
      });
  } catch (error) {
    console.error('Initial error:', error);
    process.exit(1);
  }
}

importData();
