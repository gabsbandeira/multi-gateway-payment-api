# Multi-Gateway Payment API

REST API para processamento de pagamentos com suporte a múltiplos gateways e estratégia de fallback automático. Construída com AdonisJS v7 e TypeScript.

---

## Tecnologias

- **[AdonisJS v7](https://adonisjs.com/)** — framework Node.js
- **[TypeScript](https://www.typescriptlang.org/)**
- **[MySQL 8](https://www.mysql.com/)** — banco de dados
- **[Lucid ORM](https://lucid.adonisjs.com/)** — ORM para gestão do banco
- **[VineJS](https://vinejs.dev/)** — validação de dados
- **[Docker](https://www.docker.com/)** — containerização

---

## Requisitos

- [Docker](https://www.docker.com/) e Docker Compose

---

## Instalação e execução

1. Clone o repositório:

```bash
git clone https://github.com/gabsbandeira/multi-gateway-payment-api
cd multi-gateway-payment-api
```

2. Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

3. Suba os containers:

```bash
docker-compose up --build
```

A API estará disponível em `http://localhost:3333`.

O Docker irá automaticamente:

- Subir o banco MySQL
- Subir o mock dos gateways de pagamento (portas 3001 e 3002)
- Rodar as migrations
- Popular o banco com dados iniciais (seeders)
- Iniciar a aplicação

---

## Dados iniciais (Seeders)

Ao subir a aplicação com Docker, o banco é populado automaticamente com:

| Tipo     | Dado                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| Usuário  | `user@test.com` / senha: `test1234`                                                               |
| Clientes | Tony Stark, Bruce Wayne                                                                           |
| Produtos | Televisão (R$100), Geladeira (R$200), Microondas (R$300), Fogão (R$400), Máquina de Lavar (R$500) |
| Gateways | Gateway1 (prioridade 1), Gateway2 (prioridade 2)                                                  |

---

## Arquitetura de Pagamentos

A API utiliza dois gateways de pagamento com fallback automático:

1. A cobrança é tentada no **Gateway1** (maior prioridade)
2. Se o Gateway1 falhar, a cobrança é tentada no **Gateway2**
3. Se ambos falharem, a transação é salva com status `failed`

Os gateways podem ser ativados/desativados e ter suas prioridades alteradas via API.

---

## Estrutura do Projeto

```
multi-gateway-payment-api/
├── app/
│   ├── controllers/        # Controladores das rotas
│   ├── gateways/           # Serviços de integração com os gateways (Gateway1, Gateway2)
│   ├── middleware/         # Middlewares (autenticação, JSON response)
│   ├── models/             # Models do Lucid ORM
│   ├── services/           # Lógica de negócio (ex: PaymentService com fallback)
│   └── validators/         # Schemas de validação com VineJS
├── database/
│   ├── migrations/         # Migrations do banco de dados
│   └── seeders/            # Dados iniciais para desenvolvimento
├── start/
│   └── routes.ts           # Definição das rotas
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## Autenticação

Todas as rotas, exceto `signup` e `login`, exigem autenticação via **Bearer Token**.

Após o login, inclua o token no header de todas as requisições:

```
Authorization: Bearer <token>
```

---

## Rotas

### Auth

#### POST `/api/v1/auth/signup`

Cria um novo usuário.

**Body:**

```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Resposta (201):**

```json
{
  "message": "Usuário criado com sucesso",
  "data": {
    "user": { "id": 1, "email": "usuario@email.com" },
    "token": "oat_..."
  }
}
```

---

#### POST `/api/v1/auth/login`

Autentica um usuário e retorna o token de acesso.

**Body:**

```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Resposta (200):**

```json
{
  "message": "Login realizado com sucesso",
  "data": {
    "user": { "id": 1, "email": "usuario@email.com" },
    "token": "oat_..."
  }
}
```

---

#### POST `/api/v1/auth/logout` `autenticado`

Invalida o token atual.

**Resposta (200):**

```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### Clientes `autenticado`

#### GET `/api/v1/clients`

Lista todos os clientes.

**Resposta (200):**

```json
{
  "message": "Clientes listados com sucesso",
  "data": [
    { "id": 1, "name": "Tony Stark", "email": "tony@email.com" },
    { "id": 2, "name": "Bruce Wayne", "email": "bruce@email.com" }
  ]
}
```

---

#### GET `/api/v1/clients/:id`

Retorna um cliente pelo ID com seu histórico de transações.

**Resposta (200):**

```json
{
  "message": "Cliente encontrado com sucesso",
  "data": {
    "id": 1,
    "name": "Tony Stark",
    "email": "tony@email.com",
    "transactions": [
      {
        "id": 1,
        "status": "paid",
        "amount": 500,
        "externalId": "id-retornado-pelo-gateway",
        "cardLastNumbers": "6063",
        "createdAt": "2026-03-15T00:00:00.000Z",
        "gateway": { "id": 1, "name": "Gateway1" },
        "products": [
          { "id": 1, "name": "Televisão", "amount": 100, "quantity": 2 },
          { "id": 3, "name": "Microondas", "amount": 300, "quantity": 1 }
        ]
      }
    ]
  }
}
```

**Resposta (404):**

```json
{
  "message": "Cliente não encontrado"
}
```

---

#### POST `/api/v1/clients`

Cria um novo cliente.

**Body:**

```json
{
  "name": "Clark Kent",
  "email": "clark@email.com"
}
```

**Resposta (201):**

```json
{
  "message": "Cliente criado com sucesso",
  "data": { "id": 3, "name": "Clark Kent", "email": "clark@email.com" }
}
```

---

#### PUT `/api/v1/clients/:id`

Atualiza os dados de um cliente.

**Body:**

```json
{
  "name": "Homem de Ferro",
  "email": "tony@email.com"
}
```

**Resposta (200):**

```json
{
  "message": "Cliente atualizado com sucesso",
  "data": { "id": 1, "name": "Homem de Ferro", "email": "tony@email.com" }
}
```

---

#### DELETE `/api/v1/clients/:id`

Remove um cliente.

**Resposta (200):**

```json
{
  "message": "Cliente removido com sucesso"
}
```

---

### Produtos `autenticado`

#### GET `/api/v1/products`

Lista todos os produtos.

**Resposta (200):**

```json
{
  "message": "Produtos listados com sucesso",
  "data": [
    { "id": 1, "name": "Televisão", "amount": 100 },
    { "id": 2, "name": "Geladeira", "amount": 200 },
    { "id": 3, "name": "Microondas", "amount": 300 },
    { "id": 4, "name": "Fogão", "amount": 400 },
    { "id": 5, "name": "Máquina de Lavar", "amount": 500 }
  ]
}
```

---

#### GET `/api/v1/products/:id`

Retorna um produto pelo ID.

**Resposta (200):**

```json
{
  "message": "Produto encontrado com sucesso",
  "data": { "id": 1, "name": "Televisão", "amount": 100 }
}
```

**Resposta (404):**

```json
{
  "message": "Produto não encontrado"
}
```

---

#### POST `/api/v1/products`

Cria um novo produto.

**Body:**

```json
{
  "name": "Notebook",
  "amount": 600
}
```

**Resposta (201):**

```json
{
  "message": "Produto criado com sucesso",
  "data": { "id": 6, "name": "Notebook", "amount": 600 }
}
```

---

#### PUT `/api/v1/products/:id`

Atualiza um produto.

**Body:**

```json
{
  "name": "Televisão 4K",
  "amount": 150
}
```

**Resposta (200):**

```json
{
  "message": "Produto atualizado com sucesso",
  "data": { "id": 1, "name": "Televisão 4K", "amount": 150 }
}
```

---

#### DELETE `/api/v1/products/:id`

Remove um produto.

**Resposta (200):**

```json
{
  "message": "Produto removido com sucesso"
}
```

---

### Transações `autenticado`

#### GET `/api/v1/transactions`

Lista todas as transações com cliente e gateway utilizados.

**Resposta (200):**

```json
{
  "message": "Transações listadas com sucesso",
  "data": [
    {
      "id": 1,
      "status": "paid",
      "amount": 500,
      "externalId": "id-retornado-pelo-gateway",
      "createdAt": "2026-03-15T00:00:00.000Z",
      "client": { "id": 1, "name": "Tony Stark", "email": "tony@email.com" },
      "gateway": { "id": 1, "name": "Gateway1" }
    }
  ]
}
```

---

#### GET `/api/v1/transactions/:id`

Retorna uma transação pelo ID com detalhes dos produtos.

**Resposta (200):**

```json
{
  "message": "Transação encontrada com sucesso",
  "data": {
    "id": 1,
    "status": "paid",
    "amount": 500,
    "externalId": "id-retornado-pelo-gateway",
    "cardLastNumbers": "6063",
    "createdAt": "2026-03-15T00:00:00.000Z",
    "client": { "id": 1, "name": "Tony Stark", "email": "tony@email.com" },
    "gateway": { "id": 1, "name": "Gateway1" },
    "products": [
      { "productId": 1, "quantity": 2 },
      { "productId": 3, "quantity": 1 }
    ]
  }
}
```

**Resposta (404):**

```json
{
  "message": "Transação não encontrada"
}
```

---

#### POST `/api/v1/transactions`

Cria uma nova transação e processa o pagamento.

**Body:**

```json
{
  "clientId": 1,
  "cardNumber": "5569000000006063",
  "cvv": "431",
  "products": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

**Resposta (201):**

```json
{
  "message": "Transação criada com sucesso",
  "data": {
    "id": 1,
    "status": "paid",
    "amount": 500,
    "externalId": "id-retornado-pelo-gateway",
    "cardLastNumbers": "6063",
    "createdAt": "2026-03-15T00:00:00.000Z",
    "client": { "id": 1, "name": "Tony Stark", "email": "tony@email.com" },
    "gateway": { "id": 1, "name": "Gateway1" },
    "products": [
      { "id": 1, "name": "Televisão", "amount": 100, "quantity": 2 },
      { "id": 3, "name": "Microondas", "amount": 300, "quantity": 1 }
    ]
  }
}
```

> O valor total é calculado automaticamente com base nos preços dos produtos e quantidades informadas.

> Se todos os gateways falharem, a transação é salva com `"status": "failed"`, `"externalId": null` e `"gateway": null`.

---

#### POST `/api/v1/transactions/:id/refund`

Realiza o reembolso de uma transação.

**Resposta (200):**

```json
{
  "message": "Reembolso realizado com sucesso",
  "data": {
    "id": 1,
    "status": "refunded",
    "amount": 500,
    "externalId": "id-retornado-pelo-gateway",
    "cardLastNumbers": "6063",
    "clientId": 1
  }
}
```

**Possíveis erros:**

| Status | Mensagem                                                 |
| ------ | -------------------------------------------------------- |
| 404    | `"Transação não encontrada"`                             |
| 400    | `"Transação já foi reembolsada"`                         |
| 400    | `"Transação não pode ser reembolsada"` (status `failed`) |

---

#### DELETE `/api/v1/transactions/:id`

Remove uma transação.

**Resposta (200):**

```json
{
  "message": "Transação removida com sucesso"
}
```

---

### Gateways `autenticado`

#### PATCH `/api/v1/gateways/:id/toggle`

Ativa ou desativa um gateway.

**Resposta (200):**

```json
{
  "message": "Gateway ativado com sucesso",
  "data": {
    "id": 1,
    "name": "Gateway1",
    "isActive": true,
    "priority": 1
  }
}
```

---

#### PATCH `/api/v1/gateways/:id/priority`

Atualiza a prioridade de um gateway. Gateways com menor valor de prioridade são utilizados primeiro.

**Body:**

```json
{
  "priority": 2
}
```

**Resposta (200):**

```json
{
  "message": "Prioridade do gateway atualizada com sucesso",
  "data": {
    "id": 1,
    "name": "Gateway1",
    "isActive": true,
    "priority": 2
  }
}
```

---

## Variáveis de Ambiente

| Variável               | Descrição                  | Exemplo                            |
| ---------------------- | -------------------------- | ---------------------------------- |
| `PORT`                 | Porta da aplicação         | `3333`                             |
| `HOST`                 | Host da aplicação          | `localhost`                        |
| `NODE_ENV`             | Ambiente                   | `development`                      |
| `APP_KEY`              | Chave secreta da aplicação | gerada via `node ace generate:key` |
| `APP_URL`              | URL base da aplicação      | `http://localhost:3333`            |
| `SESSION_DRIVER`       | Driver de sessão           | `cookie`                           |
| `DB_CONNECTION`        | Tipo de banco              | `mysql`                            |
| `MYSQL_HOST`           | Host do MySQL              | `127.0.0.1`                        |
| `MYSQL_PORT`           | Porta do MySQL             | `3306`                             |
| `MYSQL_USER`           | Usuário do MySQL           | `payment_user`                     |
| `MYSQL_PASSWORD`       | Senha do MySQL             | —                                  |
| `MYSQL_DB_NAME`        | Nome do banco              | `payment_db`                       |
| `GATEWAY1_URL`         | URL do Gateway 1           | `http://localhost:3001`            |
| `GATEWAY1_EMAIL`       | Email do Gateway 1         | —                                  |
| `GATEWAY1_TOKEN`       | Token do Gateway 1         | —                                  |
| `GATEWAY2_URL`         | URL do Gateway 2           | `http://localhost:3002`            |
| `GATEWAY2_AUTH_TOKEN`  | Token do Gateway 2         | —                                  |
| `GATEWAY2_AUTH_SECRET` | Secret do Gateway 2        | —                                  |
