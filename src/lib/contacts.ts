import { getDb, initDb } from "./db";

export interface ServiceContact {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface ServiceVendor {
  id: string;
  categoryId: string;
  companyName: string;
  website: string;
  notes: string;
  createdAt: string;
  contacts: ServiceContact[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  sortOrder: number;
  vendors: ServiceVendor[];
}

export async function createCategory(name: string): Promise<ServiceCategory> {
  await initDb();
  const sql = getDb();
  const id = `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
  await sql`
    INSERT INTO service_categories (id, name, sort_order)
    VALUES (${id}, ${name}, 99)
    ON CONFLICT (id) DO NOTHING
  `;
  return { id, name, sortOrder: 99, vendors: [] };
}

export async function getCategories(): Promise<ServiceCategory[]> {
  await initDb();
  const sql = getDb();

  const categories = await sql`SELECT id, name, sort_order FROM service_categories ORDER BY name ASC`;
  const vendors = await sql`SELECT id, category_id, company_name, website, notes, created_at FROM service_vendors ORDER BY company_name`;
  const contacts = await sql`SELECT id, vendor_id, name, email, phone, role FROM service_contacts ORDER BY name`;

  const contactsByVendor = new Map<string, ServiceContact[]>();
  for (const c of contacts) {
    const list = contactsByVendor.get(c.vendor_id) || [];
    list.push({ id: c.id, vendorId: c.vendor_id, name: c.name, email: c.email, phone: c.phone, role: c.role });
    contactsByVendor.set(c.vendor_id, list);
  }

  const vendorsByCategory = new Map<string, ServiceVendor[]>();
  for (const v of vendors) {
    const list = vendorsByCategory.get(v.category_id) || [];
    list.push({
      id: v.id,
      categoryId: v.category_id,
      companyName: v.company_name,
      website: v.website,
      notes: v.notes,
      createdAt: v.created_at,
      contacts: contactsByVendor.get(v.id) || [],
    });
    vendorsByCategory.set(v.category_id, list);
  }

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    sortOrder: cat.sort_order,
    vendors: vendorsByCategory.get(cat.id) || [],
  }));
}

export async function upsertVendor(data: Omit<ServiceVendor, "contacts" | "createdAt">): Promise<void> {
  await initDb();
  const sql = getDb();
  const now = new Date().toISOString().split("T")[0];
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES (${data.id}, ${data.categoryId}, ${data.companyName}, ${data.website}, ${data.notes}, ${now})
    ON CONFLICT (id) DO UPDATE SET
      category_id = EXCLUDED.category_id,
      company_name = EXCLUDED.company_name,
      website = EXCLUDED.website,
      notes = EXCLUDED.notes
  `;
}

export async function deleteVendor(id: string): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`DELETE FROM service_contacts WHERE vendor_id = ${id}`;
  await sql`DELETE FROM service_vendors WHERE id = ${id}`;
}

export async function upsertContact(data: ServiceContact): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES (${data.id}, ${data.vendorId}, ${data.name}, ${data.email}, ${data.phone}, ${data.role})
    ON CONFLICT (id) DO UPDATE SET
      vendor_id = EXCLUDED.vendor_id,
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role
  `;
}

export async function deleteContact(id: string): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`DELETE FROM service_contacts WHERE id = ${id}`;
}

export async function renameCategory(id: string, name: string): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`UPDATE service_categories SET name = ${name} WHERE id = ${id}`;
}

export async function deleteCategory(id: string): Promise<void> {
  await initDb();
  const sql = getDb();
  const vendors = await sql`SELECT id FROM service_vendors WHERE category_id = ${id} LIMIT 1`;
  if (vendors.length > 0) {
    throw new Error("Cannot delete category with vendors");
  }
  await sql`DELETE FROM service_categories WHERE id = ${id}`;
}
