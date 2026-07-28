import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { LecturerService } from './lecturer.service';
import { JwtGuard } from '../../common/jwt.guard';
import { RoleGuard } from '../../common/role.guard';
import { Roles } from '../../common/role.decorator';

@Controller('lecturers')
export class LecturerController {
  constructor(private lecturerService: LecturerService) {}

  // ===== CRUD =====

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.lecturerService.create(body);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.lecturerService.findAll();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.lecturerService.update(Number(id), body);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.lecturerService.delete(Number(id));
  }

  // ===== BUSY =====

  @UseGuards(JwtGuard)
  @Post('busy')
  addBusy(@Body() body: any, @Req() req) {
    // nếu là lecturer thì auto lấy id từ token
    if (req.user.role === 'LECTURER') {
      body.lecturer_id = req.user.sub;
    }
    return this.lecturerService.addBusy(body);
  }

  @UseGuards(JwtGuard)
  @Get('busy')
  getBusy(@Query('lecturer_id') lecturer_id: string) {
    return this.lecturerService.getBusy(Number(lecturer_id));
  }

  // 3. Cập nhật lịch bận
  // PUT /lecturer/busy?id=1
  @UseGuards(JwtGuard)
  @Put('busy')
  updateBusy(@Query('id') id: string, @Body() data: any) {
    const busyId = Number(id);
    if (!id || isNaN(busyId)) {
      throw new BadRequestException('Vui lòng truyền id hợp lệ dạng số trên Query string');
    }
    return this.lecturerService.updateBusy(busyId, data);
  }

  // 4. Xóa lịch bận theo ID bản ghi
  // DELETE /lecturer/busy?id=1
  @UseGuards(JwtGuard)
  @Delete('busy')
  deleteBusy(@Query('id') id: string) {
    const busyId = Number(id);
    if (!id || isNaN(busyId)) {
      throw new BadRequestException('Vui lòng truyền id hợp lệ dạng số trên Query string');
    }
    return this.lecturerService.deleteBusy(busyId);
  }

  // ===== PREFERENCE =====

  @UseGuards(JwtGuard)
  @Post('preference')
  addPreference(@Body() body: any, @Req() req) {
    if (req.user.role === 'LECTURER') {
      body.lecturer_id = req.user.sub;
    }
    return this.lecturerService.addPreference(body);
  }

  @UseGuards(JwtGuard)
  @Get('preference')
  getPreference(@Query('lecturer_id') lecturer_id: string) {
    return this.lecturerService.getPreference(Number(lecturer_id));
  }

  // Cập nhật nguyện vọng/sở thích theo ID
  // PUT /lecturer/preference?id=1
  @UseGuards(JwtGuard)
  @Put('preference')
  updatePreference(@Query('id') id: string, @Body() data: any) {
    const prefId = Number(id);
    if (!id || isNaN(prefId)) {
      throw new BadRequestException('Vui lòng truyền id hợp lệ dạng số trên Query string');
    }
    return this.lecturerService.updatePreference(prefId, data);
  }

  // Xóa nguyện vọng/sở thích theo ID
  // DELETE /lecturer/preference?id=1
  @UseGuards(JwtGuard)
  @Delete('preference')
  deletePreference(@Query('id') id: string) {
    const prefId = Number(id);
    if (!id || isNaN(prefId)) {
      throw new BadRequestException('Vui lòng truyền id hợp lệ dạng số trên Query string');
    }
    return this.lecturerService.deletePreference(prefId);
  }
}
