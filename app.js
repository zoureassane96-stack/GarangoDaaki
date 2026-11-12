/* ==========================================
   GARANGODAAKI APP
   Version 1.0
========================================== */
import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* -----------------------------
Configuration
------------------------------*/

const APP_NAME = "GarangoDaaki";

const DEFAULT_LANGUAGE = "fr";

const APP_VERSION = "1.0.0";

/* -----------------------------
Etat de l'application
------------------------------*/

const APP = {

language: DEFAULT_LANGUAGE,

favorites: [],

user: null,

online: navigator.onLine

};

/* -----------------------------
Sélecteurs
------------------------------*/

const searchInput = document.getElementById("searchInput");

const searchBtn = document.getElementById("searchBtn");

const offlineNotice = document.getElementById("offlineNotice");

/* -----------------------------
Connexion internet
------------------------------*/

function updateConnection(){

APP.online = navigator.onLine;

if(APP.online){

offlineNotice.style.display="none";

}else{

offlineNotice.style.display="block";

}

}

window.addEventListener("online",updateConnection);

window.addEventListener("offline",updateConnection);

updateConnection();

/* -----------------------------
Recherche
------------------------------*/

function searchProducts(){

const value = searchInput.value.trim();

if(value===""){

alert("Saisissez un produit à rechercher.");

return;

}

console.log("Recherche :",value);

}

if(searchBtn){

searchBtn.addEventListener("click",searchProducts);

}

/* -----------------------------
Mode sombre
------------------------------*/

function toggleDarkMode(){

document.body.classList.toggle("dark");

localStorage.setItem(

"garango_dark",

document.body.classList.contains("dark")

);

}

if(localStorage.getItem("garango_dark")==="true"){

document.body.classList.add("dark");

}

console.log(APP_NAME+" démarré");
/* -----------------------------
Chargement des produits Firebase
------------------------------*/

async function loadProducts() {

  const container = document.getElementById("productsContainer");

  if (!container) return;

  try {

    const snapshot = await getDocs(collection(db, "products"));

    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "<p>Aucune annonce disponible.</p>";
      return;
    }

    snapshot.forEach((doc) => {

      const product = doc.data();

      container.innerHTML += `
        <div class="product-card">
          <img src="${product.imageUrl || 'images/no-image.png'}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p><strong>${product.price} FCFA</strong></p>
          <p>${product.city}</p>
        </div>
      `;

    });

  } catch (error) {

    console.error(error);
    alert("Erreur : " + error.message);

  }

}

loadProducts();
/* -----------------------------
Ouverture du formulaire
------------------------------*/

document.addEventListener("DOMContentLoaded", () => {

  const openPublish = document.getElementById("openPublish");
  const publishSection = document.getElementById("publishSection");

  if (openPublish && publishSection) {

    openPublish.addEventListener("click", () => {

      alert("Bouton Publier cliqué !");
publishSection.style.display = "block";

      publishSection.scrollIntoView({
        behavior: "smooth"
      });

    });

  }

});
