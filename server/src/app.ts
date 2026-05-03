// src/server.ts
import compression from "compression";
import cors from "cors";
import "dotenv/config";
import { logger } from "env-var";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { isAppError } from "./core/errors/app-error";
import { sendError } from "./core/errors/http";
import registerRoutes from "./routes";

const morganStream = {
  write: (message: string) => {
    logger("http", message.trim());
  },
};

export const app = express();

// Configuration CORS pour développement et production
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://projet-junior-client.onrender.com",
      "https://centic.rageai.digital", // Domaine de production
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middlewares critiques en premier
app.use(cors(corsOptions));

app.use(express.json());

// Configuration Helmet simplifiée pour le développement
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  }),
);

// Rate limiting simple en mémoire (remplace Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Nettoyage périodique du rate limiting (toutes les 5 minutes)
setInterval(
  () => {
    const now = Date.now();
    for (const [key, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

// Middleware de compression
app.use(compression());

// Logging
app.use(morgan("combined", { stream: morganStream }));

app.use(express.static("public"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});

app.get("/keep-alive", (req, res) => res.send("OK"));

// Enregistrer les routes applicatives après les middlewares
registerRoutes(app);

// Route racine modifiée
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "online",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Gestion des erreurs CORS
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err.message.includes("CORS")) {
      res.status(403).json({ error: err.message });
    } else {
      next(err);
    }
  },
);

app.use((req, res) => {
  return sendError(res, 404, "ROUTE_NOT_FOUND", "Route introuvable");
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (res.headersSent) {
      return next(err);
    }

    if (isAppError(err)) {
      return sendError(res, err.statusCode, err.code, err.message, err.details);
    }

    console.error(`[${res.locals.traceId}]`, err);
    return sendError(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "Une erreur interne est survenue.",
    );
  },
);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 10000;

app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Erreur de démarrage:", err.message);
    process.exit(1);
  });
