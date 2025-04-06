import { Role } from '@prisma/client';

export class Auth {
  id: number;
  email: string;
  password: string;
  nisn: string;
  photo_url?: string;
  name: string;
  role: Role;
  date_of_birth: bigint;
  created_at: Date;
  updated_at: Date;
}
