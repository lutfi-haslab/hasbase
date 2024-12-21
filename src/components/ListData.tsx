import { useEffect, useState } from 'react';
import { usePGlite } from '../lib/pglite';

const ListData = () => {
    const db = usePGlite();
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await db.query("SELECT * FROM my_table;");
                setData(result.rows);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [db]);

    if (isLoading) {
        return <div>Loading data...</div>;
    }

    return (
        <div>
            <h2>Data List</h2>
            {data.length === 0 ? (
                <p>No data available</p>
            ) : (
                <ul>
                    {data.map((item) => (
                        <li key={item.id}>
                            Name: {item.name}, Number: {item.number}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ListData;