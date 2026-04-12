import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OffersRepository } from './offers.repository';

@Injectable()
export class OffersCron {
  constructor(private readonly offersRepository: OffersRepository) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async expireOffers() {
    await this.offersRepository.expireOffers();
  }
}
