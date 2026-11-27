-- PostgreSQL reference schema for the OFF•PACE competition backend.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM ('ACTIVE', 'RETIRED');
CREATE TYPE user_role AS ENUM ('ATHLETE', 'ADMIN');
CREATE TYPE competition_status AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE registration_status AS ENUM ('REGISTERED', 'WITHDRAWN', 'DISQUALIFIED');
CREATE TYPE result_status AS ENUM ('PENDING', 'FINAL');
CREATE TYPE record_type AS ENUM ('ALL_TIME', 'UNIQUE');
CREATE TYPE scoring_format AS ENUM ('TIMED', 'DISTANCE', 'KNOCKOUT', 'POINTS', 'SETS');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name varchar(80) NOT NULL,
  last_name varchar(80) NOT NULL,
  employee_id varchar(40) NOT NULL UNIQUE,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  role user_role NOT NULL DEFAULT 'ATHLETE',
  department varchar(120),
  team varchar(120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE event_categories (
  id varchar(32) PRIMARY KEY,
  name varchar(80) NOT NULL,
  scoring_format scoring_format NOT NULL,
  score_label varchar(40) NOT NULL,
  score_unit varchar(24),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO event_categories (id,name,scoring_format,score_label,score_unit,description) VALUES
('HYROX','HYROX','TIMED','Finish time','time','Running and functional workout stations.'),
('CHESS','Chess','KNOCKOUT','Match score','points','Head-to-head strategy tournament.'),
('CARROM','Carrom','KNOCKOUT','Board points','points','Precision board game competition.'),
('MARATHON','Marathon','DISTANCE','Finish time','time','Distance running competition.'),
('TABLE_TENNIS','Table Tennis','KNOCKOUT','Sets','sets','Singles or doubles match tournament.'),
('ZENGA','Zenga','POINTS','Score','points','Balance and focus competition.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id varchar(32) NOT NULL REFERENCES event_categories(id),
  name varchar(180) NOT NULL,
  quarter char(2) NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  year smallint NOT NULL CHECK (year BETWEEN 2000 AND 2200),
  venue varchar(180),
  description text,
  registration_start timestamptz,
  registration_deadline timestamptz,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  status competition_status NOT NULL DEFAULT 'DRAFT',
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at IS NULL OR end_at >= start_at),
  CHECK (registration_deadline IS NULL OR registration_start IS NULL OR registration_deadline >= registration_start)
);
CREATE INDEX idx_competitions_event_quarter ON competitions(event_id, year DESC, quarter DESC);
CREATE INDEX idx_competitions_status_start ON competitions(status, start_at);

CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id),
  user_id uuid NOT NULL REFERENCES users(id),
  status registration_status NOT NULL DEFAULT 'REGISTERED',
  registered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, user_id)
);
CREATE INDEX idx_registrations_user ON registrations(user_id, registered_at DESC);

CREATE TABLE competition_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id),
  name varchar(80) NOT NULL,
  sequence_no integer NOT NULL,
  stage_type varchar(24) NOT NULL DEFAULT 'ROUND',
  status varchar(20) NOT NULL DEFAULT 'PENDING',
  UNIQUE (competition_id, sequence_no),
  UNIQUE (competition_id, name)
);

CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id),
  stage_id uuid NOT NULL REFERENCES competition_stages(id),
  round_no integer NOT NULL,
  match_no integer NOT NULL,
  scheduled_at timestamptz,
  status varchar(20) NOT NULL DEFAULT 'SCHEDULED',
  winner_user_id uuid REFERENCES users(id),
  score_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz,
  UNIQUE (stage_id, match_no)
);
CREATE INDEX idx_matches_competition_stage ON matches(competition_id, stage_id, round_no, match_no);

CREATE TABLE match_participants (
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  slot smallint NOT NULL CHECK (slot IN (1,2)),
  seed integer,
  score_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  outcome varchar(12) CHECK (outcome IN ('WIN','DRAW','LOSS','BYE')),
  PRIMARY KEY (match_id, user_id),
  UNIQUE (match_id, slot)
);

CREATE TABLE competition_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competitions(id),
  stage_id uuid REFERENCES competition_stages(id),
  user_id uuid NOT NULL REFERENCES users(id),
  rank integer CHECK (rank IS NULL OR rank > 0),
  score_text varchar(80),
  score_numeric numeric(16,4),
  score_unit varchar(24),
  result_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status result_status NOT NULL DEFAULT 'PENDING',
  updated_by uuid NOT NULL REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (competition_id, stage_id, user_id)
);
CREATE INDEX idx_results_standings ON competition_results(competition_id, stage_id, rank);
CREATE INDEX idx_results_user ON competition_results(user_id, updated_at DESC);

CREATE TABLE event_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id varchar(32) NOT NULL REFERENCES event_categories(id),
  user_id uuid NOT NULL REFERENCES users(id),
  competition_id uuid REFERENCES competitions(id),
  record_type record_type NOT NULL,
  metric_key varchar(80) NOT NULL,
  metric_label varchar(120) NOT NULL,
  value_text varchar(100),
  value_numeric numeric(16,4),
  value_unit varchar(24),
  achieved_at date NOT NULL,
  note text,
  verified_by uuid NOT NULL REFERENCES users(id),
  verified_at timestamptz NOT NULL DEFAULT now(),
  CHECK (value_text IS NOT NULL OR value_numeric IS NOT NULL),
  CHECK (record_type = 'ALL_TIME' OR competition_id IS NOT NULL)
);
CREATE UNIQUE INDEX uq_event_all_time_metric ON event_records(event_id, metric_key) WHERE record_type = 'ALL_TIME';
CREATE INDEX idx_event_records_category ON event_records(event_id, record_type, achieved_at DESC);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES users(id),
  entity_type varchar(40) NOT NULL,
  entity_id uuid NOT NULL,
  action varchar(40) NOT NULL,
  before_payload jsonb,
  after_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id, created_at DESC);
