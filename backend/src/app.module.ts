import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RoomModule } from './modules/room/room.module';
import { UserModule } from './modules/user/user.module';
import { LecturerModule } from './modules/lecturer/lecturer.module';

@Module({
  imports: [AuthModule, RoomModule, UserModule, LecturerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
