-- Migration: Add preferences column to profiles
ALTER TABLE public.profiles
ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
