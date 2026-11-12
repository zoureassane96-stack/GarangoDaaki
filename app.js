/* ==========================================
   GARANGODAAKI APP
   Version 2.0
========================================== */

// Firebase
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
const APP_VERSION = "2.0.0";
const DEFAULT_LANGUAGE = "fr";

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

const searchInput = document.getElementById("mainSearch");
const searchBtn = document.getElementById("searchButton");
const offlineNotice = document.getElementById("offlineNotice");
const productsContainer = document.getElementById("productsContainer");
const publishSection = document.getElementById("publishSection");
const openPublish = document.getElementById("openPublish");

/* -----------------------------
Connexion Internet
------------------------------*/

function updateConnection() {

  APP.online = navigator.onLine;

  if (offlineNotice) {
    offlineNotice.style.display = APP.online ? "none" : "block";
  }

}

window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);

updateConnection();

/* -----------------------------
Recherche
------------------------------*/

function searchProducts() {

  if (!searchInput) return;

  const value = searchInput.value.trim().toLowerCase();

  console.log("Recherche :", value);

}

if (searchBtn) {
  searchBtn.addEventListener("click", searchProducts);
}

/* -----------------------------
Mode sombre
------------------------------*/

function toggleDarkMode() {

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "garango_dark",
    document.body.classList.contains("dark")
  );

}

if (localStorage.getItem("garango_dark") === "true") {
  document.body.classList.add("dark");
}

console.log(`${APP_NAME} ${APP_VERSION} démarré`);
/* -----------------------------
Chargement des produits Firebase
------------------------------*/

async function loadProducts() {

  if (!productsContainer) return;

  productsContainer.innerHTML = "<p>Chargement des annonces...</p>";

  try {

    const snapshot = await getDocs(collection(db, "products"));

    productsContainer.innerHTML = "";

    if (snapshot.empty) {
      productsContainer.innerHTML = `
        <div class="empty-state">
          <p>Aucune annonce disponible.</p>
        </div>
      `;
      return;
    }

    snapshot.forEach((doc) => {

      const product = doc.data();

      const image = product.imageUrl || "images/no-image.png";
      const title = product.title || "Sans titre";
      const price = product.price || "0";
      const city = product.city || "";

      productsContainer.innerHTML += `
        <div class="product-card">
          <img src="${image}" alt="${title}">
          <h3>${title}</h3>
          <p><strong>${price} FCFA</strong></p>
          <p>${city}</p>
        </div>
      `;

    });

  } catch (error) {

    console.error("Erreur Firestore :", error);

    productsContainer.innerHTML = `
      <div class="empty-state">
        <p>Impossible de charger les annonces.</p>
      </div>
    `;

  }

}

loadProducts();
/* -----------------------------
Ouverture du formulaire
------------------------------*/

if (openPublish && publishSection) {

  openPublish.addEventListener("click", () => {

    publishSection.style.display = "block";

    publishSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

}

/* -----------------------------
Publication d'une annonce
------------------------------*/

const publishForm = document.getElementById("publishForm");

if (publishForm) {

  publishForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title")?.value.trim();
    const price = document.getElementById("price")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const imageUrl = document.getElementById("imageUrl")?.value.trim();

    if (!title || !price) {
      alert("Veuillez remplir au moins le titre et le prix.");
      return;
    }

    try {

      await addDoc(collection(db, "products"), {
        title,
        price,
        city,
        imageUrl,
        createdAt: Date.now()
      });

      alert("Annonce publiée avec succès !");

      publishForm.reset();

      loadProducts();

    } catch (error) {

      console.error(error);
      alert("Erreur lors de la publication : " + error.message);

    }

  });

}
