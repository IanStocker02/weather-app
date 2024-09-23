import dotenv from "dotenv";
import express from "express";
// import path from "node:path";
// import { fileURLToPath } from "node:url"; // Import this to handle ES modules
dotenv.config();

// Import the routes
import routes from "./routes/index.js";

// Resolve __dirname for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3001;

// TODO: Serve static files of entire client dist folder
// TODO: Implement middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("../client/dist"));

// TODO: Implement middleware to connect the routes
app.use(routes);

// Start the server on the port - 3001
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));