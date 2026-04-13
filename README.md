
## Stack usada

Banco de dados - MongoDB
Backend - NestJS e SocketIO
Frontend - React e Vite
Swagger - http://localhost:3000/api

## Como rodar

Todos os comandos são executados a partir da raiz do monorepo.

### 1. Instalar dependências e criar .env

Copie os dados do .env.sample e crie um .env

instale as libs com

```bash
npm install
```

### 2. Subir o MongoDB

```bash
docker-compose up -d
```

### 3. (Opcional) Popular o banco de dados com Seeds de teste

```bash
npm run seed
```

Cria 2 usuarios, Lojista e Comprador

| Role      | E-mail                | Senha    |
|-----------|-----------------------|----------|
| Lojista   | `lojista@email.com`   | `123456` |
| Comprador | `comprador@email.com` | `123456` |


tambem cria ofertas mockadas pra visualizar e editar.

### 4. Iniciar o projeto

```bash
npm run dev
```

roda o back e o front.

Tambem pode rodar separadamente entrando nos diretorios de cada um e rodando

Backend:

```bash
npm run start:dev
```

Frontend:

```bash
npm run dev
```

O front sobe em **http://localhost:5173**.
O back sobe em **http://localhost:3000**


## Credenciais de teste

Geradas por `npm run seed`.

| Role      | E-mail                | Senha    |
|-----------|-----------------------|----------|
| Lojista   | `lojista@email.com`   | `123456` |
| Comprador | `comprador@email.com` | `123456` |


## Algumas Decisões técnicas que tomei e seus tradeoffs

**MongoDB + Mongoose.** Flexibilidade de schema e uso do server em memoria para simular os testes.

Tradeoff: nao mantem toda integridade e relacionamentos que teria um banco relacional, nem controle direto das queries SQL que poderia ter escrevendo diretamente.

**JWT access + refresh** Mantem a sessao por mais tempo, mas ainda garantindo segurança do access token com vida curta.

Tradeoff: Front precisa validar e ficar fazendo refresh sempre que necessario. E usuario é deslogado quando o refresh token expira.

**Utilizar a role vindo direto no payload do token** Usar a role do payload do token evita que precise consultar o DB no Guard de autenticação toda vez, melhorando performance das rotas.

Tradeoff: caso saia, revogue ou mude a role de um usuario, o token desatualizado dura 15 minutos vivo. Poderiamos solucionar isso com um blacklist de tokens, exemplo: cache

**Status `sold_out` separado de `inactive` e `expired`.** Separa os status, deixando mais claro o que aconteceu com cada oferta, tambem possibilita diferentes filtros.

Tradeoff: Precisou de um cronJob e validacoes diferentes para ficar mantendo esse status atualizado de acordo com as ofertas.

**Cron para expiração.** Cronjob a cada 1min checa a expiracao das ofertas e atualiza no DB, evitando precisar sempre checar pela Data de validade nas consultas. podemos usar o status pra isso.

Tradeoff: Delay de até 1 minuto ate uma oferta ser realmente finalizada.


**Tokens no `localStorage`.** Simples e direto pro MVP. HttpOnly cookies seriam mais seguros em um produto real.
