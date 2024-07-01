import config from "../config/index";
const msalConfig = {
    auth: {
        clientId: config.CLIENT_ID,
        authority: config.CLOUT_INSTANCE + config.TENANT_ID,
        clientSecret: config.CLIENT_SECRET,
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel: any, message: any, containsPii: any) {
                console.log(message);
            },
            piiLogginEnable: false,
            logLevel: 3,
        },
    },
};

const REDIRECT_URI = config.REDIRECT_URI;
const POST_LOGOUT_REDIRECT_URI = config.POST_LOGOUT_REDIRECT_URI;
const GRAPH_API_ENDPOINT = config.GRAPH_API_ENDPOINT + "v1.0/me";

export {
    msalConfig,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI,
    GRAPH_API_ENDPOINT,
};
