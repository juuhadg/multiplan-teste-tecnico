# Multiplan Ofertas

Plataforma de ofertas para shoppings Multiplan.  
Lojistas criam e gerenciam ofertas; compradores navegam o feed e registram interesse em tempo real.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Credenciais de teste](#credenciais-de-teste)
- [Scripts úteis](#scripts-úteis)
- [Decisões técnicas e tradeoffs](#decisões-técnicas-e-tradeoffs)

---

## Arquitetura

```
multiplan-teste-tecnico/
├── ofertas-api/          # Backend — NestJS + MongoDB + Socket.IO
│   ├── src/
│   │   ├── auth/         # Registro, login, refresh token (JWT)
│   │   ├── users/        # Schema e repositório de usuários
│   │   ├── offers/       # CRUD de ofertas, gateway WS, cron de expiração
│   │   └── interests/    # Registro de interesse (comprador → oferta)
│   └── docker-compose.yml
│
└── frontend/             # Frontend — React + Vite + Tailwind
    └── src/
        ├── api/          # Client axios com refresh token proativo
        ├── auth/         # AuthContext, ProtectedRoute
        ├── pages/        # Login, Register, LojistaDashboard, CompradorFeed
        ├── components/   # Layout, OfferCard, OfferForm, NewOfferToast
        └── hooks/        # useSocket (Socket.IO client)
```

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| Banco de dados | MongoDB 7 (Docker) | 27017 |
| API | NestJS 11 | 3000 |
| Frontend | React 19 + Vite | 5173 |
| Tempo real | Socket.IO (mesmo servidor da API) | 3000 |

---

## Pré-requisitos

- **Node.js** v20+
- **npm** v10+
- **Docker** e **Docker Compose** (para o MongoDB)

---

## Como rodar

### 1. Subir o MongoDB

```bash
cd ofertas-api
docker-compose up -d
```

Isso cria um container `mongo-offers-db` na porta **27017**.

### 2. Iniciar o backend

```bash
cd ofertas-api
npm install
npm run start:dev
```

A API sobe em **http://localhost:3000**.  
O Swagger fica disponível em **http://localhost:3000/api**.

### 3. (Opcional) Popular o banco com dados de teste

Em outro terminal, ainda dentro de `ofertas-api/`:

```bash
npm run seed
```

Cria um lojista, um comprador e 5 ofertas ativas com validades variadas.  
O comando é **idempotente**: rodar de novo não duplica nada — se o usuário seed já existe, pula e loga uma mensagem.

Veja as credenciais geradas em [Credenciais de teste](#credenciais-de-teste).

### 4. Iniciar o frontend

```bash
cd frontend
npm install
npm run dev
```

O app sobe em **http://localhost:5173**.

> Os arquivos `.env` já estão configurados com valores padrão de desenvolvimento.  
> Caso necessário, consulte `.env.example` em cada pasta para referência.

---

## Credenciais de teste

Geradas por `npm run seed` (ver [passo 3](#3-opcional-popular-o-banco-com-dados-de-teste)).

| Role      | E-mail                | Senha    |
|-----------|-----------------------|----------|
| Lojista   | `lojista@email.com`   | `123456` |
| Comprador | `comprador@email.com` | `123456` |

Com o lojista você publica/edita ofertas e vê o contador de interessados subindo em tempo real. Com o comprador você vê o feed, registra interesse e recebe notificações push via WebSocket quando novas ofertas são publicadas.

---

## Scripts úteis

### Backend (`ofertas-api/`)

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Inicia em modo watch |
| `npm run seed` | Popula o banco com usuários e ofertas de teste (idempotente) |
| `npm run test` | Testes unitários (Jest + MongoDB in-memory) |
| `npm run test:cov` | Testes com relatório de cobertura |
| `npm run lint` | Lint + auto-fix |

### Frontend (`frontend/`)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server com HMR |
| `npm run build` | Build de produção |
| `npm run lint` | Lint |

---

## Decisões técnicas e tradeoffs

### Backend

#### MongoDB + Mongoose (vs SQL + TypeORM/Prisma)

Escolhi MongoDB pela flexibilidade de schema e rapidez de iteração em um protótipo. Ofertas podem evoluir com campos variáveis sem migrações. O tradeoff é a perda de integridade referencial nativa — integridade de dados entre ofertas, interesses e usuários depende da lógica da aplicação.

#### Repositórios como camada de abstração

Cada módulo tem um `Repository` que encapsula as queries Mongoose. Isso isola o Service da implementação de persistência, facilitando testes unitários com MongoDB in-memory e uma eventual troca de banco. O tradeoff é a camada extra de indireção em um projeto pequeno.

#### JWT com par Access + Refresh Token

O access token tem vida curta (15min); o refresh token tem vida longa (30d) e é assinado com um secret diferente. Isso limita a janela de exposição de um token vazado. O tradeoff é que o refresh token não é rotacionado a cada uso — se ele for comprometido, o atacante tem 30 dias de acesso. Para mitigar, poderia ser implementada uma blacklist de refresh tokens ou rotação a cada refresh.

#### RBAC via Guard + Decorator

O decorator `@Auth(Role)` combina `SetMetadata` + `UseGuards` em um único lugar. O guard extrai o JWT, valida a role, e injeta o payload em `request.user`. É simples e suficiente para duas roles (`lojista` / `comprador`). Para cenários com permissões granulares, uma abordagem CASL/ABAC seria mais adequada.

#### `interestCount` denormalizado na Offer (atômico com o decremento de estoque)

O dashboard do lojista precisa mostrar quantos interessados cada oferta tem. A alternativa de um endpoint `/offers/:id/interests/count` criaria um N+1 na listagem. Optei por denormalizar: um campo `interestCount` direto no schema da `Offer`, incrementado **na mesma operação atômica** do `findOneAndUpdate` que já decrementa o estoque (`$inc: { stock: -1, interestCount: 1 }`). Consistência por construção — impossível o contador divergir, porque ele sobe exatamente quando o estoque desce, dentro de uma única query. O tradeoff é a responsabilidade de manter essa invariante caso novos caminhos de criação de interesse sejam introduzidos.

#### Status `sold_out` separado de `inactive`

Quando o estoque zera via último interesse, a oferta vai pra `sold_out` (não `inactive`). `inactive` fica reservado pra encerramento manual do lojista, e `expired` pro cron de expiração. Isso preserva a semântica do motivo do fim da oferta — útil pra analytics e pra UI mostrar o label correto ("Esgotada" vs "Encerrada" vs "Expirada").

#### Paginação com `total` retornado pelo backend

A listagem devolve `{ items, total, page, limit }` em vez de um array puro. O `total` vem de um `countDocuments` feito em paralelo com o `find` via `Promise.all`, o que permite ao frontend calcular `totalPages` e desabilitar os controles de navegação corretamente. O tradeoff é uma query extra por request, mas pra os volumes do MVP é irrelevante. Alternativa mais escalável seria cursor-based pagination, mas com mais complexidade de estado no frontend.

#### `populate('ownerId', 'name')` só na listagem

Compradores precisam ver qual loja publicou cada oferta. Em vez de um campo denormalizado `ownerName` (que ficaria inconsistente se a loja mudar o nome), faço `populate` seletivo no `find` do repositório — pega só o `name` do `User`. O `findOne` **não** popula, pra não quebrar o `assertOwnership` do service (que compara `offer.ownerId.toString() === ownerId`). O service de listagem achata o resultado em `{ ownerId: string, ownerName?: string }` pra manter o contrato tipado do frontend simples.

#### Cron para expiração de ofertas

O `@Cron(EVERY_MINUTE)` busca ofertas ativas com `expiresAt <= now` e atualiza o status para `expired`. A alternativa seria TTL index do Mongo ou verificar no momento da leitura (lazy). O cron foi escolhido para manter o status consistente no banco, mas o tradeoff é o delay de até 1 minuto entre a expiração real e a atualização do status.

#### WebSocket (Socket.IO) sem autenticação

O gateway emite `offer:created` para todos os clients conectados quando uma oferta é criada. Não há autenticação no handshake — qualquer client pode ouvir. Isso simplifica a implementação para o MVP, mas em produção seria necessário validar o JWT no handshake e possivelmente filtrar eventos por audiência (ex: só compradores com interesse no segmento).

#### Seed via `NestFactory.createApplicationContext`

O `npm run seed` executa `src/seed.ts`, que boota o container de DI do Nest **sem** subir HTTP/WebSocket (usa `createApplicationContext`, não `create`). Isso reaproveita `UsersRepository`, `OffersRepository`, a conexão Mongo do `ConfigModule` e o mesmo `bcrypt` do `AuthService`, sem duplicar setup. É idempotente via `findOne({ email })` — nenhuma flag `--wipe` ou `SeedModule` dedicado, que seriam over-engineering pra 2 usuários e 5 ofertas.

#### Swagger sem decorators nos DTOs

O Swagger está configurado em `/api` com bearer auth, mas os DTOs não têm `@ApiProperty`. Isso significa que o schema dos endpoints é genérico no Swagger UI. Funciona para teste manual, mas o schema não documenta tipos/validações. Ativar o plugin `@nestjs/swagger/plugin` no `nest-cli.json` resolveria isso automaticamente.

### Frontend

#### Axios interceptors com refresh proativo (jwt-decode)

O interceptor de request decodifica o JWT com `jwt-decode` e verifica o `exp` com buffer de 30 segundos. Se o token está prestes a expirar, faz o refresh **antes** de enviar a requisição, evitando a ida e volta de um 401. O interceptor de response (401) continua como fallback. O tradeoff é a dependência extra (`jwt-decode`, ~1KB) e a assunção de que o relógio do client está razoavelmente sincronizado.

#### Fila única de refresh (`refreshInFlight`)

Se múltiplas requisições detectam token expirado simultaneamente, apenas **uma** chamada de refresh é feita — as demais aguardam o mesmo Promise. Isso evita race conditions e chamadas duplicadas ao `/auth/refresh`.

#### localStorage para tokens (vs httpOnly cookies)

Tokens são armazenados em `localStorage` para simplicidade. O tradeoff é que são acessíveis via JavaScript, o que expõe a XSS. A alternativa mais segura seria httpOnly cookies setados pelo backend, mas isso requer configuração de CORS/SameSite e complica o fluxo de refresh. Para o escopo deste teste técnico, `localStorage` é pragmático.

#### Tailwind CSS (vs CSS Modules / styled-components)

Tailwind foi escolhido pela velocidade de prototipação — utility classes direto no JSX sem trocar de arquivo. O tradeoff é a verbosidade das classes no template e a curva de aprendizado para quem não está familiarizado.

#### Paleta `brand-*` centralizada na marca Multi

Em vez de usar `indigo-*` ou `emerald-*` do Tailwind direto, declarei uma escala `brand-50..950` no `tailwind.config.js` baseada no verde floresta (`#1e5a38` = `brand-600`) que é a cor real do app Multi (shopping Multiplan). Todos os componentes referenciam `brand-*`, então trocar a paleta inteira é uma edição em um único arquivo. O logo oficial da Multiplan em SVG vive em `frontend/public/multiplan-logo.svg`, com o `fill` pré-ajustado pro mesmo verde pra renderizar consistente via `<img>`.

#### Sem suite de testes no frontend

Priorizei testes no backend (services, repositories). O frontend não tem testes automatizados. Em um cenário real, adicionaria Vitest + Testing Library para componentes críticos (auth flow, formulário de oferta).

#### React Router com redirect baseado em role

`HomeRedirect` verifica `user.role` e redireciona para `/dashboard` (lojista) ou `/feed` (comprador). `ProtectedRoute` garante que a role do usuário corresponde à rota. Simples e declarativo para duas roles.
