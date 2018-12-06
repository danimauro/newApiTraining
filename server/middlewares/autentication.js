const jwt = require('jsonwebtoken');


// =================
// Verificar token
// =================

let verificaToken = async (req, res, next) => {

    try{

        //leer headers de peticion
        let token = req.get('token');

        //se verifica el token
        await jwt.verify(token, process.env.SEED, (err, decoded) => {
            
            if (err) {
                return res.status(401).json({
                    ok: false,  
                    message: 'Token no válido'
                })
            }

            req.usuario = decoded.usuario;

            next();

        });

    } catch(e){
        console.log(e);
    }

}

module.exports = {
    verificaToken
}