/* ==========================================
   GARANGODAAKI APP
   Version 3.0
========================================== */

// Firebase
import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* -----------------------------
Configuration
------------------------------*/

const APP_NAME = "GarangoDaaki";
const APP_VERSION = "3.0.0";
const DEFAULT_LANGUAGE = "fr";

/* -----------------------------
État de l'application
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
const publishForm = document.getElementById("publishForm");

const openPublish = document.getElementById("openPublish");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

console.log(`${APP_NAME} ${APP_VERSION} démarré`);
/* -----------------------------
Authentification Firebase
------------------------------*/

onAuthStateChanged(auth, (user) => {

  APP.user = user;

  if (user) {

    console.log("Utilisateur connecté :", user.email);

    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

  } else {

    console.log("Aucun utilisateur connecté");

    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";

  }

});

/* -----------------------------
Connexion
------------------------------*/

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    const email = prompt("Votre adresse e-mail :");
    if (!email) return;

    const password = prompt("Votre mot de passe :");
    if (!password) return;

    try {

      await signInWithEmailAndPassword(auth, email, password);

      alert("Connexion réussie !");

    } catch (error) {

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {

        const creer = confirm(
          "Compte introuvable.\nVoulez-vous créer un nouveau compte ?"
        );

        if (!creer) return;

        try {

          await createUserWithEmailAndPassword(auth, email, password);

          alert("Compte créé avec succès !");

        } catch (e) {

          alert(e.message);

        }

      } else {

        alert(error.message);

      }

    }

  });

}
      

/* -----------------------------
Déconnexion
------------------------------*/

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    alert("Vous êtes déconnecté.");

  });

}
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

  const cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {

    const text = card.textContent.toLowerCase();

    card.style.display = text.includes(value) ? "block" : "none";

  });

}

if (searchBtn) {
  searchBtn.addEventListener("click", searchProducts);
}

if (searchInput) {
  searchInput.addEventListener("keyup", searchProducts);
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
/* -----------------------------
Ouverture du formulaire
------------------------------*/

if (openPublish && publishSection) {

  openPublish.addEventListener("click", () => {

    if (!APP.user) {
      alert("Veuillez vous connecter avant de publier une annonce.");
      return;
    }

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

if (publishForm) {

  publishForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const price = document.getElementById("price").value.trim();
    const city = document.getElementById("city").value.trim();
    const category = document.getElementById("category").value;
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title || !price || !city || !category) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {

      if (!APP.user) {
  alert("Veuillez vous connecter.");
  return;
}

await addDoc(collection(db, "products"), {
  title,
  price,
  city,
  category,
  imageUrl,
  description,
  userId: APP.user.uid,
  userEmail: APP.user.email,
  createdAt: Date.now()
});

      alert("Annonce publiée avec succès !");

      publishForm.reset();

      publishSection.style.display = "none";

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

     await loadProducts(); 

    } catch (error) {

      console.error(error);
      alert("Erreur : " + error.message);

    }

  });

}
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

      productsContainer.innerHTML += `
        <div class="product-card">

          <img
            src="${product.imageUrl || "assets/logo/default.webp"}"
            alt="${product.title || "Annonce"}"
          >

          <h3>${product.title || "Sans titre"}</h3>

          <p><strong>${product.price || 0} FCFA</strong></p>

          <p>📍 ${product.city || ""}</p>

          <p>📂 ${product.category || ""}</p>

          <p>
            ${(product.description || "").substring(0, 100)}
            ${product.description && product.description.length > 100 ? "..." : ""}
          </p>

        </div>
      `;

    });

  } catch (error) {

    console.error("Erreur Firestore :", error);

    productsContainer.innerHTML =
      "<p>Impossible de charger les annonces.</p>";

  }

}
/* -----------------------------
Initialisation
------------------------------*/

document.addEventListener("DOMContentLoaded", () => {

  console.log(APP_NAME + " prêt.");

  updateConnection();

  loadProducts();

});
