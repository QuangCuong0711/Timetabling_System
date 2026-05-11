import { Injectable } from '@nestjs/common';
import { supabase } from '../../common/supabase.client';

@Injectable()
export class RoomService {
  async create(data: any) {
    const { data: room, error } = await supabase.from('room').insert([data]).select().single();

    if (error) throw error;
    return room;
  }

  async findAll() {
    const { data, error } = await supabase.from('room').select('*').eq('is_active', true);

    if (error) throw error;
    return data;
  }

  async update(id: number, data: any) {
    const { data: room, error } = await supabase
      .from('room')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return room;
  }

  async delete(id: number) {
    const { error } = await supabase.from('room').update({ is_active: false }).eq('id', id);

    if (error) throw error;
    return { message: 'Deleted' };
  }
}
