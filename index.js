require("dotenv").config();
const path = require("path");
const routes = require("./src/routes");

const lti = require("ltijs").Provider;

// Setup
lti.setup(
  process.env.LTI_KEY,
  {
    url: process.env.DB_URL,
  },
  {
    staticPath: path.join(__dirname, "./public"), // Path to static files
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: "None", // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: false, // Set DevMode to true if the testing platform is in a different domain and https is not being used
  }
);

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, "./public/index.html"));
});

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, "/deeplink", { newResource: true });
});

// Setting up routes
lti.app.use(routes);

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT });

  /**
   * Register platform
   */
  await lti.registerPlatform({
    url: "https://lmstest.lecturelogger.com",
    name: "lmstest.lecturelogger.com",
    clientId: "7",
    authenticationEndpoint:
      "https://lmstest.lecturelogger.com/api/lti/authorize_redirect",
    accesstokenEndpoint: "https://lmstest.lecturelogger.com/login/oauth2/token",
    authConfig: {
      method: "JWK_SET",
      key: "https://lmstest.lecturelogger.com/api/lti/security/jwks",
    },
  });

  // For other plattforms, for example moodle:

  // Moodle EXAMPLE
  // await lti.registerPlatform({
  //   url: 'http://localhost/moodle',
  //   name: 'Platform',
  //   clientId: 'CLIENTID',
  //   authenticationEndpoint: 'http://localhost/moodle/mod/lti/auth.php',
  //   accesstokenEndpoint: 'http://localhost/moodle/mod/lti/token.php',
  //   authConfig: { method: 'JWK_SET', key: 'http://localhost/moodle/mod/lti/certs.php' }
  // })
};

setup();
