-- Ensure listing-pdfs storage bucket exists
insert into storage.buckets (id, name, public)
values ('listing-pdfs', 'listing-pdfs', true)
on conflict (id) do nothing;

-- Storage policies for listing-pdfs bucket
do $$
begin
  create policy "listing_pdfs_select"
    on storage.objects
    for select
    using (bucket_id = 'listing-pdfs');

  create policy "listing_pdfs_insert"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'listing-pdfs'
      and (storage.foldername(name))[1] in (
        select company_id::text
        from company_user_relationships
        where user_id = auth.uid()
      )
    );
exception
  when duplicate_object then
    null;
end $$;

