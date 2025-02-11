import { join } from "path";

const BASE_DIR = process.cwd();
const VECTOR_DB_PATH = join(BASE_DIR, 'data/vector_db');
const METADATA_FILE = join(VECTOR_DB_PATH, 'data/documents_metadata.json');
const PGLITE_PATH = join(BASE_DIR, 'data/pglite');
const CHAT_DB_PATH = join(BASE_DIR, 'data/chatDB');
const USER_DB_PATH = join(BASE_DIR, 'data/userDB')
const DOCUMENT_DB_PATH = join(BASE_DIR, 'data/documentDB')

export const CONFIG = {
    OPEN_AI_API_KEY: "", // In Node.js defaults to process.env.OPENAI_API_KEY
    VECTOR_DB_PATH,
    METADATA_FILE,
    PGLITE_PATH,
    PORT: 8008,
    DEFAULT_MODEL: 'gpt-4o-mini',
    CHAT_DB_PATH,
    USER_DB_PATH,
    DOCUMENT_DB_PATH,
    SYSTEM_PROMPT: "You are a helpful assistant. Provide clear and concise responses."
}