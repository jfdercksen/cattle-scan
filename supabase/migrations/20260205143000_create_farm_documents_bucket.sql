-- Create farm-documents storage bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('farm-documents', 'farm-documents', true)
on conflict (id) do nothing;

