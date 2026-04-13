import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { Role } from './auth/enums/role.enum';
import { OffersRepository } from './offers/offers.repository';
import { UsersRepository } from './users/users.repository';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const users = app.get(UsersRepository, { strict: false });
  const offers = app.get(OffersRepository, { strict: false });

  if (await users.findOne({ email: 'lojista@email.com' })) {
    await app.close();
    return;
  }

  const password = await bcrypt.hash('123456', 10);

  const lojista = await users.create({
    email: 'lojista@email.com',
    password,
    name: 'Loja Multiplan',
    role: Role.LOJISTA,
  });
  await users.create({
    email: 'comprador@email.com',
    password,
    name: 'Comprador Teste',
    role: Role.COMPRADOR,
  });

  const ownerId = lojista._id;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await offers.create({ ownerId, expiresAt, title: 'Tenis Nike 40% OFF', description: 'Modelo Air Max, tamanhos 38-44', discount: 40, stock: 10 });
  await offers.create({ ownerId, expiresAt, title: 'Perfume importado 25% OFF', description: 'Edicao limitada, ultimas unidades', discount: 25, stock: 5 });
  await offers.create({ ownerId, expiresAt, title: 'Hamburguer artesanal 15% OFF', description: 'Combo duplo + batata + refri', discount: 15, stock: 30 });
  await offers.create({ ownerId, expiresAt, title: 'Cinema 50% no ingresso', description: 'Salas 2D validas de seg a qui', discount: 50, stock: 50 });
  await offers.create({ ownerId, expiresAt, title: 'Oculos Ray-Ban 30% OFF', description: 'Linha aviador e wayfarer selecionadas', discount: 30, stock: 8 });

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
