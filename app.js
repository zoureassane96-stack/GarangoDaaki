/* ==========================================
   GARANGODAAKI APP
   Version 1.0
========================================== */
import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

"use strict";

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

async function loadProducts(){

try {

const snapshot = await getDocs(collection(db,"products"));

snapshot.forEach((doc)=>{

console.log("Produit Firebase :", doc.data());

});

} catch(error){

console.error("Erreur Firebase :", error);

}

}

loadProducts();
