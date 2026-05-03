import dotenvSafe from "dotenv-safe";
import { get } from "env-var";
import path from "node:path";

dotenvSafe.config({
  allowEmptyValues: true,
  path: path.resolve(__dirname, "../../../.env"),
  example: path.resolve(__dirname, "../../../.env.example"),
});

export const envs = {
  PORT: get("PORT").required().asPortNumber(),
  API_PREFIX: get("DEFAULT_API_PREFIX").default("/api/v1").asString(),
  NODE_ENV: get("NODE_ENV").default("development").asString(),
  DATABASE_URL: get("DATABASE_URL").required().asString(),
  MONGO_INITDB_ROOT_USERNAME: get("MONGO_INITDB_ROOT_USERNAME")
    .default("k2ngroup")
    .asString(),
  MONGO_INITDB_ROOT_PASSWORD: get("MONGO_INITDB_ROOT_PASSWORD")
    .required()
    .asString(),
  MONGO_DB_NAME: get("MONGO_DB_NAME").required().asString(),
  MONGO_HOST: get("MONGO_HOST").default("localhost").asString(),
  MONGO_PORT: get("MONGO_PORT").default("27017").asString(),

  mot_de_passe: get("SMTP_PASS").default("ybfm tkhc pyaa bmuy").asString(),
  address_mail: get("SMTP_USER").default("cesaristos85@gmail.com").asString(),
};

export const CONNECTION_STRING = `mongodb://${envs.MONGO_INITDB_ROOT_USERNAME}:${envs.MONGO_INITDB_ROOT_PASSWORD}@${envs.MONGO_HOST}:${envs.MONGO_PORT}/${envs.MONGO_DB_NAME}?authSource=admin`;
