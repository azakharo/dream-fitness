import { UserGender, UserRole, UserStatus } from '@app/shared';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  phone!: string | null;
  birthDate!: Date | null;
  gender!: UserGender | null;
  role!: UserRole;
  balance!: number;
  status!: UserStatus;
  createdAt!: string;
}
