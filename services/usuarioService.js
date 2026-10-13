// services/usuarioService.js — Lógica de negócio do recurso Usuários

const usuarioDAO = require("../dao/usuarioDAO");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blacklist = new Set(); // Conjunto para armazenar tokens revogados

function logout(token) {
  blacklist.add(token);
}

function isTokenRevoked(token) {
  return blacklist.has(token);
}

function semSenha(usuario) {
  if (!usuario) {
    return usuario;
  }
  //remove a senha do vetor de dados retornado para não expor a senha do usuário
  const { senha, ...resto } = usuario;
  return resto;
}

function buscarTodos() {
  return usuarioDAO.buscarTodos().map(semSenha);
}

function buscarPorId(id) {
  return semSenha(usuarioDAO.buscarPorId(id));
}

function criar(dados) {
  const novoUsuario = {
    nome: dados.nome,
    email: dados.email,
    role: dados.role,
    senha: bcrypt.hashSync(dados.senha, 10),
  };

  return semSenha(usuarioDAO.inserir(novoUsuario));
}

function atualizar(id, dados) {
  const usuarioExistente = usuarioDAO.buscarPorId(id);

  if (!usuarioExistente) {
    return null;
  }

  const dadosAtualizados = {
    nome: dados.nome || usuarioExistente.nome,
    email: dados.email || usuarioExistente.email,
    role: dados.role || usuarioExistente.role,
    senha: dados.senha ? bcrypt.hashSync(dados.senha, 10) : usuarioExistente.senha,
  };

  return semSenha(usuarioDAO.atualizar(id, dadosAtualizados));
}

function remover(id) {
  const usuarioExistente = usuarioDAO.buscarPorId(id);

  if (!usuarioExistente) {
    return null;
  }

  return semSenha(usuarioDAO.remover(id));
}

async function login(email, senha) {
  const usuario = await usuarioDAO.buscarPorEmail(email);

    if (!usuario) {
        return null;
    }

    const senhaValida = bcrypt.compareSync(senha, usuario.senha);

    if (!senhaValida) {
        return null;
    }

    const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    return { ...semSenha(usuario), token };
}  

module.exports = {
  buscarTodos: buscarTodos,
  buscarPorId: buscarPorId,
  criar: criar,
  atualizar: atualizar,
  remover: remover,
  login: login,
  logout: logout,
  isTokenRevoked: isTokenRevoked
};