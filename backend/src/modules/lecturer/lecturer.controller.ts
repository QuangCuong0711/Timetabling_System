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
}
