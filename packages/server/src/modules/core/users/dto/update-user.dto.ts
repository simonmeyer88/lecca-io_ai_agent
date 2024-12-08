import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

/**
 * `email` and `password` can't be updated through the regular user update controller.
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password'] as const),
) {}
