
import { AppDataSource } from '../postgres';
import { seedCountries } from './country.seed';

async function runSeeds(): Promise<void> {
  try {
    await AppDataSource.initialize();

    console.log('Database connected.');

    await seedCountries(AppDataSource);

    console.log('All seeds completed.');
  } catch (error: unknown) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runSeeds();
