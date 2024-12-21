import { Routes, Route } from "react-router";
import DesktopHome from "../../desktop/presenter/Home";
import Test from "../../desktop/presenter/Test";
import { PGlite } from "@electric-sql/pglite";
import { LiveNamespace, live } from "@electric-sql/pglite/live";
import { useState, useEffect } from "react";
import { PGliteProvider } from "../../../lib/pglite";

const MobileRoutes = () => {

    const [db, setDb] = useState<(PGlite & { live: LiveNamespace }) | null>(null);

    useEffect(() => {
        const initializeDb = async () => {
            try {
                const database = await PGlite.create("idb://hasbase", {
                    extensions: { live },
                    vector: undefined,
                });

                // Create the table if it doesn't exist
                await database.query(`
                      CREATE TABLE IF NOT EXISTS my_table (
                          id SERIAL PRIMARY KEY,
                          name TEXT,
                          number INTEGER
                      );
                  `);
                setDb(database);
            } catch (error) {
                console.error("Database initialization error:", error);
            }
        };
        initializeDb();
    }, []);

    // Only render children when db is ready
    if (!db) {
        return <div>Loading database...</div>;
    }

    return (
        <PGliteProvider db={db}>
            <Routes>
                <Route path='/' element={<DesktopHome />} />
                <Route path="/test" element={<Test />} />
            </Routes>
        </PGliteProvider>
    )
}

export default MobileRoutes;