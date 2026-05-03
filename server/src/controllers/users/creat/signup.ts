import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../../../lib/prisma";
import sendMail from "../../../nodemailer/sendmail";

// Fonction pour valider la force du mot de passe
const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return {
      valid: false,
      message: "Le mot de passe doit contenir au moins 6 caractères",
    };
  }

  // Compter les types de caractères présents
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const typeCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  if (typeCount < 2) {
    return {
      valid: false,
      message:
        "Le mot de passe doit contenir au moins deux types de caractères différents (lettres, chiffres, majuscules ou caractères spéciaux)",
    };
  }

  return { valid: true };
};

// Schéma de validation pour l'inscription
const signupSchema = z.object({
  nom: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\-\s]+$/,
      "Le nom ne doit contenir que des lettres et des espaces"
    ),

  prenom: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\-\s]+$/,
      "Le prénom ne doit contenir que des lettres et des espaces"
    ),

  email: z
    .string()
    .email("Format d'email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères"),

  motDePasse: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .refine((val) => validatePassword(val).valid, {
      message:
        "Le mot de passe doit contenir au moins deux types de caractères différents",
    }),

  telephone: z
    .string()
    .regex(
      /^[0-9]{10,15}$/,
      "Numéro de téléphone invalide. Format attendu : 0612345678"
    )
    .optional(),

  otp: z.string().length(6, "Le code OTP doit contenir 6 chiffres").optional(),
});

// Schéma de validation pour l'envoi d'OTP
const sendOtpSchema = z.object({
  email: z
    .string()
    .email("Format d'email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères"),

  nom: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),

  prenom: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),

  telephone: z
    .string()
    .regex(
      /^[0-9]{10,15}$/,
      "Numéro de téléphone invalide. Format attendu : 0612345678"
    )
    .optional(),

  motDePasse: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .refine((val) => validatePassword(val).valid, {
      message:
        "Le mot de passe doit contenir au moins deux types de caractères différents",
    }),
});

// Fonction pour générer un OTP à 6 chiffres
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Durée de validité de l'OTP en millisecondes (10 minutes)
const OTP_EXPIRATION = 10 * 60 * 1000;

// Nombre maximum de tentatives d'envoi d'OTP par heure
const MAX_OTP_ATTEMPTS_PER_HOUR = 5;

export async function signup(req: Request, res: Response) {
  try {
    // Validation des données d'entrée
    console.log("Tentative d'inscription avec les données:", {
      ...req.body,
      motDePasse: "***",
    });

    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      console.log("Échec de la validation:", validation.error.issues);
      return res.status(400).json({
        success: false,
        message: "Données d'inscription invalides",
        errors: validation.error.issues.map((issue) => ({
          champ: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { nom, prenom, email, motDePasse, telephone, otp } = validation.data;

    // Vérifier si l'OTP est fourni et valide
    if (!otp) {
      // Si pas d'OTP, on envoie un OTP
      return sendOTP(req, res);
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      console.log(
        `Tentative de création d'un compte avec un email existant: ${email}`
      );
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cette adresse email.",
        code: "EMAIL_ALREADY_EXISTS",
      });
    }
    // Vérifier si un OTP valide existe pour cet email
    const now = new Date();
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: { gt: now },
        validated: false,
      },
    });

    if (!otpRecord) {
      console.log(`OTP invalide ou expiré pour l'email: ${email}`);
      return res.status(400).json({
        success: false,
        message:
          "Code de vérification invalide ou expiré. Veuillez demander un nouveau code.",
        code: "INVALID_OTP",
      });
    }

    // Marquer l'OTP comme utilisé
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { validated: true },
    });

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 12);

    // Créer l'utilisateur dans une transaction pour assurer l'intégrité des données
    await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      await tx.utilisateur.create({
        data: {
          nom,
          prenom,
          email,
          telephone,
          motDePasse: hashedPassword,
          role: "APPRENANT",
        },
      });

      // Supprimer tous les OTP pour cet email
      await tx.oTP.deleteMany({
        where: { email },
      });
    });

    console.log(`Nouvel utilisateur créé avec succès: ${email}`);

    return res.status(201).json({
      success: true,
      message:
        "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de la création de votre compte. Veuillez réessayer plus tard.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

export async function verifyOTP(req: Request, res: Response) {
  try {
    console.log("Corps de la requête reçu:", req.body);

    const { email, otp, nom, prenom, telephone, motDePasse } = req.body;

    console.log("Champs extraits:", {
      email,
      otp,
      nom,
      prenom,
      telephone,
      motDePasse,
    });

    if (!email || !otp || !nom || !prenom || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires",
        code: "MISSING_FIELDS",
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un compte avec cet email existe déjà",
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    // Vérifier si l'OTP est valide
    const now = new Date();
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: { gt: now },
        validated: false,
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Code OTP invalide ou expiré",
        code: "INVALID_OTP",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer l'utilisateur
    const user = await prisma.utilisateur.create({
      data: {
        email,
        nom,
        prenom,
        telephone: telephone || null,
        motDePasse: hashedPassword,
      },
    });

    // Marquer l'OTP comme utilisé
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { validated: true },
    });

    return res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      data: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la vérification du code OTP",
      code: "OTP_VERIFICATION_ERROR",
    });
  }
}

