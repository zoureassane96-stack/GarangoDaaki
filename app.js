// ==========================================
// GARANGODAAKI APP V3
// AUTHENTIFICATION + BASE
// ==========================================

import { db, auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



// ==========================
// ELEMENTS
// ==========================

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const openPublish = document.getElementById("openPublish");
const openPublishMobile = document.getElementById("openPublishMobile");

const publishSection = document.getElementById("publishSection");
const publishForm = document.getElementById("publishForm");

const productsContainer = document.getElementById("productsContainer");

const userInfo = document.getElementById("userInfo");

const profileSection = document.getElementById("profileSection");



// ==========================
// UTILISATEUR CONNECTÉ
// ==========================

let currentUser = null;



onAuthStateChanged(auth, (user)=>{

  currentUser = user;


  if(user){

    if(loginBtn)
      loginBtn.style.display="none";


    if(logoutBtn)
      logoutBtn.style.display="block";


    if(userInfo)
      userInfo.innerHTML =
      `
      Connecté : <b>${user.email}</b>
      `;


  }else{


    if(loginBtn)
      loginBtn.style.display="block";


    if(logoutBtn)
      logoutBtn.style.display="none";


    if(userInfo)
      userInfo.innerHTML =
      "Connectez-vous pour accéder à votre profil.";


  }


});



// ==========================
// DECONNEXION
// ==========================

if(logoutBtn){

logoutBtn.addEventListener("click", async()=>{

 await signOut(auth);

 alert("Vous êtes déconnecté.");

});

}
// ==========================
// OUVERTURE PUBLICATION
// ==========================


function openPublication(){

  if(!currentUser){

    alert("Veuillez vous connecter avant de publier une annonce.");

    return;

  }


  if(publishSection){

    publishSection.style.display = "block";

    publishSection.scrollIntoView({
      behavior:"smooth"
    });

  }

}



if(openPublish){

openPublish.addEventListener(
"click",
openPublication
);

}



if(openPublishMobile){

openPublishMobile.addEventListener(
"click",
(e)=>{

e.preventDefault();

openPublication();

}

);

}



// ==========================
// PUBLICATION FIRESTORE
// ==========================


if(publishForm){


publishForm.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



if(!currentUser){

alert("Connexion nécessaire.");

return;

}



const annonce = {


title:
document.getElementById("title").value,


price:
document.getElementById("price").value,


city:
document.getElementById("city").value,


category:
document.getElementById("category").value,


imageUrl:
document.getElementById("imageUrl").value,


description:
document.getElementById("description").value,


userId:
currentUser.uid,


userEmail:
currentUser.email,


createdAt:
serverTimestamp()


};



try{


await addDoc(
collection(db,"annonces"),
annonce
);



alert("Annonce publiée avec succès !");


publishForm.reset();


loadAnnonces();



}catch(error){


console.error(
"Erreur publication :",
error
);


alert(
"Erreur pendant la publication."
);


}



});


}




// ==========================
// CHARGEMENT ANNONCES
// ==========================


async function loadAnnonces(){


if(!productsContainer)
return;



try{


const q = query(
collection(db,"annonces"),
orderBy("createdAt","desc")
);



const snapshot =
await getDocs(q);



productsContainer.innerHTML="";



if(snapshot.empty){


productsContainer.innerHTML =
`
<div class="empty-state">
<p>Aucune annonce pour le moment.</p>
</div>
`;


return;

}



snapshot.forEach((doc)=>{


const data = doc.data();



productsContainer.innerHTML +=

`
<div class="product-card">


<img 
src="${data.imageUrl || 'logo.png'}"
alt="${data.title}">


<h3>
${data.title}
</h3>


<p>
${data.category}
</p>


<strong>
${data.price} FCFA
</strong>


<p>
${data.city}
</p>


<p>
${data.description}
</p>


<button>
Contacter
</button>


</div>
`;


});


}catch(error){


console.error(
"Erreur chargement annonces :",
error
);


productsContainer.innerHTML =
`
<p>Impossible de charger les annonces.</p>
`;

}



}


loadAnnonces();
// ==========================
// RECHERCHE
// ==========================


const searchInput =
document.getElementById("mainSearch");


const searchButton =
document.getElementById("searchButton");



if(searchButton){


searchButton.addEventListener(
"click",
()=>{


const text =
searchInput.value.toLowerCase();



const cards =
document.querySelectorAll(".product-card");



cards.forEach(card=>{


const content =
card.innerText.toLowerCase();



if(content.includes(text)){

card.style.display="block";

}else{

card.style.display="none";

}


});


});


}



// ==========================
// PROFIL
// ==========================


if(profileSection){


profileSection.addEventListener(
"click",
()=>{


if(!currentUser){


alert(
"Veuillez vous connecter pour accéder au profil."
);



if(loginBtn){

loginBtn.click();

}


}else{


alert(
"Votre profil : " + currentUser.email
);



}


});


}



// ==========================
// FAVORIS
// ==========================


const favoriteBtn =
document.getElementById("favoriteBtn");



if(favoriteBtn){


favoriteBtn.addEventListener(
"click",
()=>{


alert(
"Fonction favoris bientôt disponible."
);


});


}




// ==========================
// SERVICE WORKER PWA
// ==========================


if("serviceWorker" in navigator){


window.addEventListener(
"load",
()=>{


navigator.serviceWorker.register(
"sw.js"
)

.then(()=>{

console.log(
"GarangoDaaki : Service Worker enregistré"
);

})

.catch((error)=>{


console.error(
"Erreur Service Worker :",
error
);


});


});


}
