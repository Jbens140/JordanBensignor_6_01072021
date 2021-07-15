// Récupération du modèle créé grâce à la fonction schéma de mongoose
// Récupération du modèle 'sauce'

const Sauce = require('../models/sauce');
// Récupération du module 'file system' de Node permettant de gérer ici les téléchargements et modifications d'images

const fs = require('fs');

// Permet de créer une nouvelle sauce

exports.createSauce = (req, res, next) => {
    // On stocke les données envoyées par le front-end sous forme de form-data dans une variable en les transformant en objet js
    const sauceObject = JSON.parse(req.body.sauce);
    // On supprime l'id généré automatiquement et envoyé par le front-end. L'id de la sauce est créé par la base MongoDB lors de la création dans la base
    delete sauceObject._id;
    // Création d'une instance du modèle Sauce
    const sauce = new Sauce({
      ...sauceObject,
      // On modifie l'URL de l'image, on veut l'URL complète, quelque chose dynamique avec les segments de l'URL
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: []
})};

// Sauvegarde de la sauce dans la base de données
sauce.save()
// On envoi une réponse au frontend avec un statut 201 sinon on a une expiration de la requête
.then(() => res.status(201).json({
  message: 'Sauce enregistrée !'
}))
// On ajoute un code erreur en cas de problème
.catch(error => res.status(400).json({
  error
}));


