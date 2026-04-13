import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Role } from '../auth/enums/role.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ListOffersQueryDto } from './dto/list-offers-query.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferStatus } from './enums/offer-status.enum';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

describe('OffersController', () => {
  let controller: OffersController;
  let offersService: jest.Mocked<OffersService>;

  const lojista: JwtPayload = { sub: 'user-1', role: Role.LOJISTA } as any;
  const comprador: JwtPayload = { sub: 'user-2', role: Role.COMPRADOR } as any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [OffersController],
      providers: [
        {
          provide: OffersService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            close: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OptionalAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(OffersController);
    offersService = module.get(OffersService);
  });

  describe('findAll', () => {
    it('should apply defaults when query is empty and no user is present', async () => {
      const expected = { items: [], total: 0 } as any;
      offersService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll({} as ListOffersQueryDto, {} as any);

      expect(offersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
        'recent',
        undefined,
      );
      expect(result).toBe(expected);
    });

    it('should pass expiresSoon when query.sort is expiresSoon', async () => {
      offersService.findAll.mockResolvedValue([] as any);

      await controller.findAll(
        { sort: 'expiresSoon' } as ListOffersQueryDto,
        {} as any,
      );

      expect(offersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
        'expiresSoon',
        undefined,
      );
    });

    it('should fall back to recent when sort is unknown', async () => {
      offersService.findAll.mockResolvedValue([] as any);

      await controller.findAll(
        { sort: 'whatever' } as ListOffersQueryDto,
        {} as any,
      );

      expect(offersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
        'recent',
        undefined,
      );
    });

    it('should pass viewerId only when user is COMPRADOR', async () => {
      offersService.findAll.mockResolvedValue([] as any);

      await controller.findAll({} as ListOffersQueryDto, { user: comprador } as any);

      expect(offersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
        'recent',
        comprador.sub,
      );
    });

    it('should keep viewerId undefined when user is LOJISTA', async () => {
      offersService.findAll.mockResolvedValue([] as any);

      await controller.findAll({} as ListOffersQueryDto, { user: lojista } as any);

      expect(offersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
        'recent',
        undefined,
      );
    });

    it('should forward query filters to the service', async () => {
      offersService.findAll.mockResolvedValue([] as any);

      const query: ListOffersQueryDto = {
        page: 2,
        limit: 25,
        status: OfferStatus.ACTIVE,
        ownerId: 'owner-1',
        q: 'pizza',
        sort: 'recent',
      };

      await controller.findAll(query, {} as any);

      expect(offersService.findAll).toHaveBeenCalledWith(
        2,
        25,
        OfferStatus.ACTIVE,
        'owner-1',
        'pizza',
        'recent',
        undefined,
      );
    });
  });

  describe('create', () => {
    it('should delegate to offersService.create with dto and user.sub', async () => {
      const dto: CreateOfferDto = {
        title: 'T',
        description: 'D',
        discount: 10,
        stock: 5,
        expiresAt: new Date(Date.now() + 86400000),
      };
      const expected = { _id: 'offer-1' } as any;
      offersService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, lojista);

      expect(offersService.create).toHaveBeenCalledWith(dto, lojista.sub);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should delegate to offersService.update with id, dto and user.sub', async () => {
      const dto: UpdateOfferDto = { stock: 9 } as UpdateOfferDto;
      const expected = { _id: 'offer-1', stock: 9 } as any;
      offersService.update.mockResolvedValue(expected);

      const result = await controller.update('offer-1', dto, lojista);

      expect(offersService.update).toHaveBeenCalledWith('offer-1', dto, lojista.sub);
      expect(result).toBe(expected);
    });
  });

  describe('close', () => {
    it('should delegate to offersService.close with id and user.sub', async () => {
      const expected = { _id: 'offer-1', status: OfferStatus.INACTIVE } as any;
      offersService.close.mockResolvedValue(expected);

      const result = await controller.close('offer-1', lojista);

      expect(offersService.close).toHaveBeenCalledWith('offer-1', lojista.sub);
      expect(result).toBe(expected);
    });
  });

  describe('DTO validation', () => {
    it('CreateOfferDto should reject invalid fields', async () => {
      const dto = plainToInstance(CreateOfferDto, {
        title: '',
        description: '',
        discount: 150,
        stock: -1,
        expiresAt: '2000-01-01',
      });
      const errors = await validate(dto);
      const props = errors.map((e) => e.property);
      expect(props).toEqual(
        expect.arrayContaining([
          'title',
          'description',
          'discount',
          'stock',
          'expiresAt',
        ]),
      );
    });

    it('CreateOfferDto should accept a valid payload', async () => {
      const dto = plainToInstance(CreateOfferDto, {
        title: 'Ok',
        description: 'desc',
        discount: 20,
        stock: 3,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('ListOffersQueryDto should reject out-of-range page/limit and bad status', async () => {
      const dto = plainToInstance(ListOffersQueryDto, {
        page: 0,
        limit: 999,
        status: 'banana',
      });
      const errors = await validate(dto);
      const props = errors.map((e) => e.property);
      expect(props).toEqual(expect.arrayContaining(['page', 'limit', 'status']));
    });

    it('ListOffersQueryDto should accept an empty payload', async () => {
      const dto = plainToInstance(ListOffersQueryDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
