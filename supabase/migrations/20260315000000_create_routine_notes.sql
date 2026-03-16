CREATE TABLE IF NOT EXISTS routine_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'evening')),
  skin_condition TEXT NOT NULL DEFAULT '',
  products_used TEXT[] DEFAULT '{}',
  observations TEXT NOT NULL DEFAULT '',
  mood TEXT,
  weather TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routine_notes_user_id ON routine_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_notes_created_at ON routine_notes(created_at);

ALTER TABLE routine_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON routine_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON routine_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON routine_notes FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_routine_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER routine_notes_updated_at
  BEFORE UPDATE ON routine_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_routine_notes_updated_at();
