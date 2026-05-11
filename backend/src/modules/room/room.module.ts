import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { JwtGuard } from '../../common/jwt.guard';
import { RoleGuard } from '../../common/role.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'secret123',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [RoomService, JwtGuard, RoleGuard],
  controllers: [RoomController],
  exports: [JwtGuard, RoleGuard, JwtModule], // Thay JwtService bằng JwtModule
})
export class RoomModule {}
