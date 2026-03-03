-- Create listing-documents storage bucket for listing attachments
insert into storage.buckets (id, name, public)
values ('listing-documents', 'listing-documents', true)
on conflict (id) do nothing;

-- Allow authenticated users to manage files in the listing-documents bucket
do $$
begin
  create policy "listing_documents_insert"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'listing-documents' and auth.uid() is not null);

  create policy "listing_documents_select"
    on storage.objects
    for select
    to authenticated
    using (bucket_id = 'listing-documents');

  create policy "listing_documents_update"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'listing-documents')
    with check (bucket_id = 'listing-documents');

  create policy "listing_documents_delete"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'listing-documents');
exception
  when duplicate_object then
    null;
end $$;

