
import { Role } from '../../auth/enums/role.enum';

export class UserFilterDto {
  id?: string;
  email?: string;
  name?: string;
  role?: Role;
}
