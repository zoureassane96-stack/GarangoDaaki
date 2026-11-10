/* =====================================
   GARANGODAAKI V2.0
   CONFIGURATION FIREBASE
===================================== */


/*
  Les informations ci-dessous seront remplacées
  par celles de ton projet Firebase.
*/


const firebaseConfig = {

apiKey: "REMPLACE_PAR_TON_API_KEY",

authDomain: "REMPLACE_PAR_TON_DOMAINE_FIREBASE",

projectId: "REMPLACE_PAR_TON_PROJECT_ID",

storageBucket: "REMPLACE_PAR_TON_STORAGE",

messagingSenderId: "REMPLACE_PAR_TON_SENDER_ID",

appId: "REMPLACE_PAR_TON_APP_ID"

};



/* =====================================
   INITIALISATION
===================================== */


let firebaseApp = null;


function initializeFirebase(){


if(
typeof firebase === "undefined"
){


console.log(
"Firebase SDK non chargé"
);


return;


}



firebaseApp =
firebase.initializeApp(
firebaseConfig
);



console.log(
"Firebase GarangoDaaki connecté"
);



}



initializeFirebase();
