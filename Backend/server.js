// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pollRoutes from "./routes/pollRoutes.js"; // Import the routes

const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON data

// Use routes
app.use("/api/polls", pollRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});