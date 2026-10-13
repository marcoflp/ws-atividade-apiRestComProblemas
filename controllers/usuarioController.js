
const usuarioService = require("../services/usuarioService");

async function login(req, res, next) {
    try {
        const { email, senha } = req.body;

        if (req.body.email === undefined || req.body.senha === undefined) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Email e senha são obrigatórios",
            });
        }

        const usuario = await usuarioService.login(email, senha);
        
        if (!usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Credenciais inválidas",
            });
        }
        return res.status(200).json(usuario);
    } catch (erro) {
        return next(erro);
    }
}

async function logout(req, res, next) {
    try {
        // O middleware autenticar já validou o token e o guardou em req.token
        usuarioService.logout(req.token);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Logout realizado com sucesso",
        });
    } catch (erro) {
        return next(erro);
    }
}

module.exports = {
  login: login,
  logout: logout
};
