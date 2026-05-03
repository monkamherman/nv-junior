import { body } from "express-validator";


const validator = {
    articleValidator: [
        body("title", "veillez remplire votre nom").not().isEmpty(),
        body("description", "veillez remplire votre email").not().isEmpty(),
        body("prix", "veillez entrer un prix valide" ).isFloat(),
        body("categorie", "veillez entrer une categorie valide").not().isEmpty(),
        body("favoris", "veillez entrer un favoris valide").isBoolean(),
        body("image", "veillez entrer une image valide").not().isEmpty(),
        

    ],
    tableValidator: [
        body("numero", "entrer le numero de table").not().isEmpty(),
        body("entrer la capaciter de la table").not().isEmpty(),
        body("entrer le nombre raisonable").isLuhnNumber(),
        body("entrer un nombre").isLuhnNumber()
    ]
} 

export default validator