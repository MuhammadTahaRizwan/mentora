-- ─────────────────────────────────────────────────────────────────────────────
-- Mentora CRM — Supabase Schema
-- Run this once in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop existing tables (clean slate)
drop table if exists attendance cascade;
drop table if exists notifications cascade;
drop table if exists messages cascade;
drop table if exists documents cascade;
drop table if exists applications cascade;
drop table if exists students cascade;
drop table if exists consultant_profiles cascade;
drop table if exists users cascade;

-- ── Users ─────────────────────────────────────────────────────────────────────
create table users (
  id          text primary key,
  name        text not null,
  email       text not null unique,
  password    text not null,
  role        text not null check (role in ('admin', 'consultant', 'student')),
  phone       text,
  created_at  text not null
);

-- ── Consultant Profiles ───────────────────────────────────────────────────────
create table consultant_profiles (
  id                  text primary key,
  user_id             text references users(id) on delete cascade,
  name                text not null,
  email               text not null,
  phone               text,
  assigned_countries  text[] default '{}',
  status              text default 'active' check (status in ('active','inactive')),
  specialization      text,
  performance_score   int  default 75
);

-- ── Students ──────────────────────────────────────────────────────────────────
create table students (
  id                  text primary key,
  user_id             text references users(id) on delete cascade,
  consultant_id       text references users(id) on delete set null,
  name                text not null,
  email               text not null,
  phone               text,
  nationality         text default 'Pakistani',
  passport_number     text,
  date_of_birth       text,
  selected_country    text,
  target_countries    text[] default '{}',
  intended_program    text,
  target_intake       text,
  education_level     text,
  gpa                 text,
  english_score       text,
  notes               text,
  status              text default 'active',
  onboarding_complete boolean default false,
  created_at          text not null
);

-- ── Applications ──────────────────────────────────────────────────────────────
create table applications (
  id            text primary key,
  student_id    text references students(id) on delete cascade,
  university    text not null,
  country       text not null,
  program       text not null,
  status        text default 'in_progress',
  deadline      text,
  decision_date text,
  notes         text,
  tuition_fee   text,
  scholarship   text,
  created_at    text not null,
  updated_at    text not null
);

-- ── Documents ─────────────────────────────────────────────────────────────────
create table documents (
  id               text primary key,
  student_id       text references students(id) on delete cascade,
  type             text not null,
  name             text not null,
  file_url         text default '#',
  status           text default 'pending',
  consultant_note  text,
  size             text,
  uploaded_at      text not null,
  reviewed_at      text
);

-- ── Messages ──────────────────────────────────────────────────────────────────
create table messages (
  id           text primary key,
  sender_id    text references users(id) on delete cascade,
  receiver_id  text references users(id) on delete cascade,
  content      text not null,
  read         boolean default false,
  timestamp    text not null
);

-- ── Notifications ─────────────────────────────────────────────────────────────
create table notifications (
  id          text primary key,
  user_id     text references users(id) on delete cascade,
  title       text not null,
  message     text not null,
  type        text default 'info',
  read        boolean default false,
  link        text,
  created_at  text not null
);

-- ── Attendance ────────────────────────────────────────────────────────────────
create table attendance (
  id             text primary key,
  consultant_id  text references users(id) on delete cascade,
  date           text not null,
  status         text not null check (status in ('present','absent','late')),
  notes          text,
  marked_at      text not null,
  unique(consultant_id, date)
);

-- ── Disable RLS (app handles auth) ───────────────────────────────────────────
alter table users               disable row level security;
alter table consultant_profiles disable row level security;
alter table students            disable row level security;
alter table applications        disable row level security;
alter table documents           disable row level security;
alter table messages            disable row level security;
alter table notifications       disable row level security;
alter table attendance          disable row level security;

-- ── Enable Realtime ───────────────────────────────────────────────────────────
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table applications;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table attendance;
