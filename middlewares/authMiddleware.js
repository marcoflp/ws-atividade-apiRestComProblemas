const jwt = require("jsonwebtoken");
const usuarioService = require("../services/usuarioService");

function autenticar(req, res, next) {
  const header = req.headers["authorization"]; //Bearer <token>
  const token = header && header.split(" ")[1]; //<token>
  
  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token não fornecido",
    });
  }
  
  if (usuarioService.isTokenRevoked(token)) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token revogado",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (!decoded) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Token inválido",
      });
    }
    req.user = decoded;
    req.token = token; // usado no logout

    return next();

  } catch (erro) {
    if (erro.name === "TokenExpiredError") {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token expirado",
      });
    }
    return res.status(403).json({
      sucesso: false,
      mensagem: "Token inválido",
    });
  }
}

module.exports = { autenticar };
