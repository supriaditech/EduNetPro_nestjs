import { jwt_config } from 'src/config/jwt_config';
import { JwtService } from '@nestjs/jwt';

export function generateRefreshToken(jwtService: JwtService, payload: any) {
  return jwtService.sign(payload, {
    secret: jwt_config.secret,
    expiresIn: '7d', // Refresh token valid selama 7 hari
  });
}
