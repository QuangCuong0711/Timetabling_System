import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../../common/jwt.guard';
import { RoleGuard } from '../../common/role.guard';
import { Roles } from '../../common/role.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // 🔐 chỉ ADMIN được tạo user
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  // 🔐 ADMIN xem danh sách user
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
