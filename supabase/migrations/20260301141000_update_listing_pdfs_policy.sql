-- Allow admins/super_admins to insert listing PDFs

do $$
begin
  drop policy if exists "listing_pdfs_insert" on storage.objects;

  create policy "listing_pdfs_insert"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'listing-pdfs'
      and (
        (storage.foldername(name))[1] in (
          select company_id::text
          from company_user_relationships
          where user_id = auth.uid()
        )
        or exists (
          select 1
          from companies c
          where c.id::text = (storage.foldername(name))[1]
            and c.admin_user_id = auth.uid()
        )
        or exists (
          select 1
          from profiles p
          where p.id = auth.uid()
            and p.role = 'super_admin'
        )
      )
    );
exception
  when duplicate_object then
    null;
end $$;