export async function sendOTP(req: Request, res: Response) {
  try {
    // Validation des données d'entrée
    console.log("Demande d'envoi d'OTP avec les données:", {
      ...req.body,
      motDePasse: "***",
    });

    const validation = sendOtpSchema.safeParse(req.body);
    if (!validation.success) {
      console.log("Échec de la validation:", validation.error.issues);
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validation.error.issues.map((issue) => ({
          champ: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { email, nom, prenom } = validation.data;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      console.log(
        `Tentative d'envoi d'OTP pour un email déjà enregistré: ${email}`
      );
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cette adresse email.",
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    // Vérifier le nombre de tentatives récentes pour cet email
    const recentAttempts = await prisma.oTP.count({
      where: {
        email,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentAttempts >= MAX_OTP_ATTEMPTS_PER_HOUR) {
      console.log(`Trop de tentatives d'envoi d'OTP pour l'email: ${email}`);
      return res.status(429).json({
        success: false,
        message: "Trop de tentatives. Veuillez réessayer dans 1 heure.",
        code: "TOO_MANY_ATTEMPTS",
      });
    }

    // Vérifier si un OTP valide existe déjà pour cet email
    const existingValidOTP = await prisma.oTP.findFirst({
      where: {
        email,
        expiresAt: { gt: now },
        validated: false,
      },
      orderBy: { createdAt: "desc" },
    });

    let otpCode: string;
    let expiresAt: Date;

    if (existingValidOTP) {
      // Réutiliser l'OTP existant s'il est toujours valide
      otpCode = existingValidOTP.code;
      expiresAt = existingValidOTP.expiresAt;

      console.log(`Réutilisation d'un OTP existant pour l'email: ${email}`);
    } else {
      // Générer un nouvel OTP
      otpCode = generateOTP();
      expiresAt = new Date(now.getTime() + OTP_EXPIRATION);

      // Stocker le nouvel OTP dans la base
      await prisma.oTP.create({
        data: {
          email,
          code: otpCode,
          expiresAt,
          validated: false,
        },
      });

      console.log(`Nouvel OTP généré pour l'email: ${email}`);
    }

    // Créer le contenu de l'email avec l'OTP
    const emailContent = `Bonjour ${prenom} ${nom},

Votre code de vérification pour finaliser votre inscription est : ${otpCode}

Ce code est valable 10 minutes. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.

Cordialement,
L'équipe Centic`;

    console.log(`Envoi de l'OTP à l'adresse: ${email}`);

    console.log(`[OTP] Préparation de l'envoi de l'OTP à ${email}`);
    console.log(`[OTP] Code OTP généré: ${otpCode} (expire: ${expiresAt})`);

    // Envoyer l'email avec l'OTP
    const sendResult = await sendMail(email, emailContent);

    if (!sendResult.success) {
      console.error(`[OTP] Échec de l'envoi de l'email: ${sendResult.error}`);
      return res.status(500).json({
        success: false,
        message:
          "Une erreur est survenue lors de l'envoi du code de vérification. Veuillez réessayer plus tard.",
        code: "EMAIL_SEND_ERROR",
        details:
          process.env.NODE_ENV === "development" ? sendResult.error : undefined,
      });
    }

    console.log(
      `[OTP] Email envoyé avec succès à ${email}. Message ID: ${sendResult.messageId}`
    );
    console.log(`[OTP] Réponse du serveur SMTP: ${JSON.stringify(sendResult)}`);

    // Envoyer une réponse de succès
    const response: any = {
      success: true,
      message: "Un code de vérification a été envoyé à votre adresse email.",
    };

    // Toujours inclure l'OTP en développement ou si le mode demo est activé
    if (process.env.NODE_ENV !== "production" || sendResult.otpCode) {
      response.debug = {
        otp: otpCode,
        expiresAt: expiresAt.toISOString(),
        email: email,
        note: sendResult.otpCode
          ? "Mode demo - OTP affiché pour tests"
          : "Mode développement",
      };
    }

    console.log(`[OTP] Réponse envoyée au client pour ${email}`);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'OTP:", error);

    return res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de l'envoi du code de vérification. Veuillez réessayer plus tard.",
      code: "OTP_SEND_ERROR",
    });
  }
}
