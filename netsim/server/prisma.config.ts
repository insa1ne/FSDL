import 'dotenv/config'; // <--- ADD THIS LINE
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // This will now correctly find your DIRECT_URL from .env
    url: process.env.DIRECT_URL,
  },
});