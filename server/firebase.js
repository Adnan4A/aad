import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import admin from "firebase-admin";

// Client-side Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBF8MObbKYAh0FAACHEX1WPbHbssQsSHOQ",
            authDomain: "movie-da146.firebaseapp.com",
            projectId: "movie-da146",
            storageBucket: "movie-da146.firebasestorage.app",
            messagingSenderId: "348002068886",
            appId: "1:348002068886:web:bfddd1888b5bb6afbe95b7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Firebase Admin SDK for server-side operations
let adminApp;
try {
  if (!admin.apps.length) {
    const serviceAccountKey = {
  "type": "service_account",
  "project_id": "movie-da146",
  "private_key_id": "f7e15233d1b044fd7dcf98e585cc6256c65aec33",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9UyyjjEF6nZnG\nJM1xuuRCHtug+e5a0J+Vt8ExjGR1c34EenvP4r+aqT3SgtcGJ2zKuxIMWfIYEQOE\noADOYOq4tbER+P8zJ7PGBq+NvHBIBMqpYCTAlZde1NqwcE/QsI/NZbIN/oZ+nDgL\nD2Fk3w4MpMA6MiD8rrRJCLqSh3R3slwpRIxmgqzfQXQv46QMbQFfDVuyXZnr6BuE\n98Du06mE8oUOrRD0MxotTUbPhONiCIRyNTqghZ2Ra36fd/JZ+tWm/j5zKzefkj/0\n3ekzMo1Yi0SuZaUD2uxM8bZhr0njqer0ytILTwLN0k+LOv+oai7o1+/GuwuN4mCg\nV+xYFpH/AgMBAAECggEAEr9QH3tqZuBN5qqkrV5hIl44ritEyJ/GYOaRR7BfQkIg\nq52oi2CPGJspqm7KXBGk9DsSAacZq5U26l5UHIH8Vc4OeqxTzDAvEEZ/m8lmu1SK\n8CEh6PAaZrzGt8uaghyTVAN998svn9nx5fNGWBBX+jVWOgajI/v1kXkLzV0ca1dS\nUT+2Nsmok3Q6bz2k85qmsokVjDgTxqdTGpQsM35fouBqYXXLQPYVxGIhcj1iWF4n\nKFZtLRNDX5SlD+iYFFimqcdEsFI+w6gWWLp017/5l/8cA4zP0g9M/BvextMRSHqX\nckH8JCthucpY5bUz+0e4eirHdihQZ80G6WwYs84yAQKBgQDwShfhGsWH1IPbVOlP\nYoxwVCoyvK0zYM/SBgae3ISHf1YYghlOkmWxILWjO/WFMljMAxYbJpOGfkbRC+jf\nX1bc7drDLumAf72Z6Gb8/UBN2c4s7MTPN6GJ/OYMIdHhnB8AxTaj0qaHTEVrraWj\nXdSlUiicy0+tfWy+MWHMHor4zQKBgQDJtAyQZ4PcMX5wElPqtH8WVDy4BlG56DII\nSOE2eKU59PI+hsN6iqYjlkDQN3TN7YVTMRxBKyi7MP8hR0fQ9Cx/8uiXXp5HrjQQ\njpQto3PWB1ub8YBCp6a9QU5D5QfhYthstWRmyITnnBaBBe03CJuTG5sQCrPRkA5M\n+NCtW1sl+wKBgQDKV2pCWXvrBI7AXIFXIwJl+MnMDcu/zw9RqVdb4RAM1bKXUr6i\nxm6xuHyb53q5XgseSJ8N3+8suxtBH8lKiAsqYXTtFYz1cxwjBWvsMAo9RGL0u7CD\nWjJCc1746mXFmOUWjfuT+mfW2OhAY2pu5i2RxVyDpEUFL/ApPIZBD5sxJQKBgDIS\nNTA/0jb+PmH52sUf65CSdsREJVOeNZVi6i2Ig5PAn8Yv1CT+eEHLUemeaquYNAmz\n3ky7NxBJGHydYlGX29gjZ+PzxB0NPLWDf3tY4S+XggFTUUC6t6SxqokmOO+Vhx5t\nZTAyxPNuBxQecYXA6EX7i2HPFlaGiVZISh1O2XCzAoGBAI+u254L9+c+iNU7i6DS\n4xOQPghYu19kRoP9mdRm0aMsIKZ05WYbV6dPRrjW3/CrNcFwgLqwUfgPIRKQ4l3V\nbX6mLXRMvnvS3dJXIg4+HM+xxnjEYF+vifn8XNdPNyODYcAwOl3WTLJS4Uh4HmAR\nG4jcwktHSKKqQV5ww5Igq8WD\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@movie-da146.iam.gserviceaccount.com",
  "client_id": "116163694624969445050",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40movie-da146.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};
    
    if (serviceAccountKey) {
      // Parse the service account key from environment variable
      const serviceAccount = (serviceAccountKey);
      
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      
      console.log('Firebase Admin SDK initialized with service account credentials');
    } else {
      // Fallback to application default credentials
      adminApp = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
      console.warn('Firebase Admin SDK initialized without service account - user deletion may not work');
    }
  } else {
    adminApp = admin.apps[0];
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization failed:', error.message);
  console.warn('User deletion from Firebase Auth will not work properly.');
}

export const adminAuth = adminApp ? admin.auth(adminApp) : null;
export const adminFirestore = adminApp ? admin.firestore(adminApp) : null;