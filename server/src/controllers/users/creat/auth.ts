import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendError, sendSuccess } from "../../../core/errors/http";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export async function login(req: Request, res: Response) {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return sendError(
      res,
      400,
      "AUTH_MISSING_CREDENTIALS",
      "Email et mot de passe sont requis",
    );
  }

  try {
    const user = await prisma.utilisateur.findUnique({ where: { email } });

    if (!user) {
      return sendError(
        res,
        401,
        "AUTH_INVALID_CREDENTIALS",
        "Email ou mot de passe incorrect.",
      );
    }

    const validPassword = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!validPassword) {
      return sendError(
        res,
        401,
        "AUTH_INVALID_CREDENTIALS",
        "Email ou mot de passe incorrect.",
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } as const
    ) as string;

    // Créer un refresh token
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error(
        "JWT_REFRESH_SECRET is not defined in environment variables"
      );
    }

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } as const
    ) as string;

    // Retourner les tokens et les informations utilisateur
    return sendSuccess(
      res,
      {
        access: accessToken,
        refresh: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
        },
      },
      "Connexion réussie",
    );
  } catch (error) {
    console.error(error);
    return sendError(
      res,
      500,
      "AUTH_LOGIN_ERROR",
      "Erreur serveur lors de la connexion.",
    );
  }
}

export async function refreshToken(req: Request, res: Response) {
  const { refresh } = req.body;

  if (!refresh) {
    return sendError(
      res,
      401,
      "AUTH_MISSING_REFRESH_TOKEN",
      "Refresh token manquant.",
    );
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    console.error("JWT_REFRESH_SECRET non défini");
    return sendError(
      res,
      500,
      "AUTH_SERVER_CONFIG_ERROR",
      "Erreur de configuration du serveur.",
    );
  }

  try {
    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET) as {
      userId: string;
    };

    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
      },
    });

    if (!user) {
      return sendError(
        res,
        404,
        "AUTH_USER_NOT_FOUND",
        "Utilisateur non trouvé.",
      );
    }

    if (!process.env.JWT_SECRET) {
      return sendError(
        res,
        500,
        "AUTH_SERVER_CONFIG_ERROR",
        "Erreur de configuration du serveur.",
      );
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } as const
    ) as string;

    return sendSuccess(
      res,
      {
        access: newAccessToken,
        user,
      },
      "Session rafraîchie",
    );
  } catch (error) {
    return sendError(
      res,
      403,
      "AUTH_INVALID_REFRESH_TOKEN",
      "Token de rafraîchissement invalide ou expiré.",
    );
  }
}

export async function logout(req: Request, res: Response) {
  // Pour JWT stateless, logout côté client suffit (supprimer le token)
  // Si vous avez un système de blacklist, ajoutez-le ici
  return sendSuccess(res, null, "Déconnexion réussie.");
}
