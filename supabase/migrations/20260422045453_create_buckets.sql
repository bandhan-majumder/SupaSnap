insert into storage.buckets (id, name, public)
values ('user_media', 'user_media', false)
on conflict (id) do nothing;

create policy "Users can access their own images"
on storage.objects
as permissive
for all
to authenticated
using (
  bucket_id = 'user_media'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'user_media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);