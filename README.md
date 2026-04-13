# Multiplan Ofertas

Plataforma de ofertas para shoppings Multiplan.  
Lojistas criam e gerenciam ofertas; compradores navegam o feed e registram interesse em tempo real.

## Stack

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| Banco de dados | MongoDB 7 (Docker) | 27017 |
| API | NestJS 11 | 3000 |
| Frontend | React 19 + Vite | 5173 |
| Tempo real | Socket.IO (mesmo servidor da API) | 3000 |

## Pré-requisitos

- **Node.js** v20+
- **npm** v10+
- **Docker** e **Docker Compose** (para o MongoDB)

## Como rodar

### 1. Subir o MongoDB

```bash
cd ofertas-api
docker-compose up -d
```

### 2. Iniciar o backend

```bash
cd ofertas-api
npm install
npm run start:dev
```

A API sobe em **http://localhost:3000**. Swagger em **http://localhost:3000/api**.

### 3. (Opcional) Popular o banco com dados de teste

Em outro terminal, ainda dentro de `ofertas-api/`:

```bash
npm run seed
```

Cria um lojista, um comprador e 5 ofertas. Idempotente — rodar de novo não duplica.

### 4. Iniciar o frontend

```bash
cd frontend
npm install
npm run dev
```

O app sobe em **http://localhost:5173**.

> Os arquivos `.env` já estão configurados com valores padrão de desenvolvimento.

## Credenciais de teste

Geradas por `npm run seed`.

| Role      | E-mail                | Senha    |
|-----------|-----------------------|----------|
| Lojista   | `lojista@email.com`   | `123456` |
| Comprador | `comprador@email.com` | `123456` |

## Scripts úteis

**Backend (`ofertas-api/`)**

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Inicia em modo watch |
| `npm run seed` | Popula o banco com dados de teste |
| `npm run test` | Testes unitários |
| `npm run lint` | Lint + auto-fix |

**Frontend (`frontend/`)**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server com HMR |
| `npm run build` | Build de produção |
| `npm run lint` | Lint |

## Decisões técnicas

**MongoDB + Mongoose.** Flexibilidade de schema e uso do server em memoria para simular os testes. Tradeoff: nao mantem toda integridade e relacionamentos que teria o banco relacional.

**JWT access + refresh com role no token** Mantem a sessao por mais tempo, garantindo segurança do acess token curto, usar a role do payload do token evita que precise consultar o DB no Guard de autenticação, melhorando performance. Tradeoff: caso saia, revogue ou mude a role de um usuario, o token desatualizado dura 15minutos vivo. Futuramente precisaria de um blacklist de tokens, num cache talvez.

**`interestCount` nas offers** O contador sobe conforme decrementa o estoque, em uma única query. Impossível divergir — e evita um N+1 na listagem do lojista.

**Status `sold_out` separado de `inactive` e `expired`.** Separa os status, deixando mais claro o que aconteceu com cada oferta, tambem possibilita diferentes filtros.

**Paginação com `hasNext`.** Em vez de um `countDocuments` extra, o repositório busca `limit + 1` itens — se veio o extra, `hasNext = true` e ele é descartado antes de devolver. Uma query só, contrato `{ items, hasNext, page, limit }`. Tradeoff: o frontend não mostra "Página X de Y", só "Anterior / Próxima".

**Cron para expiração.** `@Cron(EVERY_MINUTE)` marca como `expired`. Alternativa seria TTL index ou checar lazy na leitura — o cron mantém o status consistente no banco, com delay de até 1 min.

**Seed via `createApplicationContext`.** Boota o DI do Nest sem subir HTTP/WS, reaproveitando repositórios e `bcrypt`. Idempotente via `findOne({ email })` — sem `SeedModule` dedicado.

**WebSocket sem auth no handshake.** MVP — em produção seria necessário validar o JWT na conexão.

**Tokens no `localStorage`.** Pragmático pro teste técnico. HttpOnly cookies seriam mais seguros mas complicam CORS/refresh.

**Refresh proativo no axios.** O interceptor decodifica o JWT e renova antes de expirar; fila única (`refreshInFlight`) evita chamadas duplicadas ao `/auth/refresh` em requisições paralelas.

**Sem testes no frontend.** Prioridade foi cobrir backend (services/repositories). Em cenário real, adicionaria Vitest + Testing Library nos fluxos críticos.
