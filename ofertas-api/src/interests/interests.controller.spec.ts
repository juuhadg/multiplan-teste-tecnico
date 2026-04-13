import { Test } from '@nestjs/testing';
import { Role } from '../auth/enums/role.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';

describe('InterestsController', () => {
  let controller: InterestsController;
  let interestsService: jest.Mocked<InterestsService>;

  const comprador: JwtPayload = { sub: 'user-1', role: Role.COMPRADOR } as any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [InterestsController],
      providers: [
        {
          provide: InterestsService,
          useValue: {
            register: jest.fn(),
            unregister: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(InterestsController);
    interestsService = module.get(InterestsService);
  });

  describe('register', () => {
    it('should delegate to interestsService.register with offerId and user.sub', async () => {
      const expected = { _id: 'interest-1' } as any;
      interestsService.register.mockResolvedValue(expected);

      const result = await controller.register('offer-1', comprador);

      expect(interestsService.register).toHaveBeenCalledWith('offer-1', comprador.sub);
      expect(result).toBe(expected);
    });
  });

  describe('unregister', () => {
    it('should delegate to interestsService.unregister with offerId and user.sub', async () => {
      interestsService.unregister.mockResolvedValue(undefined as any);

      const result = await controller.unregister('offer-1', comprador);

      expect(interestsService.unregister).toHaveBeenCalledWith(
        'offer-1',
        comprador.sub,
      );
      expect(result).toBeUndefined();
    });
  });
});
