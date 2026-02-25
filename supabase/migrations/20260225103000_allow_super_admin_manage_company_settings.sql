-- Allow super_admin profiles to manage company_settings regardless of relationships.

do $$
begin
  create policy "Super admins can view company settings"
    on company_settings
    for select
    using (
      exists (
        select 1
        from profiles
        where profiles.id = auth.uid()
          and profiles.role = 'super_admin'
      )
    );

  create policy "Super admins can insert company settings"
    on company_settings
    for insert
    with check (
      exists (
        select 1
        from profiles
        where profiles.id = auth.uid()
          and profiles.role = 'super_admin'
      )
    );

  create policy "Super admins can update company settings"
    on company_settings
    for update
    using (
      exists (
        select 1
        from profiles
        where profiles.id = auth.uid()
          and profiles.role = 'super_admin'
      )
    );
exception
  when duplicate_object then
    null;
end $$;

