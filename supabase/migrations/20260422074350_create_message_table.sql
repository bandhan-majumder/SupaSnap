CREATE TYPE public.message_content_type AS ENUM ('text', 'media');
CREATE TYPE public.media_type AS ENUM ('video', 'image');

CREATE TABLE public.messages (
  id         uuid                        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    uuid                        NOT NULL REFERENCES public.chat_rooms(id)  ON DELETE CASCADE,
  sender_id  uuid                        NOT NULL REFERENCES public.profiles(id)    ON DELETE CASCADE,
  type       public.message_content_type DEFAULT 'text',
  content    text                        NOT NULL,
  media_type public.media_type,
  seen_at    timestamptz,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz                 DEFAULT now(),
  updated_at timestamptz                 DEFAULT now()
);

CREATE INDEX ON public.messages (room_id, created_at DESC);
CREATE INDEX ON public.messages (expires_at) WHERE expires_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.broadcast_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, realtime  -- ← include both schemas
AS $$
BEGIN
  PERFORM realtime.send(
    pg_catalog.json_build_object(   -- ← fully qualify just to be safe
      'id',         NEW.id,
      'room_id',    NEW.room_id,
      'sender_id',  NEW.sender_id,
      'type',       NEW.type,
      'content',    NEW.content,
      'media_type', NEW.media_type,
      'seen_at',    NEW.seen_at,
      'expires_at', NEW.expires_at,
      'deleted_at', NEW.deleted_at,
      'created_at', NEW.created_at,
      'updated_at', NEW.updated_at
    )::jsonb,
    'new_message',
    'room:' || NEW.room_id::text || ':messages',
     false -- make it "true" when private 
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER broadcast_new_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_new_message();
  
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room participants can view messages."
ON public.messages
FOR SELECT TO authenticated
USING (
  public.is_room_participant(room_id)
  AND (expires_at IS NULL OR expires_at > now())
  AND deleted_at IS NULL
);

CREATE POLICY "Participants can send messages."
ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND public.is_room_participant(room_id)
);

CREATE POLICY "Sender can update their message."
ON public.messages
FOR UPDATE TO authenticated
USING (sender_id = (SELECT auth.uid()))
WITH CHECK (sender_id = (SELECT auth.uid()));

CREATE POLICY "Recipient can mark message as seen."
ON public.messages
FOR UPDATE TO authenticated
USING (public.is_room_participant(room_id))
WITH CHECK (public.is_room_participant(room_id));