import { JwtUser } from './jwt-user.type';

export interface Request extends Express.Request {
  user: JwtUser;
}
