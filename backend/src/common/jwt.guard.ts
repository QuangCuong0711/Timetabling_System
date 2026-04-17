import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No token');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Thêm object cấu hình vào tham số thứ 2
      const payload = this.jwtService.verify(token, {
        secret: 'secret123', // Phải khớp 100% với bên AuthService/AuthModule
      });
      request.user = payload;
      return true;
    } catch (e) {
      // Log lỗi thực tế ra console để xem tại sao nó Invalid (hết hạn hay sai chữ ký)
      console.error('JWT Verify Error:', e.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
