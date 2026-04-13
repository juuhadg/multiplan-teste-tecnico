import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { Role } from './auth/enums/role.enum';
import { OffersRepository } from './offers/offers.repository';
import { UsersRepository } from './users/users.repository';

const LOJISTA_EMAIL = 'lojista@email.com';
const COMPRADOR_EMAIL = 'comprador@email.com';
const PASSWORD = '123456';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const users = app.get(UsersRepository, { strict: false });
  const offers = app.get(OffersRepository, { strict: false });

  const existing = await users.findOne({ email: LOJISTA_EMAIL });
  if (existing) {
    console.log('[seed] lojista ja existe, pulando.');
    await app.close();
    return;
  }

  const hash = await bcrypt.hash(PASSWORD, 10);

  const lojista = await users.create({
    email: LOJISTA_EMAIL,
    password: hash,
    name: 'Loja Multiplan',
    role: Role.LOJISTA,
  });
  const comprador = await users.create({
    email: COMPRADOR_EMAIL,
    password: hash,
    name: 'Comprador Teste',
    role: Role.COMPRADOR,
  });

  const now = Date.now();
  const hours = (n: number) => new Date(now + n * 3600_000);

  const seedOffers = [
    {
      title: 'Tenis Nike 40% OFF',
      description: 'Modelo Air Max, tamanhos 38-44',
      discount: 40,
      stock: 10,
      expiresAt: hours(6),
    },
    {
      title: 'Perfume importado 25% OFF',
      description: 'Edicao limitada, ultimas unidades',
      discount: 25,
      stock: 5,
      expiresAt: hours(24),
    },
    {
      title: 'Hamburguer artesanal 15% OFF',
      description: 'Combo duplo + batata + refri',
      discount: 15,
      stock: 30,
      expiresAt: hours(3),
    },
    {
      title: 'Cinema 50% no ingresso',
      description: 'Salas 2D validas de seg a qui',
      discount: 50,
      stock: 50,
      expiresAt: hours(72),
    },
    {
      title: 'Oculos Ray-Ban 30% OFF',
      description: 'Linha aviador e wayfarer selecionadas',
      discount: 30,
      stock: 8,
      expiresAt: hours(168),
    },
  ];

  for (const data of seedOffers) {
    await offers.create({ ...data, ownerId: lojista._id });
  }

  console.log('[seed] criado:');
  console.log(`  lojista:   ${lojista.email} (senha: ${PASSWORD})`);
  console.log(`  comprador: ${comprador.email} (senha: ${PASSWORD})`);
  console.log(`  ofertas:   ${seedOffers.length}`);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('[seed] falhou:', err);
  process.exit(1);
});
