import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../core/errors/http";
import prisma from "../lib/prisma";

// Interface pour l'utilisateur authentifié
export interface AuthenticatedUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone: string | null;
}

// Extension de l'interface Request pour inclure la propriété user
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        401,
        "AUTH_MISSING_TOKEN",
        "Token d'authentification manquant ou invalide",
      );
    }

    const token = authHeader.split(" ")[1];

    // Vérifier que la clé secrète est définie
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return sendError(
        res,
        500,
        "AUTH_SERVER_CONFIG_ERROR",
        "Erreur de configuration du serveur",
      );
    }

    // Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return sendError(
          res,
          401,
          "AUTH_SESSION_EXPIRED",
          "Session expirée, veuillez vous reconnecter",
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return sendError(res, 401, "AUTH_INVALID_TOKEN", "Token invalide");
      }
      return sendError(
        res,
        500,
        "AUTH_TOKEN_VERIFICATION_ERROR",
        "Erreur de vérification du token",
      );
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        telephone: true,
      },
    });

    if (!user) {
      return sendError(
        res,
        401,
        "AUTH_USER_NOT_FOUND",
        "Utilisateur non trouvé",
      );
    }

    // Ajouter l'utilisateur à l'objet request
    req.user = user;

    // Passer au middleware ou au contrôleur suivant
    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return sendError(
        res,
        401,
        "AUTH_SESSION_EXPIRED",
        "Session expirée, veuillez vous reconnecter",
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 401, "AUTH_INVALID_TOKEN", "Token invalide");
    }

    return sendError(
      res,
      500,
      "AUTH_INTERNAL_ERROR",
      "Erreur d'authentification",
    );
  }
};

// Export par défaut pour compatibilité
export default authMiddleware;

/**
 * Middleware pour vérifier les rôles
 * Vérifie si l'utilisateur a le rôle requis pour accéder à la ressource
 */
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, "AUTH_REQUIRED", "Non authentifié");
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        "AUTH_FORBIDDEN",
        "Vous n'avez pas les droits nécessaires pour accéder à cette ressource",
      );
    }

    next();
  };
};
