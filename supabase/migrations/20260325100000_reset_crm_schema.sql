drop trigger if exists on_auth_user_created on auth.users;

drop trigger if exists trg_lowercase_email_contacts on public.contacts;
drop trigger if exists trg_lowercase_email_invitations on public.invitations;

drop function if exists public.handle_new_user();
drop function if exists public.current_user_role() cascade;
drop function if exists public.format_email_lowercase_fn();

drop table if exists public.activities cascade;
drop table if exists public.deals cascade;
drop table if exists public.contacts cascade;
drop table if exists public.companies cascade;
drop table if exists public.invitations cascade;
drop table if exists public.profiles cascade;

drop type if exists public.activity_type cascade;
drop type if exists public.contact_status cascade;
drop type if exists public.deal_stage cascade;
drop type if exists public.user_role cascade;

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create type public.user_role as enum ('superadmin', 'admin', 'user');

create type public.deal_stage as enum (
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

create type public.contact_status as enum (
  'lead',
  'opportunity',
  'customer',
  'unqualified',
  'blacklisted'
);

create type public.activity_type as enum (
  'call',
  'email',
  'meeting',
  'note',
  'task_reminder'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'user',
  full_name text,
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  name text not null,
  domain text,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  company_id uuid references public.companies(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null check (length(trim(email)) > 0),
  phone text,
  status public.contact_status not null default 'lead',
  created_at timestamptz not null default now(),
  unique(user_id, email)
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  stage public.deal_stage not null default 'prospecting',
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  type public.activity_type not null,
  title text not null,
  description text,
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  role public.user_role not null default 'admin',
  invited_by uuid references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create or replace function public.format_email_lowercase_fn()
returns trigger
language plpgsql
as $$
begin
  if new.email is not null then
    new.email = lower(trim(new.email));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_lowercase_email_contacts on public.contacts;
create trigger trg_lowercase_email_contacts
before insert or update on public.contacts
for each row execute function public.format_email_lowercase_fn();

drop trigger if exists trg_lowercase_email_invitations on public.invitations;
create trigger trg_lowercase_email_invitations
before insert or update on public.invitations
for each row execute function public.format_email_lowercase_fn();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role public.user_role;
begin
  select i.role
  into target_role
  from public.invitations i
  where i.email = lower(new.email)
    and i.accepted_at is null
    and i.expires_at > now()
  limit 1;

  if target_role is null then
    target_role := 'user';
  else
    update public.invitations
    set accepted_at = now()
    where email = lower(new.email)
      and accepted_at is null;
  end if;

  insert into public.profiles(id, role, full_name)
  values (
    new.id,
    target_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User')
  )
  on conflict (id)
  do update set
    full_name = excluded.full_name,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create unique index if not exists idx_active_invitation_email
on public.invitations (email)
where accepted_at is null;

create index if not exists idx_companies_user on public.companies(user_id);
create index if not exists idx_contacts_user on public.contacts(user_id);
create index if not exists idx_contacts_company on public.contacts(company_id);
create index if not exists idx_deals_user on public.deals(user_id);
create index if not exists idx_deals_contact on public.deals(contact_id);
create index if not exists idx_activities_user on public.activities(user_id);
create index if not exists idx_activities_contact on public.activities(contact_id);
create index if not exists idx_activities_deal on public.activities(deal_id);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.invitations enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select
using (auth.uid() = id or public.current_user_role() = 'superadmin');

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update
using (auth.uid() = id or public.current_user_role() = 'superadmin')
with check (auth.uid() = id or public.current_user_role() = 'superadmin');

drop policy if exists companies_manage on public.companies;
create policy companies_manage on public.companies
for all
using (auth.uid() = user_id or public.current_user_role() = 'superadmin')
with check (auth.uid() = user_id or public.current_user_role() = 'superadmin');

drop policy if exists contacts_manage on public.contacts;
create policy contacts_manage on public.contacts
for all
using (auth.uid() = user_id or public.current_user_role() = 'superadmin')
with check (auth.uid() = user_id or public.current_user_role() = 'superadmin');

drop policy if exists deals_manage on public.deals;
create policy deals_manage on public.deals
for all
using (auth.uid() = user_id or public.current_user_role() = 'superadmin')
with check (auth.uid() = user_id or public.current_user_role() = 'superadmin');

drop policy if exists activities_manage on public.activities;
create policy activities_manage on public.activities
for all
using (auth.uid() = user_id or public.current_user_role() = 'superadmin')
with check (auth.uid() = user_id or public.current_user_role() = 'superadmin');

drop policy if exists invitations_superadmin_manage on public.invitations;
create policy invitations_superadmin_manage on public.invitations
for all to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');
