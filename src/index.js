import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { notFound, catchErrors } from "./middlewares/errors.js";
import config from "./config/config.js";
// Import routes
import moonRoutes from "./routes/moonRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes config
app.use('/api/moon', moonRoutes());


// Errors handling
app.use(notFound);
app.use(catchErrors);

// Server state
app.listen(config.server.port, () => {
    console.log(`Server is listen on: http://localhost:${config.server.port}`);
})