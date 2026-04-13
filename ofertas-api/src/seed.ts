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

  let lojista = await users.findOne({ email: 'lojista@email.com' });
  const compradorExiste = await users.findOne({ email: 'comprador@email.com' });

  const password =
    !lojista || !compradorExiste ? await bcrypt.hash('123456', 10) : '';

  if (!lojista) {
    lojista = await users.create({
      email: 'lojista@email.com',
      password,
      name: 'Loja Multiplan',
      role: Role.LOJISTA,
    });
  }

  if (!compradorExiste) {
    await users.create({
      email: 'comprador@email.com',
      password,
      name: 'Comprador Teste',
      role: Role.COMPRADOR,
    });
  }

  const ownerId = lojista._id;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await offers.create({ ownerId, expiresAt, title: 'Tenis Nike 40% OFF', description: 'Modelo Air Max, tamanhos 38-44', discount: 40, stock: 10 });
  await offers.create({ ownerId, expiresAt, title: 'Perfume importado 25% OFF', description: 'Edicao limitada, ultimas unidades', discount: 25, stock: 5 });
  await offers.create({ ownerId, expiresAt, title: 'Hamburguer artesanal 15% OFF', description: 'Combo duplo + batata + refri', discount: 15, stock: 30 });
  await offers.create({ ownerId, expiresAt, title: 'Cinema 50% no ingresso', description: 'Salas 2D validas de seg a qui', discount: 50, stock: 50 });
  await offers.create({ ownerId, expiresAt, title: 'Oculos Ray-Ban 30% OFF', description: 'Linha aviador e wayfarer selecionadas', discount: 30, stock: 8 });
  await offers.create({ ownerId, expiresAt, title: 'Camiseta basica 20% OFF', description: 'Algodao penteado, cores variadas', discount: 20, stock: 45 });
  await offers.create({ ownerId, expiresAt, title: 'Smartphone capa + pelicula 35% OFF', description: 'Kit compativel com modelos em destaque', discount: 35, stock: 25 });
  await offers.create({ ownerId, expiresAt, title: 'Cafe especial 10% OFF', description: 'Graos torrados, 250g', discount: 10, stock: 60 });
  await offers.create({ ownerId, expiresAt, title: 'Mochila escolar 22% OFF', description: 'Compartimento para notebook ate 15 polegadas', discount: 22, stock: 18 });
  await offers.create({ ownerId, expiresAt, title: 'Sorvete artesanal 2 por 1', description: 'Sabores do dia, copo 200ml', discount: 50, stock: 100 });
  await offers.create({ ownerId, expiresAt, title: 'Creme hidratante 18% OFF', description: 'Linha dermocosmetica, frasco 400ml', discount: 18, stock: 35 });
  await offers.create({ ownerId, expiresAt, title: 'Livros selecionados 28% OFF', description: 'Ficcao e negocios, etiqueta verde', discount: 28, stock: 40 });
  await offers.create({ ownerId, expiresAt, title: 'Pizza media 12% OFF', description: 'Sabores classicos, para viagem', discount: 12, stock: 22 });
  await offers.create({ ownerId, expiresAt, title: 'Fone Bluetooth 33% OFF', description: 'Cancelamento de ruido ativo', discount: 33, stock: 14 });
  await offers.create({ ownerId, expiresAt, title: 'Aula experimental pilates 45% OFF', description: 'Agendamento pelo app, primeira visita', discount: 45, stock: 12 });

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
