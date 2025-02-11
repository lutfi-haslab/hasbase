import { Elysia, t } from 'elysia';
import { userDB } from '../../db';

export interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
}

export const userRoutesV1 = new Elysia({ prefix: '/v1/users' })
    .get('', async () => {
        try {
            // Get all users or return empty array if none exist
            const users = await userDB.getData('/users') || [];
            // Sort by created_at in descending order
            return users.sort((a: User, b: User) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        } catch (error) {
            // If /users path doesn't exist, return empty array
            return [];
        }
    })
    .post('', async ({ body }) => {
        const { username, email } = body;
        try {
            // Get existing users or initialize empty array
            let users: User[] = [];
            try {
                users = await userDB.getData('/users');
            } catch {
                // No users yet, that's okay
            }

            // Check for existing username or email
            const existingUser = users.find(
                user => user.username === username || user.email === email
            );
            if (existingUser) {
                throw new Error('Username or email already exists');
            }

            // Create new user
            const newUser: User = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                username,
                email,
                created_at: new Date().toISOString()
            };

            // Add to users array
            await userDB.push('/users[]', newUser, true);

            return newUser;
        } catch (error: any) {
            if (error.message === 'Username or email already exists') {
                throw error;
            }
            throw new Error('Failed to create user');
        }
    }, {
        body: t.Object({
            username: t.String(),
            email: t.String()
        })
    })
    .get('/:id', async ({ params }) => {
        try {
            const users: User[] = await userDB.getData('/users');
            const user = users.find(u => u.id === parseInt(params.id));

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            throw new Error('User not found');
        }
    });