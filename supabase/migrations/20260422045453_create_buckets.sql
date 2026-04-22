-- Private bucket for user-specific avatar images

insert into storage.buckets (id, name, public)
values ('user_images', 'user_images', false)
on conflict (id) do nothing;

-- Users can only access files inside their own folder:
-- user_images/{user_id}/...

create policy "Users can access their own images"
on storage.objects
as permissive
for all
to authenticated
using (
  bucket_id = 'user_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'user_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);