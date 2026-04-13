import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/enums/role.enum';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ListOffersQueryDto } from './dto/list-offers-query.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(
    @Query() query: ListOffersQueryDto,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sort =
      query.sort === 'expiresSoon' ? ('expiresSoon' as const) : ('recent' as const);
    const viewerId =
      req.user?.role === Role.COMPRADOR ? req.user.sub : undefined;
    return this.offersService.findAll(
      page,
      limit,
      query.status,
      query.ownerId,
      query.q,
      sort,
      viewerId,
    );
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
