import { Controller, Param, Post } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/enums/role.enum';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { InterestsService } from './interests.service';

@Controller('offers/:offerId/interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post()
  @Auth(Role.COMPRADOR)
  register(
    @Param('offerId') offerId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.interestsService.register(offerId, user.sub);
  }
}
