import { join } from "path";
import { homedir } from "os";

// Get the user's home directory
const HOME_DIR = homedir();
const BASE_DIR = join(HOME_DIR, ".hasbase");

// Construct paths dynamically
export const CONFIG = {
    OPEN_AI_API_KEY: process.env.VITE_OPENAI_API_KEY, 
    VECTOR_DB_PATH: join(BASE_DIR, "vector_db"),
    CHAT_DB_PATH: join(BASE_DIR, "chatDB"),
    USER_DB_PATH: join(BASE_DIR, "userDB"),
    DOCUMENT_DB_PATH: join(BASE_DIR, "documentDB"),
    UPLOAD_PATH: join(BASE_DIR, "uploads"),
    PORT: 8008,
    DEFAULT_MODEL: "gpt-4o-mini",
    SYSTEM_PROMPT: "You are a helpful assistant. Provide clear and concise responses."
};