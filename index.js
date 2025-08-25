import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import notificationRoutes from './src/routes/notificationRoute.js';
import { sendSuccess, sendError } from './src/helpers/responseHelper.js';
const app = express();

// Middleware
app.use(express.json()); //  Parse JSON (Brevo)
app.use(express.urlencoded({ extended: true })); //  Parse Twilio webhooks (form-encoded)

// Setup __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route (fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Unified Notification API",
      version: "1.0.0",
      description: "Send notifications via Email, SMS, WhatsApp, Push",
    },
    servers: [
      { url: `http://localhost:${PORT}/api/notifications` }
    ],
  },
  apis: ["./src/routes/*.js"], // Point to route files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.listen(PORT, () => {
  console.log(` Notification service running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error(` Failed to start server: ${err.message}`);
});
