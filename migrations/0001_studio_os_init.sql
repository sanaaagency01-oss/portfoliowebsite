-- ========================================================
-- Baysaass Studio OS - Cloudflare D1 Migration
-- File: migrations/0001_studio_os_init.sql
-- Description: Initializes core tables for Studio OS Projects & Metadata
-- ========================================================

-- 1. Studio Projects Table (Төслүүд, бриф, гэрээ, таск, нэхэмжлэх)
CREATE TABLE IF NOT EXISTS studio_projects (
  token TEXT PRIMARY KEY,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  status TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for fast status filtering (Lead, Brief, Proposal, Active, Completed)
CREATE INDEX IF NOT EXISTS idx_studio_projects_status ON studio_projects(status);

-- Index for fast sorting by updated date
CREATE INDEX IF NOT EXISTS idx_studio_projects_updated_at ON studio_projects(updated_at);

-- 2. Studio Meta Table (Системийн тохиргоо, бүртгэлийн кэш)
CREATE TABLE IF NOT EXISTS studio_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
