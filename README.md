# Urban Roots - Backend

Bienvenue dans le dépôt backend du projet Urban Roots. Ce projet vise à encourager le jardinage urbain et la collaboration communautaire pour créer et entretenir des espaces verts. Notre objectif est d'améliorer la durabilité urbaine, d'éduquer à l'éco-responsabilité et de faciliter l'accès aux ressources de jardinage.

## Table des Matières

- [Urban Roots - Backend](#urban-roots---backend)
  - [Table des Matières](#table-des-matières)
  - [Présentation du Projet](#présentation-du-projet)
  - [Fonctionnalités](#fonctionnalités)
  - [Technologies Utilisées](#technologies-utilisées)
  - [Installation](#installation)
  - [Utilisation](#utilisation)
  - [Documentation de l'API](#documentation-de-lapi)
  - [Contribution](#contribution)
  - [Licence](#licence)

## Présentation du Projet

Urban Roots est une plateforme de jardinage urbain collaboratif conçue pour :

- Promouvoir la collaboration communautaire pour la création et l'entretien des espaces verts.
- Éduquer à l'éco-responsabilité et au jardinage urbain.
- Faciliter l'accès aux ressources de jardinage.
- Mesurer l'impact environnemental des activités de jardinage.
- Créer un réseau de soutien pour les jardiniers.
- Innover dans les pratiques de jardinage urbain.

## Fonctionnalités

- Carte interactive pour localiser et créer des espaces de jardinage.
- Plateforme d'échanges pour partager des ressources et des conseils.
- Forums communautaires pour discussions et organisation d'événements.
- Modules éducatifs sur le jardinage urbain.
- Outil de suivi environnemental pour mesurer les impacts des actions des utilisateurs.
- Système de recherche et de filtrage selon divers critères.
- Système d'évaluation des échanges et des utilisateurs.

## Technologies Utilisées

- **Langage :** TypeScript
- **Environnement d'exécution :** Node.js
- **Framework :** Express.js
- **Base de données :** MongoDB
- **CSS :** Tailwind CSS

## Installation
Clonez le dépôt :
```sh
  git clone https://github.com/your-username/urban-roots-backend.git
  cd urban-roots-backend
```

Installez les dépendances :
```sh
  npm install
```

Créez un fichier .env à la racine du projet et configurez vos variables d'environnement :
```env
  DB_URI=your_mongo_db_URI
  ACCESS_TOKEN_SECRET=your_secret_key
  REFRESH_TOKEN_SECRET=your_secret_key
```

Lancez le serveur de développement :
```sh
  npm run dev
```

## Utilisation
Une fois le serveur démarré, l'API sera accessible à http://localhost:3500. Vous pouvez utiliser des outils comme Postman pour interagir avec les différentes routes de l'API.

## Documentation de l'API
La documentation détaillée de l'API est disponible ici.

## Contribution
Les contributions sont les bienvenues ! Pour contribuer, veuillez suivre ces étapes :

1. Fork le projet.
2. Créez votre branche de fonctionnalité (git checkout -b feature/AmazingFeature).
3. Commitez vos changements (git commit -m 'Add some AmazingFeature').
4. Poussez vers la branche (git push origin feature/AmazingFeature).
5. Ouvrez une Pull Request.

## Licence
Ce projet est sous licence MIT.