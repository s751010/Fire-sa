-- =====================================================
-- Fire-SA: نظام إدارة طفايات الحريق
-- =====================================================

create extension if not exists "uuid-ossp";

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null default 'inspector' check (role in ('admin', 'inspector')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'inspector')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- AREAS (المناطق)
-- =====================================================
create table public.areas (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null default '',
  assigned_inspector_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- FIRE EXTINGUISHERS & HOSES (المعدات)
-- =====================================================
create table public.fire_extinguishers (
  id uuid primary key default uuid_generate_v4(),
  area_id uuid not null references public.areas(id) on delete cascade,
  serial_number text not null unique,
  type text not null default 'ABC' check (type in ('ABC', 'CO2', 'foam', 'water', 'hose', 'other')),
  capacity text not null default '',
  location_description text not null default '',
  installation_date date,
  next_service_date date,
  status text not null default 'active' check (status in ('active', 'needs_service', 'retired')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- INSPECTIONS (الفحوصات)
-- =====================================================
create table public.inspections (
  id uuid primary key default uuid_generate_v4(),
  extinguisher_id uuid not null references public.fire_extinguishers(id) on delete cascade,
  inspector_id uuid not null references public.profiles(id) on delete restrict,
  inspection_date timestamptz not null default now(),
  pressure_ok boolean,
  seal_intact boolean,
  label_readable boolean,
  pin_intact boolean,
  no_damage boolean,
  overall_status text not null default 'passed'
    check (overall_status in ('passed', 'failed', 'needs_attention')),
  notes text,
  created_at timestamptz default now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.fire_extinguishers enable row level security;
alter table public.inspections enable row level security;

-- Helper function: is current user admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$ language sql security definer stable;

-- PROFILES
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- AREAS: admins full access, inspectors see their assigned areas
create policy "areas_admin_all" on public.areas
  for all using (public.is_admin());

create policy "areas_inspector_read" on public.areas
  for select using (assigned_inspector_id = auth.uid());

-- FIRE EXTINGUISHERS
create policy "extinguishers_admin_all" on public.fire_extinguishers
  for all using (public.is_admin());

create policy "extinguishers_inspector_read" on public.fire_extinguishers
  for select using (
    exists (
      select 1 from public.areas
      where id = fire_extinguishers.area_id
      and assigned_inspector_id = auth.uid()
    )
  );

create policy "extinguishers_inspector_update_status" on public.fire_extinguishers
  for update using (
    exists (
      select 1 from public.areas
      where id = fire_extinguishers.area_id
      and assigned_inspector_id = auth.uid()
    )
  );

-- INSPECTIONS
create policy "inspections_admin_all" on public.inspections
  for all using (public.is_admin());

create policy "inspections_inspector_read" on public.inspections
  for select using (
    inspector_id = auth.uid()
    or exists (
      select 1 from public.fire_extinguishers fe
      join public.areas a on a.id = fe.area_id
      where fe.id = inspections.extinguisher_id
      and a.assigned_inspector_id = auth.uid()
    )
  );

create policy "inspections_inspector_insert" on public.inspections
  for insert with check (inspector_id = auth.uid());

-- =====================================================
-- SETUP NOTES
-- =====================================================
-- 1. Run this schema in Supabase SQL Editor
-- 2. Run supabase/seed.sql to import all 358 equipment items
-- 3. Create users via Supabase Auth (Authentication > Users):
--
--    رمزي الراجحي    → email: ramzi@company.com    → then: UPDATE profiles SET role='admin', full_name='رمزي الراجحي' WHERE id='...';
--    سياف الهذلي     → email: sayaf@company.com    → then: UPDATE profiles SET role='admin', full_name='سياف الهذلي' WHERE id='...';
--    ديمة المالكي    → email: dima@company.com     → full_name='ديمة المالكي'
--    محمود الخولي   → email: mahmoud@company.com  → full_name='محمود الخولي'
--    نوف اسماعيل    → email: nouf@company.com     → full_name='نوف اسماعيل'
--    زراع الدالي    → email: zara@company.com     → full_name='زراع الدالي'
--
-- 4. Assign areas to inspectors via the app (/admin/inspectors)
