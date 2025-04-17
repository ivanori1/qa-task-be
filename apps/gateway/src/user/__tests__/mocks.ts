// apps/gateway/src/user/__tests__/mocks.ts

import { UserDTO } from 'lib-server';

export const mockUserDTO: UserDTO = {
  id: 'user-id',
  userName: 'ivanori',
  firstName: 'Ivan',
  lastName: 'Coric',
  email: 'ivanori@example.com',
};

export const mockTokenResponse = {
  token: 'fake.jwt.token',
};
