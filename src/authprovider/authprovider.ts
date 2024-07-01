import msal from "@azure/msal-node";
import axios from "axios";
import { msalConfig } from "../../config/msal.config";
import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { sql, poolPromise } from "../../db/db.config";
import config from "../../config";
import jwt from "jsonwebtoken";

class AuthProvider {
    msalConfig: any;
    cryptoProvider: any;
    constructor(msalConfig: any) {
        this.msalConfig = msalConfig;
        this.cryptoProvider = new msal.CryptoProvider();
    }
    async getToken() {
        const cca = new ConfidentialClientApplication(this.msalConfig);
        const tokenRequest = {
            scopes: ["https://graph.microsoft.com/.default"],
        };
        const response: any = await cca.acquireTokenByClientCredential(
            tokenRequest
        );
        return response.accessToken;
    }

    async fetchUsers(token: string) {
        const client = Client.init({
            authProvider: (done) => {
                done(null, token);
            },
        });

        const users = await client.api("/users").get();
        return users.value;
    }
    async syncUsers() {
        const pool = await poolPromise;
        try {
            const token = await this.getToken();
            const users = await this.fetchUsers(token);
            if (users) {
                users.forEach((user: any) => {
                    pool.request()
                        .input("FirstName", sql.NVarChar, user.displayName)
                        .input("LastName", sql.NVarChar, user.surname)
                        .input("Email", sql.NVarChar, user.userPrincipalName)
                        .input("UserName", sql.NVarChar, user.givenName)
                        .input("JobTitle", sql.NVarChar, user.JobTitle)
                        .input("RoleId", sql.Int, 3)
                        .execute("AddUserWithRole");
                });
            }

            console.log("Users synchronized successfully");
        } catch (error) {
            console.error("Error synchronizing users", error);
        }
    }
    private async getUserGroups(token: string): Promise<string[]> {
        const client = Client.init({
            authProvider: (done) => {
                done(null, token);
            },
        });

        const groups = await client.api("/me/memberOf").get();
        return groups.value.map((group: any) => group.displayName);
    }
    private async getUserDetails(token: string): Promise<string[]> {
        const client = Client.init({
            authProvider: (done) => {
                done(null, token);
            },
        });
        const user = await client.api("/me").get();
        return user;
    }
    private async retriveUser(email: string): Promise<any> {
        try {
            const pool = await poolPromise;
            const user: any = await pool
                .request()
                .input("Email", email)
                .execute("GetUserByEmail");
            return user;
        } catch (error) {
            console.log(error);
        }
    }
    login(options: any = {}) {
        return async (req: any, res: any, next: any) => {
            const state = this.cryptoProvider.base64Encode(
                JSON.stringify({
                    successRedirect: options.successRedirect || "/",
                })
            );

            const authCodeUrlRequestParams = {
                state: state,

                /**
                 * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
                 * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
                 */
                scopes: options.scopes || [],
                redirectUri: options.redirectUri,
            };

            const authCodeRequestParams = {
                state: state,

                /**
                 * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
                 * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
                 */
                scopes: options.scopes || [],
                redirectUri: options.redirectUri,
            };

            if (
                !this.msalConfig.auth.cloudDiscoveryMetadata ||
                !this.msalConfig.auth.authorityMetadata
            ) {
                const [cloudDiscoveryMetadata, authorityMetadata] =
                    await Promise.all([
                        this.getCloudDiscoveryMetadata(
                            this.msalConfig.auth.authority
                        ),
                        this.getAuthorityMetadata(
                            this.msalConfig.auth.authority
                        ),
                    ]);

                this.msalConfig.auth.cloudDiscoveryMetadata = JSON.stringify(
                    cloudDiscoveryMetadata
                );
                this.msalConfig.auth.authorityMetadata =
                    JSON.stringify(authorityMetadata);
            }

            const msalInstance = this.getMsalInstance(this.msalConfig);

            return this.redirectToAuthCodeUrl(
                authCodeUrlRequestParams,
                authCodeRequestParams,
                msalInstance
            )(req, res, next);
        };
    }
    acquireToken(options: any = {}) {
        return async (req: any, res: any, next: any) => {
            try {
                const msalInstance: any = this.getMsalInstance(this.msalConfig);

                /**
                 * If a token cache exists in the session, deserialize it and set it as the
                 * cache for the new MSAL CCA instance. For more, see:
                 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/caching.md
                 */
                if (req.session.tokenCache) {
                    msalInstance
                        .getTokenCache()
                        .deserialize(req.session.tokenCache);
                }

                const tokenResponse = await msalInstance.acquireTokenSilent({
                    account: req.session.account,
                    scopes: options.scopes || [],
                });

                /**
                 * On successful token acquisition, write the updated token
                 * cache back to the session. For more, see:
                 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/caching.md
                 */
                req.session.tokenCache = msalInstance
                    .getTokenCache()
                    .serialize();
                req.session.accessToken = tokenResponse.accessToken;
                req.session.idToken = tokenResponse.idToken;
                req.session.account = tokenResponse.account;

                res.redirect(options.successRedirect);
            } catch (error) {
                if (error instanceof msal.InteractionRequiredAuthError) {
                    return this.login({
                        scopes: options.scopes || [],
                        redirectUri: options.redirectUri,
                        successRedirect: options.successRedirect || "/",
                    })(req, res, next);
                }

                next(error);
            }
        };
    }
    handleRedirect() {
        return async (req: any, res: any, next: any) => {
            if (req.url.includes("#")) {
                const [path, fragment] = req.url.split("#"); // Split URL into path and fragment
                const fragmentParams = new URLSearchParams(fragment); // Parse fragment into URLSearchParams

                // Extract parameters from fragment
                const code = fragmentParams.get("code");
                const state = fragmentParams.get("state");
                // Add more parameters as needed

                // Example handling of code and state
                if (code && state) {
                    console.log("Received code:", code);
                    console.log("Received state:", state);

                    // Further logic to handle code and state
                    // For example, exchange code for tokens, validate state, etc.

                    // Redirect or respond accordingly
                    res.redirect("/"); // Example redirect after handling authentication
                    return;
                }
            }
            // const { code, client_info, state, session_state } = req.query;
            // if (!req.query || !req.query.state) {
            //     return next(new Error("Error: response not foundssss"));
            // }

            // const authCodeRequest = {
            //     ...req.session.authCodeRequest,
            //     code: req.query.code,
            //     codeVerifier: req.session.pkceCodes.verifier,
            // };
            // console.log(code, "request");
            // console.log(client_info, "code");
            // console.log(state, "verify");

            // try {
            //     const msalInstance = this.getMsalInstance(this.msalConfig);

            //     if (req.session.tokenCache) {
            //         msalInstance
            //             .getTokenCache()
            //             .deserialize(req.session.tokenCache);
            //     }

            //     const tokenResponse = await msalInstance.acquireTokenByCode(
            //         authCodeRequest,
            //         req.query
            //     );

            //     req.session.tokenCache = msalInstance
            //         .getTokenCache()
            //         .serialize();
            //     req.session.idToken = tokenResponse.idToken;
            //     req.session.account = tokenResponse.account;
            //     req.session.isAuthenticated = true;
            //     const user: any = await this.getUserDetails(
            //         tokenResponse.accessToken
            //     );

            //     const existedUser = await this.retriveUser(
            //         user.userPrincipalName
            //     );

            //     if (existedUser) {
            //         const user = existedUser.recordset[0];
            //         const token = jwt.sign({ user }, config.JWT_SECRET, {
            //             expiresIn: 72800,
            //         });

            //         res.status(200).json({
            //             message: "login successfully",
            //             token: token,
            //         });
            //     }
            // } catch (error) {
            //     next(error);
            // }
        };
    }
    logout(options: any = {}) {
        return (req: any, res: any, next: any) => {
            /**
             * Construct a logout URI and redirect the user to end the
             * session with Azure AD. For more information, visit:
             * https://docs.microsoft.com/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request
             */
            let logoutUri = `${this.msalConfig.auth.authority}/oauth2/v2.0/`;

            if (options.postLogoutRedirectUri) {
                logoutUri += `logout?post_logout_redirect_uri=${options.postLogoutRedirectUri}`;
            }

            req.session.destroy(() => {
                res.redirect(logoutUri);
            });
        };
    }
    getMsalInstance(msalConfig: {
        auth:
            | { clientId: string; authority: string; clientSecret: string }
            | msal.NodeAuthOptions
            | undefined;
        system:
            | {
                  loggerOptions: {
                      loggerCallback(
                          loglevel: any,
                          message: any,
                          containsPii: any
                      ): void;
                      piiLogginEnable: boolean;
                      logLevel: number;
                  };
              }
            | msal.NodeSystemOptions
            | undefined;
        CryptoProvider?: any;
        broker?: msal.BrokerOptions | undefined;
        cache?: msal.CacheOptions | undefined;
        telemetry?: msal.NodeTelemetryOptions | undefined;
    }) {
        return new msal.ConfidentialClientApplication(msalConfig as any);
    }
    redirectToAuthCodeUrl(
        authCodeUrlRequestParams: {
            state: any;
            /**
             * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
             * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
             */
            scopes: any;
            redirectUri: any;
        },
        authCodeRequestParams: {
            state: any;
            /**
             * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
             * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
             */
            scopes: any;
            redirectUri: any;
        },
        msalInstance: msal.ConfidentialClientApplication
    ) {
        return async (
            req: {
                session: {
                    pkceCodes: {
                        challenge: any;
                        challengeMethod: any;
                        verifier?: any;
                    };
                    authCodeUrlRequest: any;
                    authCodeRequest: any;
                };
            },
            res: { redirect: (arg0: any) => void },
            next: (arg0: unknown) => void
        ) => {
            // Generate PKCE Codes before starting the authorization flow
            const { verifier, challenge } =
                await this.cryptoProvider.generatePkceCodes();

            // Set generated PKCE codes and method as session vars
            req.session.pkceCodes = {
                challengeMethod: "S256",
                verifier: verifier,
                challenge: challenge,
            };

            /**
             * By manipulating the request objects below before each request, we can obtain
             * auth artifacts with desired claims. For more information, visit:
             * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationurlrequest
             * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationcoderequest
             **/
            req.session.authCodeUrlRequest = {
                ...authCodeUrlRequestParams,
                responseMode: msal.ResponseMode.FORM_POST, // recommended for confidential clients
                codeChallenge: req.session.pkceCodes.challenge,
                codeChallengeMethod: req.session.pkceCodes.challengeMethod,
            };

            req.session.authCodeRequest = {
                ...authCodeRequestParams,
                code: "",
            };

            try {
                const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
                    req.session.authCodeUrlRequest
                );
                res.redirect(authCodeUrlResponse);
            } catch (error) {
                next(error);
            }
        };
    }
    async getCloudDiscoveryMetadata(authority: string) {
        const endpoint =
            "https://login.microsoftonline.com/common/discovery/instance";

        try {
            const response = await axios.get(endpoint, {
                params: {
                    "api-version": "1.1",
                    authorization_endpoint: `${authority}/oauth2/v2.0/authorize`,
                },
            });

            return await response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves oidc metadata from the openid endpoint
     * @returns
     */
    async getAuthorityMetadata(authority: string) {
        const endpoint = `${authority}/v2.0/.well-known/openid-configuration`;

        try {
            const response = await axios.get(endpoint);
            return await response.data;
        } catch (error) {
            console.log(error);
        }
    }
}
const authProvider = new AuthProvider(msalConfig);
export { authProvider };
