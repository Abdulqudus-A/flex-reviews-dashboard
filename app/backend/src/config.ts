import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const HOSTAWAY_ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID ?? "61148";
export const HOSTAWAY_API_KEY = process.env.HOSTAWAY_API_KEY ?? "f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152";
