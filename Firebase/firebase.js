const admin = require('firebase-admin')
const serviceAccount = require('../envolo-718e0-firebase-adminsdk-fbsvc-1d0e9061c2.json')



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });



  const db = admin.firestore();


  module.exports = db;