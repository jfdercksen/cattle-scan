-- Allow authenticated users to manage files in the farm-documents bucket
do $$
begin
  -- Insert policy
  create policy "farm_documents_insert"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'farm-documents' and auth.uid() is not null);

  -- Select policy
  create policy "farm_documents_select"
    on storage.objects
    for select
    to authenticated
    using (bucket_id = 'farm-documents');

  -- Update policy
  create policy "farm_documents_update"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'farm-documents')
    with check (bucket_id = 'farm-documents');

  -- Delete policy
  create policy "farm_documents_delete"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'farm-documents');
exception
  when duplicate_object then
    -- Policies already exist; ignore
    null;
end $$;

