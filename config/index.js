var config = {
  /**
   * Development
   */
  development: {

    server: {
      hostname: 'http://www.gay-ville.com',  // host to be used when accessing resources from outside
      port: 3000
    },

    database: {
      url: 'mongodb://localhost/test'
    },

    pictures: {
      path: 'pics'      // directory under public for user pictures
    },

    locale: {
      default: 'en'     // English
    },

    smtp: {
      service: 'Gmail',       // available services @ https://github.com/andris9/nodemailer-wellknown#supported-services
      name: 'Display Name',
      username: 'username@gmail.com',
      password: ''
    },

    auth: {
      masterPassword: '12345',

      cookie: {
        maxAge: 2678400000 // one month
      },

      facebook: {
        appID: '672175606137666',
        appSecret: '4b72beb31cb3edc0eae96566f698b090',
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        apiCallbackURL: 'http://localhost:3000/api/auth/facebook/callback'
      },

      twitter: {
        consumerKey: 'your-consumer-key-here',
        consumerSecret: 'your-client-secret-here',
        callbackURL: 'http://localhost:3000/auth/twitter/callback',
        apiCallbackURL: 'http://localhost:3000/api/auth/twitter/callback'
      },

      google: {
        clientID: 'your-secret-clientID-here',
        clientSecret: 'your-client-secret-here',
        callbackURL: 'http://localhost:3000/auth/google/callback',
        apiCallbackURL: 'http://localhost:3000/api/auth/google/callback'
      }
    }
  },

  /**
   * Production
   */
  production: {

    server: {
      hostname: 'http://server.com',  // host to be used when accessing resources from outside
      port: 80
    },

    database: {
      url: 'mongodb://server.com/prod'
    },

    pictures: {
      path: 'pics'      // directory under public for user pics
    },

    locale: {
      default: 'en'     // English
    },

    smtp: {
      service: 'Gmail',       // available services @ https://github.com/andris9/nodemailer-wellknown#supported-services
      name: 'Display Name',
      username: 'username@gmail.com',
      password: ''
    },

    auth: {
      masterPassword: '12345',

      cookie: {
        maxAge: 2678400000 // one month
      },

      facebook: {
        appID: '672175606137666',
        appSecret: '4b72beb31cb3edc0eae96566f698b090',
        callbackURL: 'http://server.com/auth/facebook/callback',
        apiCallbackURL: 'http://server.com/api/auth/facebook/callback'
      },

      twitter: {
        consumerKey: 'your-consumer-key-here',
        consumerSecret: 'your-client-secret-here',
        callbackURL: 'http://server.com/auth/twitter/callback',
        apiCallbackURL: 'http://server.com/api/auth/twitter/callback'
      },

      google: {
        clientID: 'your-secret-clientID-here',
        clientSecret: 'your-client-secret-here',
        callbackURL: 'http://staging.server.com/auth/google/callback',
        apiCallbackURL: 'http://staging.server.com/api/auth/google/callback'
      }
    }
  },

  /**
   * Staging
   */
  staging: {

    server: {
      hostname: 'http://server.com',  // host to be used when accessing resources from outside
      port: 80
    },

    database: {
      url: 'mongodb://staging.server.com/test'
    },

    pictures: {
      path: 'pics'      // directory under public for user pics
    },

    locale: {
      default: 'en'     // English
    },

    smtp: {
      service: 'Gmail',       // available services @ https://github.com/andris9/nodemailer-wellknown#supported-services
      name: 'Display Name',
      username: 'username@gmail.com',
      password: ''
    },

    auth: {
      masterPassword: '12345',

      cookie: {
        maxAge: 2678400000 // one month
      },

      facebook: {
        appID: '672175606137666',
        appSecret: '4b72beb31cb3edc0eae96566f698b090',
        callbackURL: 'http://staging.server.com/auth/facebook/callback',
        apiCallbackURL: 'http://staging.server.com/api/auth/facebook/callback'
      },

      twitter: {
        consumerKey: 'your-consumer-key-here',
        consumerSecret: 'your-client-secret-here',
        callbackURL: 'http://staging.server.com/auth/twitter/callback',
        apiCallbackURL: 'http://staging.server.com/api/auth/twitter/callback'
      },

      google: {
        clientID: 'your-secret-clientID-here',
        clientSecret: 'your-client-secret-here',
        callbackURL: 'http://staging.server.com/auth/google/callback',
        apiCallbackURL: 'http://staging.server.com/api/auth/google/callback'
      }
    }
  }
};

/***
 * Return the right configuration according to NODE_ENV environment variable
 */

module.exports = config[process.env.NODE_ENV || 'development'];
