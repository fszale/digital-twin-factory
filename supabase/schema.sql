create extension if not exists pgcrypto;

create table if not exists platform_users (
  auth_user_id uuid primary key,
  email text null,
  role text not null check (role in ('super_admin', 'twin_owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deployment_access (
  id uuid primary key default gen_random_uuid(),
  deployment_id text not null,
  auth_user_id uuid not null,
  role text not null default 'owner' check (role in ('owner')),
  created_at timestamptz not null default now(),
  unique (deployment_id, auth_user_id)
);

create table if not exists deployment_configs (
  deployment_id text primary key,
  factory_id text not null,
  digital_twin_id text not null,
  display_name text null,
  analysis_only boolean not null default true,
  preferred_model_provider text not null check (preferred_model_provider in ('openai', 'xai')),
  preferred_model text not null,
  preferred_model_profile text not null,
  fallback_model_provider text null check (fallback_model_provider in ('openai', 'xai')),
  fallback_model text null,
  allowed_models jsonb not null default '[]'::jsonb,
  enabled_channels jsonb not null default '[]'::jsonb,
  daily_token_limit bigint null,
  max_cost_per_day double precision null,
  alert_at_pct double precision null,
  requested_human_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  factory_id text not null,
  workspace_id text null,
  deployment_id text not null,
  channel_type text not null,
  requester_id text not null,
  status text not null,
  title text null,
  external_thread_ref text null,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  direction text not null,
  author_type text not null,
  author_id text not null,
  body text not null,
  structured_payload jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  job_id text not null,
  deployment_id text not null,
  conversation_id uuid not null references conversations(id) on delete cascade,
  status text not null,
  model_provider text null check (model_provider in ('openai', 'xai')),
  model_profile text null,
  model_name text null,
  usefulness_score double precision null,
  score_confidence double precision null,
  started_at timestamptz null,
  completed_at timestamptz null
);

create table if not exists conversation_summaries (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  deployment_id text not null,
  source_run_id uuid null references runs(id) on delete set null,
  summary_type text not null,
  content text not null,
  open_questions jsonb not null default '[]'::jsonb,
  recommended_next_steps jsonb not null default '[]'::jsonb,
  confidence_score double precision null,
  is_handoff_ready boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists hitl_escalations (
  id uuid primary key default gen_random_uuid(),
  deployment_id text not null,
  conversation_id uuid not null references conversations(id) on delete cascade,
  job_id text null,
  run_id uuid null references runs(id) on delete set null,
  conversation_summary_id uuid null references conversation_summaries(id) on delete set null,
  status text not null,
  reason_code text not null,
  requested_human_id text null,
  delivery_status text not null,
  response_due_at timestamptz null,
  resolution_summary text null,
  resolved_by_auth_user_id uuid null,
  resolved_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  escalation_id uuid not null references hitl_escalations(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  channel_type text not null,
  recipient_ref text null,
  status text not null,
  sent_at timestamptz null,
  failed_at timestamptz null,
  failure_reason text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversations_deployment_id on conversations(deployment_id);
create index if not exists idx_platform_users_role on platform_users(role);
create index if not exists idx_deployment_access_auth_user_id on deployment_access(auth_user_id);
create index if not exists idx_deployment_configs_factory_id on deployment_configs(factory_id);
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_runs_conversation_id on runs(conversation_id);
create index if not exists idx_summaries_conversation_id on conversation_summaries(conversation_id);
create index if not exists idx_hitl_escalations_deployment_id on hitl_escalations(deployment_id);
create index if not exists idx_notification_deliveries_escalation_id on notification_deliveries(escalation_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_platform_users_updated_at on platform_users;
create trigger set_platform_users_updated_at
before update on platform_users
for each row execute function set_updated_at();

drop trigger if exists set_deployment_configs_updated_at on deployment_configs;
create trigger set_deployment_configs_updated_at
before update on deployment_configs
for each row execute function set_updated_at();

drop trigger if exists set_hitl_escalations_updated_at on hitl_escalations;
create trigger set_hitl_escalations_updated_at
before update on hitl_escalations
for each row execute function set_updated_at();
