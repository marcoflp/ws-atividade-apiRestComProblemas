# API de Livros — Detetive de APIs + Autenticação JWT

**Disciplina:** Serviços Web — IFSul Campus Passo Fundo
**Professor:** Élder F. F. Bernardi
**Aluno:** Marco

Fork da atividade [Detetive de APIs](https://github.com/elderbernardiifsul/ws-atividade-apiRestComProblemas). Este repositório contém duas entregas:

1. **Correção dos 7 erros estruturais** de REST e da arquitetura RCS da API original.
2. **Autenticação JWT**, com login, rotas protegidas e logout com blacklist de tokens.

---

## Como executar

```bash
npm install
cp .env.example .env   # defina um JWT_SECRET aleatório
npm start
```

A API sobe em `http://localhost:3000`.

| Variável | Uso | Exemplo |
|---|---|---|
| `JWT_SECRET` | Chave que assina e verifica os tokens | uma string longa e aleatória |
| `JWT_EXPIRES_IN` | Validade do token, **com unidade** | `30m`, `1h` |

> Sem unidade, o valor é lido em milissegundos: `JWT_EXPIRES_IN=30` gera um token que já nasce expirado.

---

## Estrutura

```
├── app.js                          ← Ponto de entrada: dotenv, montagem das rotas
├── routes/
│   ├── livroRoutes.js              ← Rotas de livros (todas protegidas)
│   └── usuarioRoutes.js            ← Login e logout
├── middlewares/
│   ├── authMiddleware.js           ← Verificação do JWT e da blacklist
│   └── errorHandler.js             ← Tratamento centralizado de erros
├── controllers/
│   ├── livroController.js          ← Orquestração req/res de livros
│   └── usuarioController.js        ← Orquestração req/res de login/logout
├── services/
│   ├── livroService.js             ← Regras de negócio de livros
│   └── usuarioService.js           ← bcrypt, emissão de token, blacklist
└── dao/
    ├── livroDAO.js                 ← Dados de livros (memória)
    └── usuarioDAO.js               ← Dados de usuários (memória, senhas em hash)
```

---

## Parte 1 — Os 7 erros corrigidos

Cada correção está marcada no código com um comentário `ERRO N` / `CORREÇÃO`.

| # | Camada | Era | Ficou | Princípio violado |
|---|---|---|---|---|
| 1 | Routes | `GET /livros/getLivros` | `GET /livros` | A URL identifica o **recurso**, não a ação. O verbo é o método HTTP. |
| 2 | Routes | `GET /livros/novo` para criar | `POST /livros` | `GET` é só leitura. Criar um recurso é `POST`. |
| 3 | Routes + Controller | `PUT /livros` com o id no body | `PUT /livros/:id` | O recurso a ser alterado é identificado na URL, não no corpo. |
| 4 | Routes | `DELETE /livros` apagava **todos** os livros | `DELETE /livros/:id` | `DELETE` remove um recurso específico. |
| 5 | Controller | Controller importava o DAO e chamava `limparTudo()` | Controller chama `livroService.remover(id)` | Na arquitetura RCS, o Controller **nunca** acessa o DAO, sempre passa pelo Service. |
| 6 | Controller | Livro inexistente retornava `200` com `{}` | `404 Not Found` com mensagem em JSON | O status code deve refletir o resultado. Recurso inexistente é `404`. |
| 7 | Controller | Criação retornava `200` | `201 Created` | Criação bem-sucedida é `201`. |
| + | Controller | `/livros/:id/resumo` respondia texto plano | Resposta em JSON | A representação dos recursos na API é JSON. |

Além disso, a remoção passou a responder `204 No Content` no sucesso e `404` quando o id não existe.

---

## Parte 2 — Autenticação JWT

### Fluxo de uma requisição

```
Requisição → Router → authMiddleware → Controller → Service → DAO
                          │
                          ├─ sem token ............ 401
                          ├─ token na blacklist ... 401
                          ├─ token expirado ....... 401
                          ├─ assinatura inválida .. 403
                          └─ válido → req.user = { id, role } → next()
```

O middleware fica **entre o Router e o Controller**, como na seção 8.3 do material. A regra de negócio (bcrypt, `jwt.sign`, blacklist) fica no **Service**, e o Controller só trata `req`/`res`.

### Rotas

| Método | Rota | Acesso | Respostas |
|---|---|---|---|
| `POST` | `/usuarios/login` | Público | `200` usuário + `token` · `400` faltou email/senha · `401` credenciais inválidas |
| `POST` | `/usuarios/logout` | Token válido | `200` token revogado |
| `GET` | `/livros`, `/livros/:id`, `/livros/:id/resumo` | Token válido | |
| `POST` | `/livros` | Token válido | |
| `PUT` | `/livros/:id` | Token válido | |
| `DELETE` | `/livros/:id` | Token válido | |

O token vai no header `Authorization: Bearer <token>`.

### Usuários de teste

| Email | Senha | Role |
|---|---|---|
| `marco@example.com` | `123456` | admin |
| `maria@example.com` | `123456` | user |
| `joao@example.com` | `123456` | user |

### Decisões de segurança

- **Senhas em hash bcrypt.** O `usuarioDAO` nunca guarda a senha em texto puro, e o login compara com `bcrypt.compare`.
- **A senha nunca sai do Service.** A função `semSenha` cria uma cópia do usuário sem o campo `senha` antes de devolvê-lo. É uma cópia, e não um `delete`, para não apagar o hash guardado no DAO.
- **Mensagem de erro genérica no login.** Email inexistente e senha errada respondem igual (`Credenciais inválidas`), para não revelar quais emails estão cadastrados.
- **Payload mínimo.** O token carrega só `id` e `role`, nada sensível, já que o payload é apenas codificado em Base64URL.
- **Algoritmo fixo.** O `jwt.verify` aceita só `HS256`, o que rejeita tokens com `alg: none`.
- **Segredo fora do código.** O `JWT_SECRET` vem do `.env`, que está no `.gitignore`.

### Logout e blacklist

Por ser stateless, um JWT continua válido até expirar, mesmo depois do logout. Para resolver isso:

1. `POST /usuarios/logout` passa pelo middleware (só um token válido pode ser revogado) e adiciona o token a um `Set` no `usuarioService`.
2. O middleware consulta esse `Set` **antes** de verificar a assinatura. Um token revogado recebe `401 Token revogado`.

**Limitações conhecidas** (aceitáveis no escopo acadêmico, segundo a seção 9.3 do material):
- A blacklist fica em memória: é perdida quando o servidor reinicia e não é compartilhada entre instâncias. Em produção, seria Redis ou uma tabela no banco.
- Os tokens expirados não são removidos do `Set`.
- A `role` vai no token, mas nenhuma rota restringe o acesso por papel.

---

## Testando

```bash
# 1. Sem token → 401
curl -i http://localhost:3000/livros

# 2. Login, copie o token da resposta
curl -i -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marco@example.com","senha":"123456"}'

TOKEN="cole_o_token_aqui"

# 3. Com token → 200
curl -i http://localhost:3000/livros -H "Authorization: Bearer $TOKEN"

# 4. Logout → 200
curl -i -X POST http://localhost:3000/usuarios/logout -H "Authorization: Bearer $TOKEN"

# 5. Mesmo token depois do logout → 401 Token revogado
curl -i http://localhost:3000/livros -H "Authorization: Bearer $TOKEN"
```

No Postman, use a aba Authorization → Bearer Token.
