-- Allow admin/super_admin company members to delete relationships in their company

do $$
begin
  create policy "Admins can delete company user relationships"
    on company_user_relationships
    for delete
    using (
      company_id in (
        select company_id
        from company_user_relationships
        where user_id = auth.uid()
          and relationship_type in ('admin', 'super_admin')
          and status = 'active'
      )
    );
exception
  when duplicate_object then
    null;
end $$;

