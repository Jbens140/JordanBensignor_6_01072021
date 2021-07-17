// Récupération du modèle créé grâce à la fonction schéma de mongoose
// Récupération du modèle 'sauce'

const Sauce = require('../models/Sauces');
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
  })
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
};



// Permet de modifier une sauce

exports.modifyOneSauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée.' }))
    .catch(error => res.status(400).json({ error }));
};

//supprimer une sauce
exports.deleteOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.user) {  // on compare l'id de l'auteur de la sauce et l'id de l'auteur de la requête
        res.status(401).json({ message: "action non autorisée" });  // si ce ne sont pas les mêmes id = code 401: unauthorized.
        return sauce;
      }
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'sauce supprimée.' }))
          .catch(error => res.status(400).json({ error }));
      })
    });
};

//accéder à une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => { res.status(200).json(sauce); })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

//accéder à toutes les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => { res.status(200).json(sauces); })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.rateOneSauce = (req, res, next) => {
  switch (req.body.like) {
    case 0:                                                   //cas: req.body.like = 0
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.find(user => user === req.body.userId)) {  // on cherche si l'utilisateur est déjà dans le tableau usersLiked
            Sauce.updateOne({ _id: req.params.id }, {         // si oui, on va mettre à jour la sauce avec le _id présent dans la requête
              $inc: { likes: -1 },                            // on décrémente la valeur des likes de 1 (soit -1)
              $pull: { usersLiked: req.body.userId }          // on retire l'utilisateur du tableau.
            })
              .then(() => { res.status(201).json({ message: "vote enregistré." }); }) //code 201: created
              .catch((error) => { res.status(400).json({ error }); });

          }
          if (sauce.usersDisliked.find(user => user === req.body.userId)) {  //mêmes principes que précédemment avec le tableau usersDisliked
            Sauce.updateOne({ _id: req.params.id }, {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId }
            })
              .then(() => { res.status(201).json({ message: "vote enregistré." }); })
              .catch((error) => { res.status(400).json({ error }); });
          }
        })
        .catch((error) => { res.status(404).json({ error }); });
      break;

    case 1:                                                 //cas: req.body.like = 1
      Sauce.updateOne({ _id: req.params.id }, {             // on recherche la sauce avec le _id présent dans la requête
        $inc: { likes: 1 },                                 // incrémentaton de la valeur de likes par 1.
        $push: { usersLiked: req.body.userId }              // on ajoute l'utilisateur dans le array usersLiked.
      })
        .then(() => { res.status(201).json({ message: "vote enregistré." }); }) //code 201: created
        .catch((error) => { res.status(400).json({ error }); }); //code 400: bad request
      break;

    case -1:                                                  //cas: req.body.like = 1
      Sauce.updateOne({ _id: req.params.id }, {               // on recherche la sauce avec le _id présent dans la requête
        $inc: { dislikes: 1 },                                // on décremente de 1 la valeur de dislikes.
        $push: { usersDisliked: req.body.userId }             // on rajoute l'utilisateur à l'array usersDiliked.
      })
        .then(() => { res.status(201).json({ message: "vote enregistré." }); })
        .catch((error) => { res.status(400).json({ error }); });
      break;
    default:
      console.error("bad request");
  }
};