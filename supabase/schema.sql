-- =====================================================
-- Fire-SA: نظام إدارة طفايات الحريق
-- =====================================================

create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null default 'inspector' check (role in ('admin', 'inspector')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'inspector');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.areas (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null default '',
  assigned_inspector_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.fire_extinguishers (
  id uuid primary key default uuid_generate_v4(),
  area_id uuid not null references public.areas(id) on delete cascade,
  serial_number text not null unique,
  type text not null default 'ABC' check (type in ('ABC', 'CO2', 'foam', 'water', 'other')),
  capacity text not null default '6kg',
  location_description text not null default '',
  installation_date date,
  next_service_date date,
  status text not null default 'active' check (status in ('active', 'needs_service', 'retired')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.inspections (
  id uuid primary key default uuid_generate_v4(),
  extinguisher_id uuid not null references public.fire_extinguishers(id) on delete cascade,
  inspector_id uuid not null references public.profiles(id) on delete restrict,
  inspection_date timestamptz not null default now(),
  pressure_ok boolean not null default true,
  seal_intact boolean not null default true,
  label_readable boolean not null default true,
  pin_intact boolean not null default true,
  no_damage boolean not null default true,
  overall_status text not null default 'passed' check (overall_status in ('passed', 'failed', 'needs_attention')),
  notes text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.fire_extinguishers enable row level security;
alter table public.inspections enable row level security;

create policy "profiles_read_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_admin_read_all" on public.profiles for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "areas_admin_all" on public.areas for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "areas_inspector_read" on public.areas for select using (assigned_inspector_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "extinguishers_admin_all" on public.fire_extinguishers for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "extinguishers_inspector_read" on public.fire_extinguishers for select using (exists (select 1 from public.areas where id = fire_extinguishers.area_id and (assigned_inspector_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))));
create policy "extinguishers_inspector_update" on public.fire_extinguishers for update using (exists (select 1 from public.areas where id = fire_extinguishers.area_id and assigned_inspector_id = auth.uid()));
create policy "inspections_admin_all" on public.inspections for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "inspections_inspector_own" on public.inspections for select using (inspector_id = auth.uid());
create policy "inspections_inspector_insert" on public.inspections for insert with check (inspector_id = auth.uid());

-- After creating first admin user, run:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-id';
