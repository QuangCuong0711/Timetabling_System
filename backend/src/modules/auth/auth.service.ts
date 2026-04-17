import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { supabase } from '../../common/supabase.client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(username: string, password: string) {
    // 1. Lấy user từ DB
    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    // 2. So password
    const isMatch = await bcrypt.compare(password, user.password_hash.trim());

    if (!isMatch) {
      throw new UnauthorizedException('Wrong password');
    }

    // 3. Tạo payload
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    // 4. Tạo token
    const token = this.jwtService.sign(payload);

    // 5. Trả về
    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
    };
  }
}
