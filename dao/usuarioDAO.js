// dao/usuarioDAO.js — Camada de acesso a dados (persistência em memória)

// =============================================
// Base de dados simulada (persistência em memória)
// =============================================
// Senhas armazenadas como hash bcrypt (nunca em texto puro). Senha de todos: 123456

let usuarios = [
  { id: 1, nome: "Marco", email: "marco@example.com", role: "admin", senha: "$2b$10$BT04Kf8qHeF5XzOtLkGc5eKtGpMPPZwGZu8bRWEV9fnBxW8366j4S" },
  { id: 2, nome: "Maria", email: "maria@example.com", role: "user", senha: "$2b$10$BT04Kf8qHeF5XzOtLkGc5eKtGpMPPZwGZu8bRWEV9fnBxW8366j4S" },
  { id: 3, nome: "João", email: "joao@example.com", role: "user", senha: "$2b$10$BT04Kf8qHeF5XzOtLkGc5eKtGpMPPZwGZu8bRWEV9fnBxW8366j4S" },
];

let proximoId = 4;

// =============================================
// Operações de Acesso a Dados
// =============================================

function buscarTodos() {
  return usuarios;
}

function buscarPorId(id) {
  return usuarios.find(function (usuario) {
    return usuario.id === id;
  });
}

function buscarPorEmail(email) {
  return usuarios.find(function (usuario) {
    return usuario.email === email;
  });
}

function inserir(usuario) {
  const novoUsuario = {
    id: proximoId,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    senha: usuario.senha,
  };

  proximoId = proximoId + 1;
  usuarios.push(novoUsuario);

  return novoUsuario;
}

function atualizar(id, dadosAtualizados) {
  const indice = usuarios.findIndex(function (usuario) {
    return usuario.id === id;
  });

  if (indice === -1) {
    return null;
  }

  usuarios[indice] = {
    id: id,
    nome: dadosAtualizados.nome,
    email: dadosAtualizados.email,
    role: dadosAtualizados.role,
    senha: dadosAtualizados.senha,
  };

  return usuarios[indice];
}

function remover(id) {
  const indice = usuarios.findIndex(function (usuario) {
    return usuario.id === id;
  });

  if (indice === -1) {
    return null;
  }

  const removido = usuarios.splice(indice, 1);
  return removido[0];
}

module.exports = {
  buscarTodos: buscarTodos,
  buscarPorId: buscarPorId,
  buscarPorEmail: buscarPorEmail,
  inserir: inserir,
  atualizar: atualizar,
  remover: remover,
};
