import { PGlite, PGliteInterfaceExtensions } from '@electric-sql/pglite';
import { makePGliteProvider } from '@electric-sql/pglite-react';
import { live, LiveNamespace } from '@electric-sql/pglite/live';
import { vector } from '@electric-sql/pglite/vector';
import React, { createContext, useContext, useEffect, useState } from 'react';

export const { PGliteProvider, usePGlite: useDB } = makePGliteProvider<
    PGlite &
    PGliteInterfaceExtensions<{
        live: typeof live;
        vector: typeof vector;
    }>
>();

interface DbContextType {
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<(PGlite & { live: LiveNamespace; vector: unknown; }) | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const dbName = import.meta.env.VITE_PLATFORM === 'mobile' ? 'idb://hasbase-mobile' : 'idb://hasbase';

    useEffect(() => {
        const initializeDb = async () => {
            try {
                const database = await PGlite.create(dbName, {
                    extensions: { live, vector },
                });

                await database.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

                await database.query(`
                    CREATE TABLE IF NOT EXISTS vector_store (
                        id SERIAL PRIMARY KEY,
                        content TEXT,
                        embedding VECTOR(3072)
                    );
                `);

                await database.query(`
                    CREATE TABLE IF NOT EXISTS chat_memory (
                        id SERIAL PRIMARY KEY,
                        conversation_id TEXT UNIQUE,
                        title TEXT,
                        messages JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                setDb(database);
            } catch (error) {
                console.error("Database initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeDb();
    }, []);


    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                <span className="ml-4">Loading database...</span>
            </div>
        );
    }

    return (
        <PGliteProvider db={db}>
            <DbContext.Provider value={{}}>
                {children}
            </DbContext.Provider>
        </PGliteProvider>
    );
};

export const useDbContext = () => {
    const context = useContext(DbContext);
    if (context === undefined) {
        throw new Error('useDbContext must be used within a DbProvider');
    }
    return context;
};
