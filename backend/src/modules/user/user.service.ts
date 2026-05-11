import { Injectable } from '@nestjs/common';
import { supabase } from '../../common/supabase.client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  async create(data: any) {
    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { data: user, error } = await supabase
      .from('user')
      .insert([
        {
          username: data.username,
          password_hash: hashedPassword,
          full_name: data.full_name,
          role: data.role,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  async findAll() {
    const { data, error } = await supabase
      .from('user')
      .select('id, username, full_name, role, is_active');

    if (error) throw error;
    return data;
  }
}
