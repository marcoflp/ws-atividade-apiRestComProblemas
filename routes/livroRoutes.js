// routes/livroRoutes.js — Definição das rotas do recurso "Livros"

const express = require("express");
const router = express.Router();

const livroController = require("../controllers/livroController");

// =============================================
// Definição das Rotas
// =============================================

// Lista todos os livros
// ERRO 1: a rota era GET /livros/getLivros (verbo na URL)
// CORREÇÃO: URL REST representa o recurso, não a ação. O verbo já é o método HTTP -> GET /livros
router.get("/", livroController.listar);

// Busca um livro específico pelo identificador
router.get("/:id", livroController.buscarPorId);

// Resumo de um livro
router.get("/:id/resumo", livroController.buscarResumo);

// Cria um novo livro
// ERRO 2: a rota era GET /livros/novo para criar um livro
// CORREÇÃO: GET é só leitura. Criar recurso é POST -> POST /livros
router.post("/", livroController.criar);

// Atualiza um livro existente
// ERRO 3: a rota era PUT /livros e o id vinha no body
// CORREÇÃO: o recurso a ser atualizado é identificado na URL -> PUT /livros/:id
router.put("/:id", livroController.atualizar);

// Remove um livro específico
// ERRO 4: a rota era DELETE /livros e apagava TODOS os livros
// CORREÇÃO: DELETE remove um recurso específico identificado na URL -> DELETE /livros/:id
router.delete("/:id", livroController.remover);

module.exports = router;
