-- Company settings table for PDF branding and business info
create table if not exists company_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  logo_url text,
  registered_name text,
  registration_number text,
  vat_number text,
  address text,
  city text,
  province text,
  postal_code text,
  country text default 'South Africa',
  email text,
  phone text,
  contact_person text,
  disclaimer_text text,
  disclaimer_text_af text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (company_id)
);

-- RLS Policies
alter table company_settings enable row level security;

create policy "Users can view own company settings"
  on company_settings
  for select
  using (
    company_id in (
      select company_id
      from company_user_relationships
      where user_id = auth.uid()
        and status = 'active'
    )
  );

create policy "Admins can insert company settings"
  on company_settings
  for insert
  with check (
    company_id in (
      select company_id
      from company_user_relationships
      where user_id = auth.uid()
        and relationship_type in ('admin', 'super_admin')
        and status = 'active'
    )
  );

create policy "Admins can update company settings"
  on company_settings
  for update
  using (
    company_id in (
      select company_id
      from company_user_relationships
      where user_id = auth.uid()
        and relationship_type in ('admin', 'super_admin')
        and status = 'active'
    )
  );

-- Add pdf columns to livestock_listings for later use
alter table livestock_listings
  add column if not exists pdf_url text,
  add column if not exists pdf_generated_at timestamptz;

-- Ensure company-logos storage bucket exists
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

-- Storage policies for company-logos bucket
do $$
begin
  create policy "company_logos_select"
    on storage.objects
    for select
    using (bucket_id = 'company-logos');

  create policy "company_logos_insert"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'company-logos'
      and exists (
        select 1
        from company_user_relationships
        where user_id = auth.uid()
          and relationship_type in ('admin', 'super_admin')
          and status = 'active'
          and company_id::text = split_part(name, '/', 1)
      )
    );

  create policy "company_logos_update"
    on storage.objects
    for update
    to authenticated
    using (
      bucket_id = 'company-logos'
      and exists (
        select 1
        from company_user_relationships
        where user_id = auth.uid()
          and relationship_type in ('admin', 'super_admin')
          and status = 'active'
          and company_id::text = split_part(name, '/', 1)
      )
    )
    with check (
      bucket_id = 'company-logos'
      and exists (
        select 1
        from company_user_relationships
        where user_id = auth.uid()
          and relationship_type in ('admin', 'super_admin')
          and status = 'active'
          and company_id::text = split_part(name, '/', 1)
      )
    );

  create policy "company_logos_delete"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'company-logos'
      and exists (
        select 1
        from company_user_relationships
        where user_id = auth.uid()
          and relationship_type in ('admin', 'super_admin')
          and status = 'active'
          and company_id::text = split_part(name, '/', 1)
      )
    );
exception
  when duplicate_object then
    null;
end $$;

