const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nocache = require("nocache");
const helmet = require("helmet");

const User = require('./models/User');
const Sauces = require('./models/Sauces');


mongoose.connect('mongodb+srv://jord140:qyyH5Pu11O8IVD2s@cluster0.g3ksp.mongodb.net/test', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();


app.use((req, res, next) => {
  // on indique que les ressources peuvent être partagées depuis n'importe quelle origine

  res.setHeader('Access-Control-Allow-Origin', '*');

 // on indique les entêtes qui seront utilisées après la pré-vérification cross-origin afin de donner l'autorisation

  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');

// on indique les méthodes autorisées pour les requêtes HTTP

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  // on autorise ce serveur à fournir des scripts pour la page visitée

  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

app.use(bodyParser.urlencoded({
  extended: true
}));

// On utilise une méthode body-parser pour la transformation du corps de la requête en JSON.

// Transforme les données arrivant de la requête POST en un objet JSON.
app.use(bodyParser.json())

// On utilise helmet pour plusieurs raisons notamment la mise en place du X-XSS-Protection afin d'activer le filtre de script intersites(XSS) dans les navigateurs web
app.use(helmet());

//Désactive la mise en cache du navigateur
app.use(nocache());

app.post('/api/auth/signup', (req, res, next) => {
  delete req.body._id;

  const User = new User({
    email: req.body.email, password: req.body.password
  });
  User.save()
    .then(() => res.status(201).json({ message: 'Utilisateur enregistré !' }))
    .catch(error => res.status(400).json({ error }));
});

app.post('/api/auth/login', (req, res, next) => {
  delete req.body._id;
  User.findOne({ email, password })
    .then(() => res.status(200).json({ message: '******' }))
    .catch(error => res.status(400).json({ error }));
});

app.get('/api/sauces', (req, res, next) => {
  Sauces.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
});

app.get('/api/sauces/:id', (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
});

app.post('/api/sauces', (req, res, next) => {
  delete req.body._id;

  const Sauce = new Sauce({
    id: req.body.id, imageUrl: req.body.imageUrl,
  });
  Sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({ error }));
});

app.put('/api/sauces/:id', (req, res, next) => {

  Sauce.updateOne({ _id: req.body.id }, { imageUrl: req.body.imageUrl })
    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    .catch(error => res.status(400).json({ error }));
});

app.delete('/api/sauces/:id', (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
    .catch(error => res.status(400).json({ error }));

});

app.post('/api/sauces/:id/like', (req, res, next) => {
  delete req.body._id;


});

// app.post('/api/stuff', (req, res, next) => {
//   delete req.body._id;
//   const thing = new Thing({
//     ...req.body
//   });
//   thing.save()
//     .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
//     .catch(error => res.status(400).json({ error }));
// });

// app.put('/api/stuff/:id', (req, res, next) => {
//   Thing.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
//     .then(() => res.status(200).json({ message: 'Objet modifié !'}))
//     .catch(error => res.status(400).json({ error }));
// });

// app.delete('/api/stuff/:id', (req, res, next) => {
//   Thing.deleteOne({ _id: req.params.id })
//     .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
//     .catch(error => res.status(400).json({ error }));
// });

// app.get('/api/stuff/:id', (req, res, next) => {
//   Thing.findOne({ _id: req.params.id })
//     .then(thing => res.status(200).json(thing))
//     .catch(error => res.status(404).json({ error }));
// });

// app.get('/api/stuff', (req, res, next) => {
//   Thing.find()
//     .then(things => res.status(200).json(things))
//     .catch(error => res.status(400).json({ error }));
// });

module.exports = app;