import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UsersRepository } from '../users/users.repository';
import { AuthService } from './auth.service';
import { Role } from './enums/role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@test.com',
    password: '',
    name: 'Test',
    role: Role.LOJISTA,
  } as any;

  beforeEach(async () => {
    mockUser.password = await bcrypt.hash('secret123', 4);

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findOne: jest.fn(),
            findOneWithPassword: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
            get: jest.fn().mockReturnValue('7d'),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    const dto = {
      email: 'test@test.com',
      password: 'secret123',
      name: 'Test',
      role: Role.LOJISTA,
    };

    it('should create user and return tokens', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(mockUser);

      const result = await authService.register(dto);

      expect(usersRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw ConflictException if email exists', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const dto = { email: 'test@test.com', password: 'secret123' };

    it('should return tokens with valid credentials', async () => {
      usersRepository.findOneWithPassword.mockResolvedValue(mockUser);

      const result = await authService.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw UnauthorizedException if email not found', async () => {
      usersRepository.findOneWithPassword.mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      usersRepository.findOneWithPassword.mockResolvedValue(mockUser);

      await expect(
        authService.login({ ...dto, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new accessToken with valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: mockUser._id.toString(),
        role: Role.LOJISTA,
      });

      const result = await authService.refresh('valid-token');

      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException with invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(authService.refresh('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
