export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  birthDate: string | null;
  gender: 'male' | 'female' | null;
  role: 'client' | 'admin';
  balance: number;
  status: 'active' | 'blocked';
  createdAt: string;
}
