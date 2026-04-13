import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from './enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('should delegate to authService.register and return its result', async () => {
      const dto: RegisterDto = {
        email: 'test@test.com',
        password: 'secret123',
        name: 'Test',
        role: Role.LOJISTA,
      };
      const expected = { accessToken: 'a', refreshToken: 'r', user: {} } as any;
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('login', () => {
    it('should delegate to authService.login and return its result', async () => {
      const dto: LoginDto = { email: 'test@test.com', password: 'secret123' };
      const expected = { accessToken: 'a', refreshToken: 'r', user: {} } as any;
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with only the token from the dto', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'token-123' };
      const expected = { accessToken: 'new' } as any;
      authService.refresh.mockResolvedValue(expected);

      const result = await controller.refresh(dto);

      expect(authService.refresh).toHaveBeenCalledWith('token-123');
      expect(result).toBe(expected);
    });
  });

  describe('DTO validation', () => {
    it('RegisterDto should reject invalid email, short password, empty name and bad role', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'not-an-email',
        password: '123',
        name: '',
        role: 'admin',
      });
      const errors = await validate(dto);
      const props = errors.map((e) => e.property);
      expect(props).toEqual(
        expect.arrayContaining(['email', 'password', 'name', 'role']),
      );
    });

    it('RegisterDto should accept a valid payload', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'ok@test.com',
        password: 'secret123',
        name: 'Ok',
        role: Role.COMPRADOR,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('LoginDto should reject empty payload', async () => {
      const dto = plainToInstance(LoginDto, {});
      const errors = await validate(dto);
      const props = errors.map((e) => e.property);
      expect(props).toEqual(expect.arrayContaining(['email', 'password']));
    });

    it('RefreshTokenDto should reject empty refreshToken', async () => {
      const dto = plainToInstance(RefreshTokenDto, { refreshToken: '' });
      const errors = await validate(dto);
      expect(errors.map((e) => e.property)).toContain('refreshToken');
    });
  });
});
