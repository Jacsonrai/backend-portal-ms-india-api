const axios = require("axios");
const { ConfidentialClientApplication } = require("@azure/msal-node");
const { msalConfig } = require("../config/msal.config");
const cca = new ConfidentialClientApplication(msalConfig);
const registerWebhook = async () => {
    try {
        // Acquire a token to call the Microsoft Graph API
        const authResponse = await cca.acquireTokenByClientCredential({
            scopes: ["https://graph.microsoft.com/.default"],
        });

        const accessToken = authResponse.accessToken;

        // Set up the webhook subscription
        const subscription = {
            changeType: "created",
            notificationUrl:
                "https://lioness-clever-baboon.ngrok-free.app/webhook-endpoint",
            resource: "users",
            expirationDateTime: new Date(
                Date.now() + 3600 * 1000 * 24
            ).toISOString(),
            clientState: "secretClientValue",
        };

        // Make the API request to create a subscription
        const response = await axios.post(
            "https://graph.microsoft.com/v1.0/subscriptions",
            subscription,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Subscription ID:", response.data.id);
    } catch (error: any) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Error registering webhook:", error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error", error.message);
        }
        console.error("Config:", error.config);
    }
};

registerWebhook();
