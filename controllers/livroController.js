// controllers/livroController.js — Orquestração das requisições de Livros

const livroService = require("../services/livroService");
// ERRO 5: o controller importava o livroDAO e acessava os dados direto
// CORREÇÃO: na arquitetura RCS o Controller NUNCA acessa o DAO, sempre chama o Service

// =============================================
// Listar todos os livros
// =============================================
function listar(req, res, next) {
  try {
    const livros = livroService.buscarTodos();
    return res.status(200).json(livros);
  } catch (erro) {
    return next(erro);
  }
}

// =============================================
// Buscar um livro por ID
// =============================================
function buscarPorId(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const livro = livroService.buscarPorId(id);

    // ERRO 6: retornava status 200 com {} quando o livro não existia
    // CORREÇÃO: recurso inexistente é 404 Not Found
    if (!livro) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Livro não encontrado",
      });
    }

    return res.status(200).json(livro);
  } catch (erro) {
    return next(erro);
  }
}

// =============================================
// Criar um novo livro
// =============================================
function criar(req, res, next) {
  try {
    const dados = req.body;

    if (!dados.titulo || !dados.autor || dados.preco === undefined) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Os campos 'titulo', 'autor' e 'preco' são obrigatórios",
      });
    }

    const novoLivro = livroService.criar(dados);

    // ERRO 7: retornava status 200 ao criar um livro
    // CORREÇÃO: criação bem-sucedida é 201 Created
    return res.status(201).json(novoLivro);
  } catch (erro) {
    return next(erro);
  }
}

// =============================================
// Atualizar um livro existente
// =============================================
function atualizar(req, res, next) {
  try {
    // ERRO 3: o id era lido do body (req.body.id)
    // CORREÇÃO: o id vem da URL (req.params.id)
    const id = parseInt(req.params.id);
    const dados = req.body;

    const livroAtualizado = livroService.atualizar(id, dados);

    if (!livroAtualizado) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Livro com id " + id + " não encontrado para atualização",
      });
    }

    return res.status(200).json(livroAtualizado);
  } catch (erro) {
    return next(erro);
  }
}

// =============================================
// Remover um livro
// =============================================
function remover(req, res, next) {
  try {
    // ERRO 4 e 5: chamava livroDAO.limparTudo() direto e apagava tudo
    // CORREÇÃO: remove só o livro do id, passando pelo Service, e responde 204 No Content
    const id = parseInt(req.params.id);
    const removido = livroService.remover(id);

    if (!removido) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Livro com id " + id + " não encontrado para remoção",
      });
    }

    return res.status(204).send();
  } catch (erro) {
    return next(erro);
  }
}

// =============================================
// Buscar resumo de um livro
// =============================================
function buscarResumo(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const livro = livroService.buscarPorId(id);

    if (!livro) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Livro não encontrado",
      });
    }

    // ERRO EXTRA: o resumo era enviado como texto plano ("titulo: X, autor: Y...")
    // CORREÇÃO: dados da API são representados em JSON
    return res.status(200).json({
      titulo: livro.titulo,
      autor: livro.autor,
      preco: livro.preco,
    });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = {
  listar: listar,
  buscarPorId: buscarPorId,
  criar: criar,
  atualizar: atualizar,
  remover: remover,
  buscarResumo: buscarResumo,
};
