import { Injectable } from '@nestjs/common';
import { supabase } from '../../common/supabase.client';

@Injectable()
export class LecturerService {
  // ===== CRUD =====

  async create(data: any) {
    const { data: lecturer, error } = await supabase
      .from('lecturer')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return lecturer;
  }

  async findAll() {
    const { data, error } = await supabase.from('lecturer').select('*').eq('is_active', true);

    if (error) throw error;
    return data;
  }

  async update(id: number, data: any) {
    const { data: lecturer, error } = await supabase
      .from('lecturer')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return lecturer;
  }

  async delete(id: number) {
    const { error } = await supabase.from('lecturer').update({ is_active: false }).eq('id', id);

    if (error) throw error;
    return { message: 'Deleted' };
  }

  // ===== BUSY =====

  async addBusy(data: any) {
    const { data: busy, error } = await supabase
      .from('lecturer_busy')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return busy;
  }

  async getBusy(lecturer_id: number) {
    const { data, error } = await supabase
      .from('lecturer_busy')
      .select('*')
      .eq('lecturer_id', lecturer_id);

    if (error) throw error;
    return data;
  }

  // ===== PREFERENCE =====

  async addPreference(data: any) {
    const { data: pref, error } = await supabase
      .from('lecturer_preference')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return pref;
  }

  async getPreference(lecturer_id: number) {
    const { data, error } = await supabase
      .from('lecturer_preference')
      .select('*')
      .eq('lecturer_id', lecturer_id);

    if (error) throw error;
    return data;
  }
}
