import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { HydratedDocument } from 'mongoose';
import { Offer } from './schemas/offer.schema';

@WebSocketGateway({ cors: true })
export class OffersGateway {
  @WebSocketServer()
  server: Server;

  notifyNewOffer(offer: HydratedDocument<Offer>) {
    this.server.emit('offer:created', {
      id: offer._id,
      title: offer.title,
      description: offer.description,
      discount: offer.discount,
      stock: offer.stock,
      expiresAt: offer.expiresAt,
    });
  }
}
