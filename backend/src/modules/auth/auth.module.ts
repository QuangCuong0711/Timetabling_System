import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtGuard } from '../../common/jwt.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'secret123',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtGuard],
  controllers: [AuthController],
  exports: [JwtGuard, JwtModule], // Thay JwtService bằng JwtModule
})
export class AuthModule {}
