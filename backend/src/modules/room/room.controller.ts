import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtGuard } from '../../common/jwt.guard';
import { RoleGuard } from '../../common/role.guard';
import { Roles } from '../../common/role.decorator';

@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  // 🔐 tạo phòng
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('ADMIN', 'FACILITY_STAFF')
  @Post()
  create(@Body() body: any) {
    return this.roomService.create(body);
  }

  // 🔓 ai login cũng xem được
  // @UseGuards(JwtGuard)
  // @Get()
  // findAll() {
  //   return this.roomService.findAll();
  // }

  // 🔓 ai login cũng xem được
  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Get()
  find(@Query() query: any) {
    return this.roomService.find(query);
  }

  // 🔐 update
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('ADMIN', 'FACILITY_STAFF')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.roomService.update(Number(id), body);
  }

  // 🔐 delete (soft delete)
  @UseGuards(JwtGuard, RoleGuard)
  @Roles('ADMIN', 'FACILITY_STAFF')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roomService.delete(Number(id));
  }
}
