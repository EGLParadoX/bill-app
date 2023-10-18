# Solutions Techniques pour Billed-App

## Mon Aventure avec Billed-App : Comment J'ai Surmonté les Problèmes

### Problème 1 : Test de Connexion ✅

#### Mon Approche

Eh bien, durant mon périple avec billapp, j'ai rencontré quelques embûches techniques. L'une d'elles concernait un test de connexion où les choses ne se déroulaient pas comme prévu. J'ai plongé dans le code et devine quoi ? J'ai découvert qu'une référence à un identifiant (ou "id" pour les initiés) était légèrement décalée. Après avoir corrigé cette référence, le test s'est finalement comporté comme il fallait.

### Problème 2 : Gestion des Justificatifs ✅

#### Mon Approche

Une autre péripétie s'est produite lors de la gestion des justificatifs. Lorsque j'essayais d'envoyer une note de frais avec un justificatif ne respectant pas les formats autorisés (tout sauf jpg, jpeg ou png), les choses se compliquaient. Même si la page "Bills" s'affichait, le justificatif restait invisible. Lorsque je passais en mode administrateur, le nom du fichier lié au ticket affichait "null" et le justificatif restait tout autant invisible.

Pour résoudre ce problème, j'ai utilisé une "condition" dans le code pour vérifier si le fichier sélectionné avait une extension valide (jpg, jpeg, png). Voici un petit exemple de code :

```javascript
const formatsAutorises = ['jpeg', 'jpg', 'png'];
const inputFichier = document.querySelector(`input[data-testid="file"]`);
const fichier = inputFichier.files[0];
const cheminFichier = e.target.value.split(/\\/g);

if (!fichier) {
  console.error("Aucun fichier sélectionné.");
  return;
}

const nomFichier = cheminFichier[cheminFichier.length - 1];

if (!formatsAutorises.includes(nomFichier.split('.').pop().toLowerCase())) {
  inputFichier.value = "";
  console.error("Format de fichier invalide. Formats autorisés : jpeg, jpg, png.");
  return;
}
```

En somme, ce bout de code commence par vérifier si un fichier est sélectionné. Sinon, il affiche un message d'erreur. Ensuite, il examine si l'extension du fichier se trouve dans la liste des extensions autorisées. Si ce n'est pas le cas, il vide le champ de sélection et affiche un autre message d'erreur.

### Problème 3 : Gestion des Tickets ✅
#### Résolution de Problème : Désamorcer les Sélections de Tickets en Double
Laisse-moi te raconter une situation intrigante dans l'univers de la gestion des tickets côté super-admin RH de Billed-App-Front. J'ai repéré un problème déconcertant : après avoir choisi un ticket dans une liste, comme celle des "validés", puis avoir navigué vers une autre liste, disons les "refusés", retourner à la première liste m'empêchait curieusement de sélectionner à nouveau un ticket. Vraiment casse-tête, je te dis.

#### L'Art de la Solution : .off à la Rescousse
C'est là que l'astuce .off entre en jeu, et elle est loin d'être anodine ! En utilisant cette fonctionnalité puissante de jQuery, j'ai réussi à résoudre ce problème en désamorçant les écouteurs d'événements redondants. Permet-moi de t'éclairer davantage sur cette technique salvatrice :

```javascript
for (let i = 0; i < bills.length; i++) {
  const bill = bills[i];
  $(`#open-bill${bill.id}`).off('click').click((e) => this.handleEditTicket(e, bill, bills));
}
```
En gros, ce bout de code fait un boulot génial. Il dit aux écouteurs d'événements de prendre une pause. C'est comme si on disait : "Hé, les gars, pas besoin de faire la même chose en boucle, ok ?". Cette pause permet d'éviter toute confusion quand je veux choisir des tickets.

C'est simple, l'astuce .off élimine ces clics excessifs en évitant les doublons, pour ensuite introduire des clics ciblés qui déclenchent la fonction "handleEditTicket" avec les informations nécessaires.
### Débuggage avec Console.log et Inspecteur Google 🐞
Lorsque je traquais ces problèmes, mes outils préférés étaient mes fidèles consoles.log et consoles.error. Je les plaçais partout dans le code pour suivre les étapes du processus. C'était un peu comme un GPS pour naviguer dans le code.

L'inspecteur Google m'a aussi rendu de précieux services. Grâce aux outils de développement du navigateur, j'ai pu surveiller les événements en temps réel, observer les requêtes réseau et effectuer des ajustements au JavaScript en direct. Cela m'a grandement aidé à repérer et résoudre les problèmes.

### Prochaine Étape : Plus de Tests et des Mises à Jour 🚀
Après avoir consacré du temps à Bill-App et résolu plusieurs énigmes techniques, il me reste encore quelques étapes pour consolider davantage l'application :

Ajouter des tests pour garantir le bon fonctionnement des fonctionnalités existantes.
Mettre en place des tests E2E pour simuler les parcours utilisateur et assurer une connexion fluide.
Continuer à optimiser et mettre à jour le code pour offrir une expérience utilisateur exceptionnelle.
### Système Utilisé et Liens Pertinents
Si vous êtes curieux, voici les ingrédients techniques que j'ai utilisés :

- **Node.js** : Pour exécuter le code JavaScript côté serveur. <img src="https://img.shields.io/badge/-Node.js-black?style=flat&logo=node.js" alt="Node.js">
- **JavaScript** : Le langage de programmation côté client. <img src="https://img.shields.io/badge/-JavaScript-black?style=flat&logo=javascript" alt="JavaScript">
- **HTML et CSS** : Les bases pour construire et styliser l'interface utilisateur. <img src="https://img.shields.io/badge/-HTML-black?style=flat&logo=html5" alt="HTML"> <img src="https://img.shields.io/badge/-CSS-black?style=flat&logo=css3" alt="CSS">


Si vous voulez explorer davantage, jetez un coup d'œil au [Billed-App-FR-back](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back). C'est la partie cachée qui gère tout le côté technique.






