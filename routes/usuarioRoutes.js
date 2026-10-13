// routes/usuarioRoutes.js — Rotas de autenticação de usuários

const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");
const { autenticar } = require("../middlewares/authMiddleware");

router.post("/login", usuarioController.login);

// Só revoga um token válido
router.post("/logout", autenticar, usuarioController.logout);

module.exports = router;
