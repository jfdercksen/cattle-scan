-- Allow company admins (companies.admin_user_id) to manage company_settings
-- in addition to company_user_relationships-based access.

do $$
begin
  create policy "Company admins can view company settings"
    on company_settings
    for select
    using (
      exists (
        select 1
        from companies
        where companies.id = company_settings.company_id
          and companies.admin_user_id = auth.uid()
      )
    );

  create policy "Company admins can insert company settings"
    on company_settings
    for insert
    with check (
      exists (
        select 1
        from companies
        where companies.id = company_settings.company_id
          and companies.admin_user_id = auth.uid()
      )
    );

  create policy "Company admins can update company settings"
    on company_settings
    for update
    using (
      exists (
        select 1
        from companies
        where companies.id = company_settings.company_id
          and companies.admin_user_id = auth.uid()
      )
    );
exception
  when duplicate_object then
    null;
end $$;

