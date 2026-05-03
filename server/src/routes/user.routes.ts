import { Router } from "express";
import {
  deleteUser,
  getProfile,
  getUser,
  updatePassword,
  updateUser,
} from "../controllers/users/creat/user";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRoute = Router();

// Route pour le profil de l'utilisateur connecté
userRoute.get("/profile", authMiddleware, getProfile);
userRoute.put("/profile", authMiddleware, updateUser);
userRoute.put("/password", authMiddleware, updatePassword);

userRoute.get("/:id", getUser);
userRoute.put("/:id", updateUser);
userRoute.delete("/:id", deleteUser);

export default userRoute;
