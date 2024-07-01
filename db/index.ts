import { sql, poolPromise } from "../db/db.config";
import fs from "fs";
import path from "path";

async function executeSqlScript(filePath: string): Promise<void> {
    try {
        const pool = await poolPromise;
        const sqlScript = fs.readFileSync(filePath, "utf8");
        await pool.request().batch(sqlScript);
    } catch (error) {
        throw error;
    }
}
async function runMigrations(): Promise<void> {
    try {
        const migrationDir = path.join(__dirname, "migrations");
        const migrationFiles = fs.readdirSync(migrationDir);
        for (const file of migrationFiles) {
            const filePath = path.join(migrationDir, file);
            await executeSqlScript(filePath);
        }
    } catch (error) {
        throw error;
    }
}
async function seedDatabase(): Promise<void> {
    const seedersDir = path.join(__dirname, "seeders");

    // Get list of seeder files
    const seederFiles = fs.readdirSync(seedersDir);

    for (const file of seederFiles) {
        const filePath = path.join(seedersDir, file);
        await executeSqlScript(filePath);
    }
}

async function main(): Promise<void> {
    try {
        // Connect to database
        const pool = await poolPromise;

        // Run migrations
        try {
            await runMigrations();
            // Seed initial data (optional)
            await seedDatabase();
            console.log(
                "Database migration and seeding completed successfully"
            );
        } catch (error) {
            console.log(error);
        }

        // Close database connection
        await pool.close();
    } catch (error: any) {
        console.error("Database migration and seeding failed:", error.message);
        process.exit(1); // Exit process with failure
    }
}

// Run main function to start migration and seeding process
main();
