import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/enums/role.enum';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferStatus } from './enums/offer-status.enum';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: OfferStatus,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.offersService.findAll(Number(page), Number(limit), status, ownerId);
  }

  @Post()
  @Auth(Role.LOJISTA)
  create(@Body() dto: CreateOfferDto, @CurrentUser() user: JwtPayload) {
    return this.offersService.create(dto, user.sub);
  }

  @Patch(':id')
  @Auth(Role.LOJISTA)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.offersService.update(id, dto, user.sub);
  }

  @Patch(':id/close')
  @Auth(Role.LOJISTA)
  close(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.offersService.close(id, user.sub);
  }
}
