import dotenv from "dotenv";
import path from "path";

interface Config {
    PORT: number;
    DB_NAME: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    CLOUT_INSTANCE: string;
    REDIRECT_URI: string;
    POST_LOGOUT_REDIRECT_URI: string;
    GRAPH_API_ENDPOINT: string;
    EXPRESS_SESSION_SECRET: string;
    TENANT_ID: string;
    JWT_SECRET: string;
}

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config: Config = {
    PORT: parseInt(process.env.PORT as string, 10) || 3000,
    DB_NAME: process.env.DB_NAME as string,
    TENANT_ID: process.env.TENANT_ID as string,
    CLIENT_ID: process.env.CLIENT_ID as string,
    CLOUT_INSTANCE: process.env.CLOUD_INSTANCE as string,
    REDIRECT_URI: process.env.REDIRECT_URI as string,
    CLIENT_SECRET: process.env.CLIENT_SECRET as string,
    POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI as string,
    GRAPH_API_ENDPOINT: process.env.GRAPH_API_ENDPOINT as string,
    JWT_SECRET: "spaceagent123",
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
};
// Ensure required variables are set
const requiredVariables = [
    "PORT",
    "DB_NAME",
    "CLIENT_ID",
    "REDIRECT_URI",
    "CLIENT_SECRET",
    "POST_LOGOUT_REDIRECT_URI",
    "EXPRESS_SESSION_SECRET",
    "GRAPH_API_ENDPOINT",
    "CLOUD_INSTANCE",
    "TENANT_ID",
];
requiredVariables.forEach((variable) => {
    if (!process.env[variable]) {
        throw new Error(`Missing required environment variable: ${variable}`);
    }
});
export default config;
