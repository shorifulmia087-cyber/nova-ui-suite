
ALTER TABLE public.task_completions
  ADD COLUMN IF NOT EXISTS completion_date date NOT NULL
  DEFAULT ((now() AT TIME ZONE 'Asia/Dhaka')::date);

ALTER TABLE public.task_completions
  DROP CONSTRAINT IF EXISTS task_completions_user_id_task_id_key;

ALTER TABLE public.task_completions
  ADD CONSTRAINT task_completions_user_task_date_key
  UNIQUE (user_id, task_id, completion_date);

CREATE INDEX IF NOT EXISTS idx_task_completions_user_date
  ON public.task_completions (user_id, completion_date);
