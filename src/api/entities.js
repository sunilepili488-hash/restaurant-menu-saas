import { supabase } from './supabaseClient';

// Helper: adds updated_at on update
const withTimestamp = (data) => ({ ...data, updated_at: new Date().toISOString() });

/**
 * Sanitize payload before sending to Supabase:
 * - Convert empty strings on UUID foreign-key fields to null
 *   (Supabase rejects "" for uuid columns with a 400 error)
 * - Remove fields with undefined values
 */
const sanitizePayload = (payload) => {
  const uuidFields = ['category_id', 'dish_id', 'restaurant_id', 'table_id'];
  const clean = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;               // strip undefined
    if (uuidFields.includes(key) && value === '') {   // empty string UUID → null
      clean[key] = null;
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

// ─────────────────────────────────────────────────────────────────────────────
// No-backend fallback: returned when Supabase is not configured
// ─────────────────────────────────────────────────────────────────────────────
const offlineEntity = {
  async list() { return []; },
  async filter() { return []; },
  async get() { return null; },
  async create() { console.warn('[AuraMenu] Cannot create — Supabase not connected'); return null; },
  async update() { console.warn('[AuraMenu] Cannot update — Supabase not connected'); return null; },
  async delete() { console.warn('[AuraMenu] Cannot delete — Supabase not connected'); return { success: false }; },
};

// ─────────────────────────────────────────────────────────────────────────────
// Generic entity factory
// ─────────────────────────────────────────────────────────────────────────────
function makeEntity(tableName) {
  // Return stub when no backend connection
  if (!supabase) return offlineEntity;

  return {
    async list(orderBy = 'created_at', limit = 100) {
      const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
      const asc = !orderBy.startsWith('-');
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(col, { ascending: asc })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    async filter(filters = {}, orderBy = 'created_at', limit = 100) {
      const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
      const asc = !orderBy.startsWith('-');
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query.order(col, { ascending: asc }).limit(limit);
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const clean = sanitizePayload({ ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      const { data, error } = await supabase
        .from(tableName)
        .insert([clean])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const clean = sanitizePayload(withTimestamp(payload));
      const { data, error } = await supabase
        .from(tableName)
        .update(clean)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Export all entities (same names as Base44)
// ─────────────────────────────────────────────────────────────────────────────
export const entities = {
  Restaurant: makeEntity('restaurant'),
  Category: makeEntity('category'),
  Dish: makeEntity('dish'),
  Banner: makeEntity('banner'),
  Order: makeEntity('order'),
  Review: makeEntity('review'),
  TableMapping: makeEntity('table_mapping'),
};
