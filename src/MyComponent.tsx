import { usePGlite } from "./lib/pglite"
import { useState } from 'react';

const MyComponent = () => {
    const db = usePGlite();
    const [isInserting, setIsInserting] = useState(false);

    const insertItem = async () => {
        try {
            setIsInserting(true);
            await db.query("INSERT INTO my_table (name, number) VALUES ('Arthur', 45);");
            console.log("Item inserted successfully");
        } catch (error) {
            console.error("Error inserting item:", error);
        } finally {
            setIsInserting(false);
        }
    }

    return (
        <div>
            <button onClick={insertItem} disabled={isInserting}>
                {isInserting ? 'Inserting...' : 'Insert item'}
            </button>
        </div>
    )
}

export default MyComponent;