import dotenv from 'dotenv';

dotenv.config();

export const PORT: string = process.env.PORT as string;
