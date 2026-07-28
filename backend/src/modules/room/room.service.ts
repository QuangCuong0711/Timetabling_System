import { Injectable } from '@nestjs/common';
import { supabase } from '../../common/supabase.client';

@Injectable()
export class RoomService {
  async create(data: any) {
    const { data: room, error } = await supabase.from('room').insert([data]).select().single();

    if (error) throw error;
    return room;
  }

  // async findAll() {
  //   const { data, error } = await supabase.from('room').select('*').eq('is_active', true);

  //   if (error) throw error;
  //   return data;
  // }

  async findOne(id: string) {
    const { data, error } = await supabase
      .from('room')
      .select('*') // Thay '*' bằng các cột cụ thể nếu cần (ví dụ: 'id, name')
      .eq('id', id) // Lọc theo id
      .eq('is_active', true) // Lọc theo trạng thái hoạt động
      .maybeSingle(); // Trả về 1 object (hoặc null nếu không tìm thấy) thay vì mảng

    if (error) throw error;
    return data;
  }

  async find(data: any) {
    let query = supabase.from('room').select('*');

    // Mặc định lọc phòng active trừ khi chỉ định rõ
    const isActive = data?.isActive ?? true;
    query = query.eq('is_active', isActive);

    if (data?.building) {
      query = query.ilike('building', `%${data.building}%`);
    }

    if (data?.campus) {
      query = query.ilike('campus', `%${data.campus}%`);
    }

    if (data?.number) {
      query = query.ilike('number', `%${data.number}%`);
    }

    if (data?.type) {
      query = query.eq('type', data.type);
    }

    // Sức chứa > X (dùng gt) hoặc >= X (dùng gte)
    if (data?.minCapacity !== undefined) {
      query = query.gte('capacity', Number(data.minCapacity));
    }

    if (data?.maxCapacity !== undefined) {
      query = query.lte('capacity', Number(data.maxCapacity));
    }

    const { data: rooms, error } = await query;
    if (error) throw error;
    return rooms;
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
