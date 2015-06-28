# Flickr-Grand-Lyon

Projet réalisé en 4ème année à l'Insa de Lyon, département Informatique.

## Description du sujet : 
Dans un souci d’améliorer ses transports en communs et la vie des touristes visitant Lyon, le Grand Lyon souhaite trouver de manière non-intrusive les zones à fortes densités de touristes.
Afin de mener à bien ce projet, nous disposons d'une base de données de plus de 80 000 photos prises au cours de plusieurs années aux alentours du Grand Lyon et téléchargées sur Flickr.

Format des tuples : *< id_photo; id_photographe; latitude; longitude; tags; description; dates >*

## Réalisation du projet : 
Grâce à une version de Knime Analytic, nous avons pu effectuer différents traitement sur l'enorme base de données que nous disposions afin d'en tiré les plus gros points d'intérets du Grand Lyon toutes années confondues.
Nous avons ensuite extrait nos résultats et réalisé cette démonstration de visualisation des principaux centre d'intérets.

Cette démo à été réalisé avec le framework front-end **Bootstrap**, l'**API Google Maps** pour les cartes et l'**API Flickr** pour la récupération des photos
