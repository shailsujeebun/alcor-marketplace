import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService security policy', () => {
  let service: AuthService;

  const prisma = {
    session: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    emailVerificationCode: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const redisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
  };

  const usersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    sanitize: jest.fn((user: unknown) => user),
  };

  const jwtService = {
    sign: jest.fn().mockReturnValue('access-token'),
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'jwt.expiresIn') return '15m';
      if (key === 'jwt.refreshExpiresIn') return '7d';
      return undefined;
    }),
  };

  const mailService = {
    sendPasswordReset: jest.fn(),
    sendVerificationCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      prisma as any,
      redisService as any,
      usersService as any,
      jwtService as any,
      configService as any,
      mailService as any,
    );
  });

  it('rejects weak passwords during registration', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.register({
        email: 'user@example.com',
        password: 'weakpass',
        firstName: 'Test',
        lastName: 'User',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('blocks verification attempts when lock threshold is reached', async () => {
    redisService.get.mockResolvedValueOnce('5').mockResolvedValueOnce('0');

    await expect(
      service.verifyEmail('user@example.com', '123456', '203.0.113.1'),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });

    expect(usersService.findByEmail).not.toHaveBeenCalled();
  });

  it('blocks verification resend during cooldown window', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      emailVerified: false,
    });
    redisService.ttl.mockResolvedValueOnce(20).mockResolvedValueOnce(-2);

    await expect(
      service.resendVerificationCode('user@example.com', '203.0.113.1'),
    ).rejects.toBeInstanceOf(HttpException);

    expect(mailService.sendVerificationCode).not.toHaveBeenCalled();
  });

  it('issues verification code and cooldown markers when resend is allowed', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      emailVerified: false,
    });
    redisService.ttl.mockResolvedValueOnce(-2).mockResolvedValueOnce(-2);
    const createCodeSpy = jest
      .spyOn(service as any, 'createAndLogVerificationCode')
      .mockResolvedValue(undefined);
    redisService.set.mockResolvedValue(undefined);

    await expect(
      service.resendVerificationCode('user@example.com', '203.0.113.1'),
    ).resolves.toEqual({ ok: true });

    expect(createCodeSpy).toHaveBeenCalledWith('user-1', 'user@example.com');
    expect(redisService.set).toHaveBeenCalledTimes(2);
  });
});
