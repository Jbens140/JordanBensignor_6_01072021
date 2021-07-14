
// Création d'un model user avec mongoose, on importe donc mongoose
const mongoose = require('mongoose');
require('mongoose-type-email');

const uniqueValidator = require('mongoose-unique-validator');
const sanitizerPlugin = require('mongoose-sanitizer-plugin');

const userSchema = mongoose.Schema({

    // L'email doit être unique

    email: {
        type: String,
        unique: true,
        required: [true, "Veuillez entrer votre adresse email"],
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Veuillez entrer une adresse email correcte"]
    },

    // enregistrement du mot de pass 
    password: {
        type: String,
        required: [true, "Veuillez choisir un mot de passe"]
    }
});

// Plugin pour garantir un email unique
userSchema.plugin(uniqueValidator);
// Plugin pour Mongoose qui purifie les champs du model avant de les enregistrer dans la base MongoDB.
userSchema.plugin(sanitizerPlugin);

// On exporte ce schéma sous forme de modèle : le modèle s'appellera user et on lui passe le shéma de données
module.exports = mongoose.model('User', userSchema);