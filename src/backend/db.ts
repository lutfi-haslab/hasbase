// db/index.ts

import { Config, JsonDB } from "node-json-db";
import { CONFIG } from "./config";


export const chatDB = new JsonDB(new Config(CONFIG.CHAT_DB_PATH, true, false, '/'));
export const userDB = new JsonDB(new Config(CONFIG.USER_DB_PATH, true, false, '/'));
export const documentDB = new JsonDB(new Config(CONFIG.DOCUMENT_DB_PATH, true, false, '/'));

// Helper functions for document DB operations
export const documentDBHelpers = {
    async getDocument(id: string) {
        try {
            return await documentDB.getData(`/documents/${id}`);
        } catch (error) {
            return null;
        }
    },

    async getAllDocuments() {
        try {
            const docs = await documentDB.getData('/documents');
            return Object.values(docs);
        } catch (error) {
            return [];
        }
    },

    async updateDocument(id: string, data: any) {
        await documentDB.push(`/documents/${id}`, data, true);
    },

    async deleteDocument(id: string) {
        await documentDB.delete(`/documents/${id}`);
    }
};