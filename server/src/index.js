import 'dotenv/config';
import { createDatabase } from './database.js';
import { createApp } from './app.js';
const port = Number(process.env.PORT || 8787); const app = createApp(createDatabase());
app.listen(port, () => console.log(`Flins API listening on http://localhost:${port}`));
