/* =====================================
   GARANGODAAKI V2.0
   APPLICATION PRINCIPALE
===================================== */

"use strict";
import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =====================================
   CONFIGURATION
===================================== */


const GARANGO = {

name:"GarangoDaaki",

version:"2.0",

language:"fr",

};


/* =====================================
   RECHERCHE
===================================== */


const searchInput = document.getElementById("mainSearch");

const searchButton = document.getElementById("searchButton");



function searchProducts(){


const text = searchInput.value.trim();


if(text === ""){

alert("Veuillez saisir une recherche.");

return;

}


console.log(
"Recherche GarangoDaaki :",
text
);


/*
Plus tard :
Connexion Firebase
Recherche dans la base produits
*/


}



if(searchButton){

searchButton.addEventListener(
"click",
searchProducts
);

}



/* =====================================
   FAVORIS
===================================== */


let favorites =
JSON.parse(
localStorage.getItem("garango_favorites")
)
|| [];



function addFavorite(id){


if(!favorites.includes(id)){

favorites.push(id);


localStorage.setItem(
"garango_favorites",
JSON.stringify(favorites)
);


console.log(
"Ajouté aux favoris",
id
);


}


}



/* =====================================
   MODE SOMBRE
===================================== */


function enableDarkMode(){


document.body.classList.toggle(
"dark"
);


localStorage.setItem(
"garango_dark",
document.body.classList.contains("dark")
);


}



if(
localStorage.getItem("garango_dark")
==="true"
){

document.body.classList.add("dark");

}



console.log(
GARANGO.name+" démarré"
);
/* =====================================
   CONNEXION INTERNET
===================================== */


function checkConnection(){


if(navigator.onLine){


console.log(
"GarangoDaaki : En ligne"
);


}else{


console.log(
"GarangoDaaki : Hors connexion"
);


}



}



window.addEventListener(
"online",
checkConnection
);


window.addEventListener(
"offline",
checkConnection
);


checkConnection();



/* =====================================
   INSTALLATION PWA
===================================== */


let installPrompt;



window.addEventListener(
"beforeinstallprompt",
(event)=>{


event.preventDefault();


installPrompt = event;


console.log(
"PWA prête à être installée"
);


}
);



async function installApp(){


if(!installPrompt){


console.log(
"Installation non disponible pour le moment"
);


return;


}



installPrompt.prompt();


const result =
await installPrompt.userChoice;



console.log(
"Installation :",
result.outcome
);


installPrompt = null;


}




/* =====================================
   NOTIFICATIONS
===================================== */


function requestNotification(){


if(
"Notification" in window
){


Notification.requestPermission()
.then(permission=>{


console.log(
"Notification :",
permission
);


});


}


}



/* =====================================
   INITIALISATION
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"GarangoDaaki V2 chargé avec succès"
);


}
);
/* =====================================
   PRODUITS FIREBASE
===================================== */

async function loadProducts() {

  const container = document.getElementById("productsContainer");

  if (!container) return;

  try {

    const snapshot = await getDocs(collection(db, "products"));

    container.innerHTML = "";

    if (snapshot.empty) {

      container.innerHTML =
      "<p>Aucune annonce disponible.</p>";

      return;

    }

    snapshot.forEach((doc) => {

      const product = doc.data();

      container.innerHTML += `
      <div class="product-card">

        <img src="${product.image || 'images/no-image.png'}" alt="${product.title}">

        <h3>${product.title}</h3>

        <p>${product.price || ""}</p>

        <p>${product.city || ""}</p>

      </div>
      `;

    });

  } catch (error) {

    console.error(error);

  }

}

document.addEventListener("DOMContentLoaded", loadProducts);
