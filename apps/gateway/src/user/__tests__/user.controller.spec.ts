import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { JwtService } from '../../auth/jwt.service';
import { SiweService } from '../../siwe/siwe.service';
import { UserClientAPI } from 'lib-server';
import { mockUserDTO, mockTokenResponse } from './mocks';
import { UnauthorizedException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  const mockJwtService = {
    buildAuthRes: jest.fn().mockReturnValue(mockTokenResponse),
  };

  const mockSiweService = {
    verifyMessage: jest.fn().mockResolvedValue({ address: '0xabc123' }),
  };

  const mockUserClientAPI = {
    getUser: jest.fn().mockResolvedValue(mockUserDTO),
    signUp: jest.fn().mockResolvedValue(mockUserDTO),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: JwtService, useValue: mockJwtService },
        { provide: SiweService, useValue: mockSiweService },
        { provide: UserClientAPI, useValue: mockUserClientAPI },
      ],
    }).compile();

    controller = moduleRef.get<UserController>(UserController);
  });

  describe('signup', () => {
    it('should return a token from jwtService after signup', async () => {
      const result = await controller.signup({
        message: 'msg',
        signature: 'sig',
        userName: mockUserDTO.userName,
        email: mockUserDTO.email,
        firstName: mockUserDTO.firstName,
        lastName: mockUserDTO.lastName,
      });

      expect(result).toEqual(mockTokenResponse);
    });
  });

  describe('login', () => {
    it('should return a token from jwtService after login', async () => {
      const result = await controller.login({
        message: 'msg',
        signature: 'sig',
      });

      expect(result).toEqual(mockTokenResponse);
    });

    it('should throw UnauthorizedException if SIWE fails', async () => {
      mockSiweService.verifyMessage.mockRejectedValueOnce(new Error('fail'));

      await expect(
        controller.login({ message: 'bad', signature: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
