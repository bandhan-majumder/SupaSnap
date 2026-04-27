CREATE TABLE public.chat_rooms (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  status     text        NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'blocked', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.chat_room_participants (
  room_id    uuid        NOT NULL REFERENCES public.chat_rooms(id)  ON DELETE CASCADE,
  profile_id uuid        NOT NULL REFERENCES public.profiles(id)    ON DELETE CASCADE,
  joined_at  timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, profile_id)
);

CREATE INDEX ON public.chat_room_participants (profile_id);

CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_room_participant(p_room_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_room_participants
    WHERE room_id    = p_room_id
      AND profile_id = (SELECT auth.uid())
  );
$$;

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their chat rooms."
ON public.chat_rooms
FOR SELECT TO authenticated
USING (public.is_room_participant(id));

CREATE POLICY "Authenticated users can create chat rooms."
ON public.chat_rooms
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Participants can update their chat rooms."
ON public.chat_rooms
FOR UPDATE TO authenticated
USING (public.is_room_participant(id))
WITH CHECK (public.is_room_participant(id));

ALTER TABLE public.chat_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view room members."
ON public.chat_room_participants
FOR SELECT TO authenticated
USING (public.is_room_participant(room_id));

CREATE POLICY "Authenticated users can add participants."
ON public.chat_room_participants
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Participants can update room members in their rooms."
ON public.chat_room_participants
FOR UPDATE TO authenticated
USING (public.is_room_participant(room_id))
WITH CHECK (public.is_room_participant(room_id));