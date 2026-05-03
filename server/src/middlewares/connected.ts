// import {
//     NextFunction,
//     Request,
//     Response,
// } from 'express';
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient()
// import { HttpCode } from '../core/constants/index';

// // import tokenModule from '../token/tokenModule';

// export interface CustumRequest extends Request {

//     user?: {
//         user_id: string;
//         role?: string; // Définir d'autres propriétés possibles de l'utilisateur si nécessaire
//         exp?: number;  // Date d'expiration du token
//     };
// }

// const userConnect = {


//     //verifier si le token d'acces est encore valide 

//     verifyAccessToken: async (req: CustumRequest, res: Response, next: NextFunction) => {

//         try {
//             // pour extraire juste le token
//             // const authorizationHeader = req.headers.authorization;
//             // const AccessToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null;
//             const AccessToken = req.headers.authorization;





//             if (!AccessToken) {

//                 return res.status(HttpCode.UNAUTHORIZED).json({ msg: `aucun jeton d'acces valide!!!` })
//             }
//             const AccessTokenverify = tokenModule.verifyAccessToken(AccessToken);

//             if (!AccessTokenverify) {
//                 return res.status(HttpCode.UNAUTHORIZED).json({ msg: `Jeton d'accès invalide!` });
//             }

//             req.user = AccessTokenverify as CustumRequest['user'];

//             if (!req.user?.exp) {
//                 return res.status(HttpCode.UNAUTHORIZED).json({ msg: `Token invalide: pas d'expiration` });
//             }

//             // const datetoken = req.user.exp;

//             // if(!req.user){}


//             // const {  user_id } = AccessTokenverify;

//             // if (datetoken && Date.now() >= datetoken * 1000) {
//             //     res.status(HttpCode.FORBIDDEN).json({ msg: `le jeton d'access a expiré!!!` })
//             // }

//             // Récupérer l'utilisateur à partir de la base de données
//             // const client = await prisma.user.findUnique({
//             //     where: { user_id }
//             // });


//             // if (!client) {
//             //     return res.status(HttpCode.UNAUTHORIZED).json({ msg: "Utilisateur non trouvé" });
//             // }

//             // Ajouter les informations de l'utilisateur à la requête

//             // req.user = {
//             //     user_id: client.user_id,
//             //     role: client.role,
//             //     exp: exp
//             // };
//             // req.user = client
//             next();

//         }
//         catch (error) {

//             console.error(error)
//             res.json({ msg: "error" }).status(HttpCode.INTERNAL_SERVER_ERROR)
//         }

//     },
//     verifyRefreshToken: async (req: CustumRequest, res: Response, next: NextFunction) => {
//         try {
//             const RefreshToken = req.cookies.cook_emp_xyz;
//             if (!RefreshToken) {
//                 return res.status(HttpCode.UNAUTHORIZED).json({ msg: `Aucun jeton de rafraîchissement valide!` });
//             }

//             // Décoder le token de rafraîchissement
//             const decodeRefresh = tokenModule.verifyRefreshToken(RefreshToken);

//             console.log("Contenu de decodeRefresh:", decodeRefresh);


//             // Vérifier que decodeRefresh est bien de type approprié
//             if (!decodeRefresh || typeof decodeRefresh === 'string' || decodeRefresh === null) {
//                 return res.status(HttpCode.UNAUTHORIZED).json({ msg: `Jeton de rafraîchissement invalide!` });
//             }

//             // Vérifier que decodeRefresh contient les propriétés nécessaires
//             if (!decodeRefresh.user_id) {
//                 return res.status(HttpCode.UNAUTHORIZED).json({ msg: `Propriétés de jeton manquantes!` });
//             }

//             // Ajouter les informations de l'utilisateur à la requête
//             req.user = {
//                 user_id: decodeRefresh.user_id,
//                 role: decodeRefresh.role,
//                 // exp: decodeRefresh.exp
//             };

//             next(); // Passer au middleware suivant

//         } catch (error) {
//             console.error(error);
//             res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: "Erreur interne du serveur" });
//         }
//     },

//     verifyUserAdmin: async (req: CustumRequest, res: Response, next: NextFunction) => {
//         try {
//             console.log(req.user);

//             if (!req.user || req.user.role !== "admin") {
//                 return res.status(HttpCode.FORBIDDEN).json({ msg: "Accès refusé. Rôle admin requis" });
//             }

//             next(); // Passer au middleware suivant
//         } catch (error) {
//             console.error(error);
//             return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: "Erreur interne du serveur" });
//         }
//     },

//     verifyUserSuper_admin: async (req: CustumRequest, res: Response, next: NextFunction) => {

//         try {
//             if (!req.user || req.user.role !== "super_admin") {
//                 return res.status(HttpCode.FORBIDDEN).json({ msg: "Accès refusé. Rôle super_admin requis" });
//             }

//             next();
//             return res.status(HttpCode.OK)


//         } catch (error) {
//             console.error(error);


//         }
//     }



// }

// export default userConnect