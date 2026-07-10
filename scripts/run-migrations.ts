import dataSource from '../src/data-source';

async function main() {
  const ds = dataSource;
  if (!ds) {
    console.error('Data source not found.');
    process.exit(1);
  }

  try {
    console.log('Initializing data source...');
    await ds.initialize();
    console.log('Running pending migrations (will not run automatically without your confirmation)...');
    const migrations = await ds.showMigrations();
    if (migrations) {
      console.log('Migrations pending: running now.');
      await ds.runMigrations();
      console.log('Migrations complete.');
    } else {
      console.log('No pending migrations.');
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    try {
      await ds.destroy();
    } catch (_) {}
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
