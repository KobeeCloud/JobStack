-- =====================================================-- =====================================================-- JobStack - Visual Infrastructure Planning Tool

-- JobStack - Visual Infrastructure Planning Tool

-- Database Schema for Supabase-- JobStack - Visual Infrastructure Planning Tool-- Database Schema for Supabase

-- =====================================================

-- -- Database Schema for Supabase-- Run this SQL in your Supabase SQL Editor

-- INSTRUCTIONS:

-- 1. Go to Supabase Dashboard → SQL Editor-- =====================================================

-- 2. Copy and paste this entire file

-- 3. Click "Run" to execute-- -- Enable UUID extension

-- =====================================================

-- INSTRUCTIONS:CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable required extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";-- 1. Go to Supabase Dashboard → SQL Editor



-- =====================================================-- 2. Copy and paste this entire file-- =====================================================

-- COMPLETE CLEANUP

-- Drop everything in correct order (dependencies first)-- 3. Click "Run" to execute-- CLEAN UP (Safe - no errors if objects don't exist)

-- =====================================================

-- -- =====================================================

-- Drop all policies first

DO $$-- This script will:

DECLARE

    pol RECORD;-- - Drop ALL existing tables, policies, triggers, functions-- Drop triggers (safe - IF EXISTS prevents errors)

BEGIN

    FOR pol IN -- - Create fresh tables with proper structureDO $$

        SELECT schemaname, tablename, policyname

        FROM pg_policies -- - Set up RLS (Row Level Security) policiesBEGIN

        WHERE schemaname = 'public'

    LOOP-- - Insert seed data (templates)    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',

            pol.policyname, pol.schemaname, pol.tablename);-- =====================================================    DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;

    END LOOP;

END $$;    DROP TRIGGER IF EXISTS set_diagrams_updated_at ON public.diagrams;



-- Drop triggers safely-- Enable required extensions    DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;

DO $$

BEGINCREATE EXTENSION IF NOT EXISTS "uuid-ossp";EXCEPTION

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

EXCEPTION    WHEN undefined_table THEN NULL;

    WHEN undefined_table THEN NULL;

    WHEN undefined_object THEN NULL;-- =====================================================    WHEN undefined_object THEN NULL;

END $$;

-- COMPLETE CLEANUPEND $$;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;

DROP TRIGGER IF EXISTS set_diagrams_updated_at ON public.diagrams;-- Drop everything in correct order (dependencies first)

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;

-- =====================================================-- Drop functions

-- Drop functions

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Step 1: Drop all policies first (they depend on tables)DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Drop tables in correct order (children first)

DROP TABLE IF EXISTS public.exports CASCADE;DO $$

DROP TABLE IF EXISTS public.project_shares CASCADE;

DROP TABLE IF EXISTS public.template_nodes CASCADE;DECLARE-- Drop tables

DROP TABLE IF EXISTS public.templates CASCADE;

DROP TABLE IF EXISTS public.diagrams CASCADE;    pol RECORD;DROP TABLE IF EXISTS public.exports CASCADE;

DROP TABLE IF EXISTS public.projects CASCADE;

DROP TABLE IF EXISTS public.profiles CASCADE;BEGINDROP TABLE IF EXISTS public.project_shares CASCADE;



-- =====================================================    FOR pol IN DROP TABLE IF EXISTS public.templates CASCADE;

-- CREATE TABLES

-- =====================================================        SELECT schemaname, tablename, policyname DROP TABLE IF EXISTS public.diagrams CASCADE;



-- Profiles table (extends Supabase auth.users)        FROM pg_policies DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.profiles (

    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,        WHERE schemaname = 'public'DROP TABLE IF EXISTS public.profiles CASCADE;

    email TEXT NOT NULL,

    full_name TEXT,    LOOP

    avatar_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', -- =====================================================

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);            pol.policyname, pol.schemaname, pol.tablename);-- CREATE TABLES



-- Projects table    END LOOP;-- =====================================================

CREATE TABLE public.projects (

    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,END $$;

    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

    name TEXT NOT NULL,-- Profiles table (extends Supabase auth.users)

    description TEXT,

    cloud_provider TEXT DEFAULT 'aws' CHECK (cloud_provider IN ('aws', 'azure', 'gcp', 'multi')),-- Step 2: Drop all triggersCREATE TABLE public.profiles (

    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),

    settings JSONB DEFAULT '{}',DO $$  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()DECLARE  email TEXT NOT NULL,

);

    trig RECORD;  full_name TEXT,

-- Diagrams table (stores React Flow diagram data)

CREATE TABLE public.diagrams (BEGIN  avatar_url TEXT,

    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,    FOR trig IN   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    name TEXT NOT NULL DEFAULT 'Main Diagram',

    nodes JSONB DEFAULT '[]',        SELECT trigger_name, event_object_table   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

    edges JSONB DEFAULT '[]',

    viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}',        FROM information_schema.triggers );

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()        WHERE trigger_schema = 'public'

);

    LOOP-- Projects table

-- Templates table

CREATE TABLE public.templates (        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', CREATE TABLE public.projects (

    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    name TEXT NOT NULL,            trig.trigger_name, trig.event_object_table);  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    description TEXT,

    category TEXT NOT NULL,    END LOOP;  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    cloud_provider TEXT NOT NULL CHECK (cloud_provider IN ('aws', 'azure', 'gcp', 'multi')),

    nodes JSONB DEFAULT '[]',END $$;  name TEXT NOT NULL,

    edges JSONB DEFAULT '[]',

    is_public BOOLEAN DEFAULT true,  description TEXT,

    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()-- Also drop auth trigger if exists  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Project shares table (for collaboration)

CREATE TABLE public.project_shares ();

    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,-- Step 3: Drop all functions

    shared_with_email TEXT NOT NULL,

    permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;-- Diagrams table (stores React Flow diagram state)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(project_id, shared_with_email)DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;CREATE TABLE public.diagrams (

);

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

-- Exports table (track generated exports)

CREATE TABLE public.exports (-- Step 4: Drop all tables (CASCADE handles foreign keys)  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,DROP TABLE IF EXISTS public.exports CASCADE;  name TEXT NOT NULL DEFAULT 'Untitled Diagram',

    export_type TEXT NOT NULL CHECK (export_type IN ('terraform', 'cloudformation', 'pulumi', 'png', 'svg', 'json')),

    file_url TEXT,DROP TABLE IF EXISTS public.project_shares CASCADE;  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,

    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()DROP TABLE IF EXISTS public.templates CASCADE;  thumbnail_url TEXT,

);

DROP TABLE IF EXISTS public.diagrams CASCADE;  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

-- =====================================================

-- INDEXESDROP TABLE IF EXISTS public.projects CASCADE;  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- =====================================================

DROP TABLE IF EXISTS public.profiles CASCADE;);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

CREATE INDEX idx_diagrams_project_id ON public.diagrams(project_id);

CREATE INDEX idx_templates_category ON public.templates(category);

CREATE INDEX idx_templates_cloud_provider ON public.templates(cloud_provider);-- =====================================================-- Templates table (pre-built architecture templates)

CREATE INDEX idx_project_shares_project_id ON public.project_shares(project_id);

CREATE INDEX idx_exports_project_id ON public.exports(project_id);-- CREATE TABLESCREATE TABLE public.templates (



-- =====================================================-- =====================================================  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

-- ROW LEVEL SECURITY (RLS)

-- =====================================================  name TEXT NOT NULL,



-- Enable RLS on all tables-- Profiles table (extends Supabase auth.users)  description TEXT,

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;CREATE TABLE public.profiles (  category TEXT NOT NULL CHECK (category IN ('startup', 'enterprise', 'microservices', 'side-project', 'gaming')),

ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,

ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;    email TEXT NOT NULL,  thumbnail_url TEXT,



-- Profiles policies    full_name TEXT DEFAULT '',  is_public BOOLEAN DEFAULT true,

CREATE POLICY "Users can view own profile" ON public.profiles

    FOR SELECT USING (auth.uid() = id);    avatar_url TEXT DEFAULT '',  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,



CREATE POLICY "Users can update own profile" ON public.profiles    created_at TIMESTAMPTZ DEFAULT NOW(),  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

    FOR UPDATE USING (auth.uid() = id);

    updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE POLICY "Users can insert own profile" ON public.profiles

    FOR INSERT WITH CHECK (auth.uid() = id););



-- Projects policies-- Project shares table (for collaboration)

CREATE POLICY "Users can view own projects" ON public.projects

    FOR SELECT USING (auth.uid() = user_id);-- Projects tableCREATE TABLE public.project_shares (



CREATE POLICY "Users can create projects" ON public.projectsCREATE TABLE public.projects (  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    FOR INSERT WITH CHECK (auth.uid() = user_id);

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

CREATE POLICY "Users can update own projects" ON public.projects

    FOR UPDATE USING (auth.uid() = user_id);    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,  shared_with_email TEXT NOT NULL,



CREATE POLICY "Users can delete own projects" ON public.projects    name TEXT NOT NULL,  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),

    FOR DELETE USING (auth.uid() = user_id);

    description TEXT,  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

-- Diagrams policies

CREATE POLICY "Users can view diagrams of own projects" ON public.diagrams    created_at TIMESTAMPTZ DEFAULT NOW(),  UNIQUE(project_id, shared_with_email)

    FOR SELECT USING (

        EXISTS (    updated_at TIMESTAMPTZ DEFAULT NOW());

            SELECT 1 FROM public.projects

            WHERE projects.id = diagrams.project_id );

            AND projects.user_id = auth.uid()

        )-- Exports table (track generated Terraform/Pulumi code exports)

    );

-- Diagrams table (stores React Flow diagram state)CREATE TABLE public.exports (

CREATE POLICY "Users can create diagrams in own projects" ON public.diagrams

    FOR INSERT WITH CHECK (CREATE TABLE public.diagrams (  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

        EXISTS (

            SELECT 1 FROM public.projects     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,

            WHERE projects.id = diagrams.project_id

            AND projects.user_id = auth.uid()    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,  export_type TEXT NOT NULL CHECK (export_type IN ('terraform', 'pulumi', 'cloudformation')),

        )

    );    name TEXT NOT NULL DEFAULT 'Untitled Diagram',  code_content TEXT NOT NULL,



CREATE POLICY "Users can update diagrams in own projects" ON public.diagrams    data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

    FOR UPDATE USING (

        EXISTS (    thumbnail_url TEXT,);

            SELECT 1 FROM public.projects

            WHERE projects.id = diagrams.project_id     created_at TIMESTAMPTZ DEFAULT NOW(),

            AND projects.user_id = auth.uid()

        )    updated_at TIMESTAMPTZ DEFAULT NOW()-- =====================================================

    );

);-- INDEXES FOR PERFORMANCE

CREATE POLICY "Users can delete diagrams in own projects" ON public.diagrams

    FOR DELETE USING (-- =====================================================

        EXISTS (

            SELECT 1 FROM public.projects -- Templates table (pre-built architecture templates)

            WHERE projects.id = diagrams.project_id

            AND projects.user_id = auth.uid()CREATE TABLE public.templates (CREATE INDEX idx_projects_user_id ON public.projects(user_id);

        )

    );    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);



-- Templates policies    name TEXT NOT NULL,

CREATE POLICY "Anyone can view public templates" ON public.templates

    FOR SELECT USING (is_public = true OR created_by = auth.uid());    description TEXT,CREATE INDEX idx_diagrams_project_id ON public.diagrams(project_id);



CREATE POLICY "Users can create templates" ON public.templates    category TEXT NOT NULL,CREATE INDEX idx_diagrams_created_at ON public.diagrams(created_at DESC);

    FOR INSERT WITH CHECK (auth.uid() = created_by);

    data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,

CREATE POLICY "Users can update own templates" ON public.templates

    FOR UPDATE USING (auth.uid() = created_by);    thumbnail_url TEXT,CREATE INDEX idx_templates_category ON public.templates(category);



CREATE POLICY "Users can delete own templates" ON public.templates    is_public BOOLEAN DEFAULT true,CREATE INDEX idx_templates_is_public ON public.templates(is_public);

    FOR DELETE USING (auth.uid() = created_by);

    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,CREATE INDEX idx_templates_created_by ON public.templates(created_by);

-- Project shares policies

CREATE POLICY "Project owners can manage shares" ON public.project_shares    created_at TIMESTAMPTZ DEFAULT NOW()

    FOR ALL USING (

        EXISTS ();CREATE INDEX idx_project_shares_project_id ON public.project_shares(project_id);

            SELECT 1 FROM public.projects

            WHERE projects.id = project_shares.project_id CREATE INDEX idx_project_shares_email ON public.project_shares(shared_with_email);

            AND projects.user_id = auth.uid()

        )-- Project shares table (for collaboration)

    );

CREATE TABLE public.project_shares (CREATE INDEX idx_exports_diagram_id ON public.exports(diagram_id);

-- Exports policies

CREATE POLICY "Users can view own exports" ON public.exports    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),CREATE INDEX idx_exports_created_at ON public.exports(created_at DESC);

    FOR SELECT USING (

        EXISTS (    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

            SELECT 1 FROM public.projects

            WHERE projects.id = exports.project_id     shared_with_email TEXT NOT NULL,-- =====================================================

            AND projects.user_id = auth.uid()

        )    permission TEXT NOT NULL DEFAULT 'view',-- ENABLE ROW LEVEL SECURITY (RLS)

    );

    created_at TIMESTAMPTZ DEFAULT NOW(),-- =====================================================

CREATE POLICY "Users can create exports for own projects" ON public.exports

    FOR INSERT WITH CHECK (    UNIQUE(project_id, shared_with_email)

        EXISTS (

            SELECT 1 FROM public.projects );ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

            WHERE projects.id = exports.project_id

            AND projects.user_id = auth.uid()ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

        )

    );-- Exports table (track generated Terraform/Pulumi code exports)ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;



-- =====================================================CREATE TABLE public.exports (ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- FUNCTIONS

-- =====================================================    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;



-- Function to handle updated_at timestamp    diagram_id UUID REFERENCES public.diagrams(id) ON DELETE CASCADE NOT NULL,ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_updated_at()

RETURNS TRIGGER AS $$    export_type TEXT NOT NULL DEFAULT 'terraform',

BEGIN

    NEW.updated_at = NOW();    code_content TEXT NOT NULL,-- =====================================================

    RETURN NEW;

END;    created_at TIMESTAMPTZ DEFAULT NOW()-- RLS POLICIES - Profiles

$$ LANGUAGE plpgsql;

);-- =====================================================

-- Function to create profile on user signup

CREATE OR REPLACE FUNCTION public.handle_new_user()

RETURNS TRIGGER AS $$

BEGIN-- =====================================================CREATE POLICY "Public profiles are viewable by everyone"

    INSERT INTO public.profiles (id, email, full_name, avatar_url)

    VALUES (-- INDEXES FOR PERFORMANCE  ON public.profiles FOR SELECT

        NEW.id,

        NEW.email,-- =====================================================  USING (true);

        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),

        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')

    );

    RETURN NEW;CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);CREATE POLICY "Users can insert own profile"

END;

$$ LANGUAGE plpgsql SECURITY DEFINER;CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);  ON public.profiles FOR INSERT



-- =====================================================CREATE INDEX IF NOT EXISTS idx_diagrams_project_id ON public.diagrams(project_id);  WITH CHECK (auth.uid() = id);

-- TRIGGERS

-- =====================================================CREATE INDEX IF NOT EXISTS idx_templates_is_public ON public.templates(is_public);



-- Updated_at triggersCREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);CREATE POLICY "Users can update own profile"

CREATE TRIGGER set_profiles_updated_at

    BEFORE UPDATE ON public.profilesCREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON public.project_shares(project_id);  ON public.profiles FOR UPDATE

    FOR EACH ROW

    EXECUTE FUNCTION public.handle_updated_at();CREATE INDEX IF NOT EXISTS idx_project_shares_email ON public.project_shares(shared_with_email);  USING (auth.uid() = id);



CREATE TRIGGER set_projects_updated_atCREATE INDEX IF NOT EXISTS idx_exports_diagram_id ON public.exports(diagram_id);

    BEFORE UPDATE ON public.projects

    FOR EACH ROWCREATE POLICY "Users can delete own profile"

    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================  ON public.profiles FOR DELETE

CREATE TRIGGER set_diagrams_updated_at

    BEFORE UPDATE ON public.diagrams-- ROW LEVEL SECURITY (RLS)  USING (auth.uid() = id);

    FOR EACH ROW

    EXECUTE FUNCTION public.handle_updated_at();-- =====================================================



-- Auto-create profile on signup-- =====================================================

CREATE TRIGGER on_auth_user_created

    AFTER INSERT ON auth.usersALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;-- RLS POLICIES - Projects

    FOR EACH ROW

    EXECUTE FUNCTION public.handle_new_user();ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;-- =====================================================



-- =====================================================ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;

-- SEED DATA - Default Templates

-- =====================================================ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;



INSERT INTO public.templates (name, description, category, cloud_provider, nodes, edges, is_public) VALUESALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;CREATE POLICY "Users can view own projects"

(

    'Basic Web Application',ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;  ON public.projects FOR SELECT

    'Simple web app with load balancer, web servers, and database',

    'web',  USING (auth.uid() = user_id);

    'aws',

    '[-- =====================================================

        {"id": "alb-1", "type": "awsNode", "position": {"x": 250, "y": 50}, "data": {"label": "Application Load Balancer", "service": "alb", "provider": "aws"}},

        {"id": "ec2-1", "type": "awsNode", "position": {"x": 100, "y": 200}, "data": {"label": "Web Server 1", "service": "ec2", "provider": "aws"}},-- RLS POLICIESCREATE POLICY "Users can create own projects"

        {"id": "ec2-2", "type": "awsNode", "position": {"x": 400, "y": 200}, "data": {"label": "Web Server 2", "service": "ec2", "provider": "aws"}},

        {"id": "rds-1", "type": "awsNode", "position": {"x": 250, "y": 350}, "data": {"label": "PostgreSQL Database", "service": "rds", "provider": "aws"}}-- =====================================================  ON public.projects FOR INSERT

    ]',

    '[  WITH CHECK (auth.uid() = user_id);

        {"id": "e1", "source": "alb-1", "target": "ec2-1"},

        {"id": "e2", "source": "alb-1", "target": "ec2-2"},-- Profiles policies

        {"id": "e3", "source": "ec2-1", "target": "rds-1"},

        {"id": "e4", "source": "ec2-2", "target": "rds-1"}CREATE POLICY "profiles_select" ON public.profilesCREATE POLICY "Users can update own projects"

    ]',

    true    FOR SELECT USING (true);  ON public.projects FOR UPDATE

),

(  USING (auth.uid() = user_id);

    'Serverless API',

    'API Gateway with Lambda functions and DynamoDB',CREATE POLICY "profiles_insert" ON public.profiles

    'serverless',

    'aws',    FOR INSERT WITH CHECK (auth.uid() = id);CREATE POLICY "Users can delete own projects"

    '[

        {"id": "apigw-1", "type": "awsNode", "position": {"x": 250, "y": 50}, "data": {"label": "API Gateway", "service": "apigateway", "provider": "aws"}},  ON public.projects FOR DELETE

        {"id": "lambda-1", "type": "awsNode", "position": {"x": 100, "y": 200}, "data": {"label": "Auth Function", "service": "lambda", "provider": "aws"}},

        {"id": "lambda-2", "type": "awsNode", "position": {"x": 400, "y": 200}, "data": {"label": "API Function", "service": "lambda", "provider": "aws"}},CREATE POLICY "profiles_update" ON public.profiles  USING (auth.uid() = user_id);

        {"id": "dynamo-1", "type": "awsNode", "position": {"x": 250, "y": 350}, "data": {"label": "DynamoDB Table", "service": "dynamodb", "provider": "aws"}}

    ]',    FOR UPDATE USING (auth.uid() = id);

    '[

        {"id": "e1", "source": "apigw-1", "target": "lambda-1"},-- =====================================================

        {"id": "e2", "source": "apigw-1", "target": "lambda-2"},

        {"id": "e3", "source": "lambda-2", "target": "dynamo-1"}CREATE POLICY "profiles_delete" ON public.profiles-- RLS POLICIES - Diagrams

    ]',

    true    FOR DELETE USING (auth.uid() = id);-- =====================================================

),

(

    'Microservices with Kubernetes',

    'EKS cluster with multiple services',-- Projects policiesCREATE POLICY "Users can view diagrams in own projects"

    'containers',

    'aws',CREATE POLICY "projects_select" ON public.projects  ON public.diagrams FOR SELECT

    '[

        {"id": "alb-1", "type": "awsNode", "position": {"x": 250, "y": 50}, "data": {"label": "Application Load Balancer", "service": "alb", "provider": "aws"}},    FOR SELECT USING (auth.uid() = user_id);  USING (

        {"id": "eks-1", "type": "awsNode", "position": {"x": 250, "y": 200}, "data": {"label": "EKS Cluster", "service": "eks", "provider": "aws"}},

        {"id": "ecr-1", "type": "awsNode", "position": {"x": 500, "y": 200}, "data": {"label": "Container Registry", "service": "ecr", "provider": "aws"}},    EXISTS (

        {"id": "rds-1", "type": "awsNode", "position": {"x": 250, "y": 350}, "data": {"label": "PostgreSQL Database", "service": "rds", "provider": "aws"}}

    ]',CREATE POLICY "projects_insert" ON public.projects      SELECT 1 FROM public.projects

    '[

        {"id": "e1", "source": "alb-1", "target": "eks-1"},    FOR INSERT WITH CHECK (auth.uid() = user_id);      WHERE projects.id = diagrams.project_id

        {"id": "e2", "source": "ecr-1", "target": "eks-1"},

        {"id": "e3", "source": "eks-1", "target": "rds-1"}      AND projects.user_id = auth.uid()

    ]',

    trueCREATE POLICY "projects_update" ON public.projects    )

),

(    FOR UPDATE USING (auth.uid() = user_id);  );

    'Static Website with CDN',

    'S3 hosted website with CloudFront distribution',

    'web',

    'aws',CREATE POLICY "projects_delete" ON public.projectsCREATE POLICY "Users can view diagrams in shared projects"

    '[

        {"id": "cf-1", "type": "awsNode", "position": {"x": 250, "y": 50}, "data": {"label": "CloudFront CDN", "service": "cloudfront", "provider": "aws"}},    FOR DELETE USING (auth.uid() = user_id);  ON public.diagrams FOR SELECT

        {"id": "s3-1", "type": "awsNode", "position": {"x": 250, "y": 200}, "data": {"label": "S3 Bucket", "service": "s3", "provider": "aws"}},

        {"id": "r53-1", "type": "awsNode", "position": {"x": 500, "y": 50}, "data": {"label": "Route 53", "service": "route53", "provider": "aws"}}  USING (

    ]',

    '[-- Diagrams policies    EXISTS (

        {"id": "e1", "source": "r53-1", "target": "cf-1"},

        {"id": "e2", "source": "cf-1", "target": "s3-1"}CREATE POLICY "diagrams_select" ON public.diagrams      SELECT 1 FROM public.project_shares ps

    ]',

    true    FOR SELECT USING (      JOIN public.projects p ON p.id = ps.project_id

),

(        EXISTS (      WHERE p.id = diagrams.project_id

    'Data Pipeline',

    'ETL pipeline with S3, Lambda, and Redshift',            SELECT 1 FROM public.projects p      AND ps.shared_with_email = (

    'data',

    'aws',            WHERE p.id = diagrams.project_id        SELECT email FROM auth.users WHERE id = auth.uid()

    '[

        {"id": "s3-1", "type": "awsNode", "position": {"x": 100, "y": 100}, "data": {"label": "Raw Data Bucket", "service": "s3", "provider": "aws"}},            AND p.user_id = auth.uid()      )

        {"id": "lambda-1", "type": "awsNode", "position": {"x": 250, "y": 100}, "data": {"label": "Transform Function", "service": "lambda", "provider": "aws"}},

        {"id": "s3-2", "type": "awsNode", "position": {"x": 400, "y": 100}, "data": {"label": "Processed Bucket", "service": "s3", "provider": "aws"}},        )    )

        {"id": "redshift-1", "type": "awsNode", "position": {"x": 550, "y": 100}, "data": {"label": "Redshift Cluster", "service": "redshift", "provider": "aws"}}

    ]',    );  );

    '[

        {"id": "e1", "source": "s3-1", "target": "lambda-1"},

        {"id": "e2", "source": "lambda-1", "target": "s3-2"},

        {"id": "e3", "source": "s3-2", "target": "redshift-1"}CREATE POLICY "diagrams_insert" ON public.diagramsCREATE POLICY "Users can create diagrams in own projects"

    ]',

    true    FOR INSERT WITH CHECK (  ON public.diagrams FOR INSERT

);

        EXISTS (  WITH CHECK (

-- =====================================================

-- GRANT PERMISSIONS            SELECT 1 FROM public.projects p    EXISTS (

-- =====================================================

            WHERE p.id = diagrams.project_id      SELECT 1 FROM public.projects

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;            AND p.user_id = auth.uid()      WHERE projects.id = diagrams.project_id

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;        )      AND projects.user_id = auth.uid()



-- =====================================================    );    )

-- DONE!

-- =====================================================  );


CREATE POLICY "diagrams_update" ON public.diagrams

    FOR UPDATE USING (CREATE POLICY "Users can update diagrams in own projects"

        EXISTS (  ON public.diagrams FOR UPDATE

            SELECT 1 FROM public.projects p  USING (

            WHERE p.id = diagrams.project_id    EXISTS (

            AND p.user_id = auth.uid()      SELECT 1 FROM public.projects

        )      WHERE projects.id = diagrams.project_id

    );      AND projects.user_id = auth.uid()

    )

CREATE POLICY "diagrams_delete" ON public.diagrams  );

    FOR DELETE USING (

        EXISTS (CREATE POLICY "Users can edit diagrams in shared projects with edit permission"

            SELECT 1 FROM public.projects p  ON public.diagrams FOR UPDATE

            WHERE p.id = diagrams.project_id  USING (

            AND p.user_id = auth.uid()    EXISTS (

        )      SELECT 1 FROM public.project_shares ps

    );      JOIN public.projects p ON p.id = ps.project_id

      WHERE p.id = diagrams.project_id

-- Templates policies (public read, auth write own)      AND ps.shared_with_email = (

CREATE POLICY "templates_select" ON public.templates        SELECT email FROM auth.users WHERE id = auth.uid()

    FOR SELECT USING (is_public = true OR created_by = auth.uid());      )

      AND ps.permission = 'edit'

CREATE POLICY "templates_insert" ON public.templates    )

    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);  );



CREATE POLICY "templates_update" ON public.templatesCREATE POLICY "Users can delete diagrams in own projects"

    FOR UPDATE USING (created_by = auth.uid());  ON public.diagrams FOR DELETE

  USING (

CREATE POLICY "templates_delete" ON public.templates    EXISTS (

    FOR DELETE USING (created_by = auth.uid());      SELECT 1 FROM public.projects

      WHERE projects.id = diagrams.project_id

-- Project shares policies      AND projects.user_id = auth.uid()

CREATE POLICY "project_shares_owner" ON public.project_shares    )

    FOR ALL USING (  );

        EXISTS (

            SELECT 1 FROM public.projects p-- =====================================================

            WHERE p.id = project_shares.project_id-- RLS POLICIES - Templates

            AND p.user_id = auth.uid()-- =====================================================

        )

    );CREATE POLICY "Public templates viewable by all"

  ON public.templates FOR SELECT

-- Exports policies  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "exports_select" ON public.exports

    FOR SELECT USING (CREATE POLICY "Authenticated users can create templates"

        EXISTS (  ON public.templates FOR INSERT

            SELECT 1 FROM public.diagrams d  WITH CHECK (auth.uid() = created_by);

            JOIN public.projects p ON p.id = d.project_id

            WHERE d.id = exports.diagram_idCREATE POLICY "Users can update own templates"

            AND p.user_id = auth.uid()  ON public.templates FOR UPDATE

        )  USING (auth.uid() = created_by);

    );

CREATE POLICY "Users can delete own templates"

CREATE POLICY "exports_insert" ON public.exports  ON public.templates FOR DELETE

    FOR INSERT WITH CHECK (  USING (auth.uid() = created_by);

        EXISTS (

            SELECT 1 FROM public.diagrams d-- =====================================================

            JOIN public.projects p ON p.id = d.project_id-- RLS POLICIES - Project Shares

            WHERE d.id = exports.diagram_id-- =====================================================

            AND p.user_id = auth.uid()

        )CREATE POLICY "Project owners can manage shares"

    );  ON public.project_shares FOR ALL

  USING (

CREATE POLICY "exports_delete" ON public.exports    EXISTS (

    FOR DELETE USING (      SELECT 1 FROM public.projects

        EXISTS (      WHERE projects.id = project_shares.project_id

            SELECT 1 FROM public.diagrams d      AND projects.user_id = auth.uid()

            JOIN public.projects p ON p.id = d.project_id    )

            WHERE d.id = exports.diagram_id  );

            AND p.user_id = auth.uid()

        )CREATE POLICY "Shared users can view their shares"

    );  ON public.project_shares FOR SELECT

  USING (

-- =====================================================    shared_with_email = (

-- FUNCTIONS      SELECT email FROM auth.users WHERE id = auth.uid()

-- =====================================================    )

  );

-- Auto-update updated_at timestamp

CREATE OR REPLACE FUNCTION public.handle_updated_at()-- =====================================================

RETURNS TRIGGER-- RLS POLICIES - Exports

LANGUAGE plpgsql-- =====================================================

AS $$

BEGINCREATE POLICY "Users can view exports from their diagrams"

    NEW.updated_at = NOW();  ON public.exports FOR SELECT

    RETURN NEW;  USING (

END;    EXISTS (

$$;      SELECT 1 FROM public.diagrams d

      JOIN public.projects p ON p.id = d.project_id

-- Auto-create profile on user signup      WHERE d.id = exports.diagram_id

CREATE OR REPLACE FUNCTION public.handle_new_user()      AND p.user_id = auth.uid()

RETURNS TRIGGER    )

LANGUAGE plpgsql  );

SECURITY DEFINER

SET search_path = publicCREATE POLICY "Users can create exports for their diagrams"

AS $$  ON public.exports FOR INSERT

BEGIN  WITH CHECK (

    INSERT INTO public.profiles (id, email, full_name, avatar_url)    EXISTS (

    VALUES (      SELECT 1 FROM public.diagrams d

        NEW.id,      JOIN public.projects p ON p.id = d.project_id

        NEW.email,      WHERE d.id = exports.diagram_id

        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),      AND p.user_id = auth.uid()

        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')    )

    )  );

    ON CONFLICT (id) DO UPDATE SET

        email = EXCLUDED.email,CREATE POLICY "Users can delete their exports"

        updated_at = NOW();  ON public.exports FOR DELETE

    RETURN NEW;  USING (

END;    EXISTS (

$$;      SELECT 1 FROM public.diagrams d

      JOIN public.projects p ON p.id = d.project_id

-- =====================================================      WHERE d.id = exports.diagram_id

-- TRIGGERS      AND p.user_id = auth.uid()

-- =====================================================    )

  );

CREATE TRIGGER set_profiles_updated_at

    BEFORE UPDATE ON public.profiles-- =====================================================

    FOR EACH ROW-- FUNCTIONS

    EXECUTE FUNCTION public.handle_updated_at();-- =====================================================



CREATE TRIGGER set_projects_updated_at-- Function to update updated_at timestamp

    BEFORE UPDATE ON public.projectsCREATE OR REPLACE FUNCTION public.handle_updated_at()

    FOR EACH ROWRETURNS TRIGGER AS $$

    EXECUTE FUNCTION public.handle_updated_at();BEGIN

  NEW.updated_at = NOW();

CREATE TRIGGER set_diagrams_updated_at  RETURN NEW;

    BEFORE UPDATE ON public.diagramsEND;

    FOR EACH ROW$$ LANGUAGE plpgsql;

    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup

-- Important: This trigger creates profile when user signs upCREATE OR REPLACE FUNCTION public.handle_new_user()

CREATE TRIGGER on_auth_user_createdRETURNS TRIGGER AS $$

    AFTER INSERT ON auth.usersBEGIN

    FOR EACH ROW  INSERT INTO public.profiles (id, email, full_name, avatar_url)

    EXECUTE FUNCTION public.handle_new_user();  VALUES (

    NEW.id,

-- =====================================================    NEW.email,

-- SEED DATA - Default Templates    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),

-- =====================================================    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')

  )

INSERT INTO public.templates (name, description, category, data, is_public) VALUES  ON CONFLICT (id) DO UPDATE SET

(    email = EXCLUDED.email,

    'Startup MVP Stack',    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),

    'Cost-effective architecture for startups using Vercel + Supabase free tiers',    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

    'startup',

    '{  RETURN NEW;

        "nodes": [END;

            {"id": "1", "type": "custom", "position": {"x": 250, "y": 50}, "data": {"label": "Next.js App", "componentId": "nextjs", "provider": "vercel", "monthlyCost": 0}},$$ LANGUAGE plpgsql SECURITY DEFINER;

            {"id": "2", "type": "custom", "position": {"x": 250, "y": 200}, "data": {"label": "Vercel Edge", "componentId": "vercel", "provider": "vercel", "monthlyCost": 0}},

            {"id": "3", "type": "custom", "position": {"x": 500, "y": 125}, "data": {"label": "Supabase", "componentId": "supabase", "provider": "supabase", "monthlyCost": 0}}-- =====================================================

        ],-- TRIGGERS

        "edges": [-- =====================================================

            {"id": "e1", "source": "1", "target": "2", "animated": true},

            {"id": "e2", "source": "1", "target": "3", "animated": true}CREATE TRIGGER set_profiles_updated_at

        ]  BEFORE UPDATE ON public.profiles

    }'::jsonb,  FOR EACH ROW

    true  EXECUTE FUNCTION public.handle_updated_at();

),

(CREATE TRIGGER set_projects_updated_at

    'Enterprise E-Commerce',  BEFORE UPDATE ON public.projects

    'Scalable e-commerce with load balancing, caching, and CDN',  FOR EACH ROW

    'enterprise',  EXECUTE FUNCTION public.handle_updated_at();

    '{

        "nodes": [CREATE TRIGGER set_diagrams_updated_at

            {"id": "1", "type": "custom", "position": {"x": 100, "y": 50}, "data": {"label": "CloudFront CDN", "componentId": "aws-cloudfront", "provider": "aws", "monthlyCost": 50}},  BEFORE UPDATE ON public.diagrams

            {"id": "2", "type": "custom", "position": {"x": 350, "y": 50}, "data": {"label": "ALB", "componentId": "aws-alb", "provider": "aws", "monthlyCost": 20}},  FOR EACH ROW

            {"id": "3", "type": "custom", "position": {"x": 350, "y": 200}, "data": {"label": "ECS Fargate", "componentId": "aws-ecs", "provider": "aws", "monthlyCost": 100}},  EXECUTE FUNCTION public.handle_updated_at();

            {"id": "4", "type": "custom", "position": {"x": 600, "y": 100}, "data": {"label": "ElastiCache Redis", "componentId": "aws-elasticache", "provider": "aws", "monthlyCost": 40}},

            {"id": "5", "type": "custom", "position": {"x": 600, "y": 250}, "data": {"label": "RDS PostgreSQL", "componentId": "aws-rds", "provider": "aws", "monthlyCost": 80}}CREATE TRIGGER on_auth_user_created

        ],  AFTER INSERT ON auth.users

        "edges": [  FOR EACH ROW

            {"id": "e1", "source": "1", "target": "2", "animated": true},  EXECUTE FUNCTION public.handle_new_user();

            {"id": "e2", "source": "2", "target": "3", "animated": true},

            {"id": "e3", "source": "3", "target": "4", "animated": true},-- =====================================================

            {"id": "e4", "source": "3", "target": "5", "animated": true}-- SEED DATA - Default Templates

        ]-- =====================================================

    }'::jsonb,

    trueINSERT INTO public.templates (name, description, category, data, is_public) VALUES

),(

(  'Startup MVP',

    'Microservices on Kubernetes',  'Cost-effective architecture for startups. Uses free tiers: Vercel for frontend, Supabase for database and auth.',

    'Modern microservices with K8s, service mesh, and message queues',  'startup',

    'microservices',  '{"nodes": [

    '{    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},

        "nodes": [    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "vercel", "label": "Vercel Hosting"}},

            {"id": "1", "type": "custom", "position": {"x": 100, "y": 100}, "data": {"label": "API Gateway", "componentId": "aws-apigw", "provider": "aws", "monthlyCost": 25}},    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},

            {"id": "2", "type": "custom", "position": {"x": 350, "y": 50}, "data": {"label": "EKS Cluster", "componentId": "aws-eks", "provider": "aws", "monthlyCost": 150}},    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "supabase", "label": "Supabase (DB + Auth)"}}

            {"id": "3", "type": "custom", "position": {"x": 350, "y": 200}, "data": {"label": "SQS Queue", "componentId": "aws-sqs", "provider": "aws", "monthlyCost": 5}},  ], "edges": [

            {"id": "4", "type": "custom", "position": {"x": 600, "y": 125}, "data": {"label": "DocumentDB", "componentId": "aws-documentdb", "provider": "aws", "monthlyCost": 200}}    {"id": "e1-2", "source": "1", "target": "2"},

        ],    {"id": "e1-3", "source": "1", "target": "3"},

        "edges": [    {"id": "e3-4", "source": "3", "target": "4"}

            {"id": "e1", "source": "1", "target": "2", "animated": true},  ]}'::jsonb,

            {"id": "e2", "source": "2", "target": "3", "animated": true},  true

            {"id": "e3", "source": "2", "target": "4", "animated": true}),

        ](

    }'::jsonb,  'Enterprise E-Commerce',

    true  'Highly scalable e-commerce architecture with auto-scaling, caching, and CDN.',

),  'enterprise',

(  '{"nodes": [

    'Serverless Stack',    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React Frontend"}},

    'Zero server management with Lambda, DynamoDB, and S3',    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "aws_cloudfront", "label": "CloudFront CDN"}},

    'side-project',    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_alb", "label": "Application Load Balancer"}},

    '{    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "aws_ecs", "label": "ECS Fargate"}},

        "nodes": [    {"id": "5", "type": "component", "position": {"x": 700, "y": 100}, "data": {"componentId": "redis", "label": "ElastiCache Redis"}},

            {"id": "1", "type": "custom", "position": {"x": 100, "y": 100}, "data": {"label": "API Gateway", "componentId": "aws-apigw", "provider": "aws", "monthlyCost": 10}},    {"id": "6", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "postgresql", "label": "RDS PostgreSQL"}}

            {"id": "2", "type": "custom", "position": {"x": 350, "y": 50}, "data": {"label": "Lambda", "componentId": "aws-lambda", "provider": "aws", "monthlyCost": 0}},  ], "edges": [

            {"id": "3", "type": "custom", "position": {"x": 350, "y": 200}, "data": {"label": "DynamoDB", "componentId": "aws-dynamodb", "provider": "aws", "monthlyCost": 5}},    {"id": "e1-2", "source": "1", "target": "2"},

            {"id": "4", "type": "custom", "position": {"x": 600, "y": 125}, "data": {"label": "S3 Bucket", "componentId": "aws-s3", "provider": "aws", "monthlyCost": 3}}    {"id": "e2-3", "source": "2", "target": "3"},

        ],    {"id": "e3-4", "source": "3", "target": "4"},

        "edges": [    {"id": "e4-5", "source": "4", "target": "5"},

            {"id": "e1", "source": "1", "target": "2", "animated": true},    {"id": "e4-6", "source": "4", "target": "6"}

            {"id": "e2", "source": "2", "target": "3", "animated": true},  ]}'::jsonb,

            {"id": "e3", "source": "2", "target": "4", "animated": true}  true

        ]),

    }'::jsonb,(

    true  'Microservices Architecture',

),  'Modern microservices setup with Kubernetes, service mesh, and message queuing.',

(  'microservices',

    'Gaming Backend',  '{"nodes": [

    'Real-time gaming with WebSockets, session management, and player data',    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "Web App"}},

    'gaming',    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "API Gateway"}},

    '{    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "kubernetes", "label": "Auth Service (K8s)"}},

        "nodes": [    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "kubernetes", "label": "User Service (K8s)"}},

            {"id": "1", "type": "custom", "position": {"x": 100, "y": 100}, "data": {"label": "WebSocket API", "componentId": "aws-apigw-ws", "provider": "aws", "monthlyCost": 15}},    {"id": "5", "type": "component", "position": {"x": 700, "y": 250}, "data": {"componentId": "kubernetes", "label": "Order Service (K8s)"}},

            {"id": "2", "type": "custom", "position": {"x": 350, "y": 50}, "data": {"label": "Game Servers (ECS)", "componentId": "aws-ecs", "provider": "aws", "monthlyCost": 200}},    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "postgresql", "label": "PostgreSQL"}}

            {"id": "3", "type": "custom", "position": {"x": 350, "y": 200}, "data": {"label": "Redis Sessions", "componentId": "aws-elasticache", "provider": "aws", "monthlyCost": 50}},  ], "edges": [

            {"id": "4", "type": "custom", "position": {"x": 600, "y": 125}, "data": {"label": "DynamoDB Players", "componentId": "aws-dynamodb", "provider": "aws", "monthlyCost": 25}}    {"id": "e1-2", "source": "1", "target": "2"},

        ],    {"id": "e2-3", "source": "2", "target": "3"},

        "edges": [    {"id": "e2-4", "source": "2", "target": "4"},

            {"id": "e1", "source": "1", "target": "2", "animated": true},    {"id": "e2-5", "source": "2", "target": "5"},

            {"id": "e2", "source": "2", "target": "3", "animated": true},    {"id": "e3-6", "source": "3", "target": "6"},

            {"id": "e3", "source": "2", "target": "4", "animated": true}    {"id": "e4-6", "source": "4", "target": "6"},

        ]    {"id": "e5-6", "source": "5", "target": "6"}

    }'::jsonb,  ]}'::jsonb,

    true  true

);),

(

-- =====================================================  'Side Project / Hobby',

-- GRANT PERMISSIONS  'Minimal cost architecture using free tiers and cheap services. Perfect for personal projects.',

-- =====================================================  'side-project',

  '{"nodes": [

GRANT USAGE ON SCHEMA public TO anon, authenticated;    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "react", "label": "React App"}},

    {"id": "2", "type": "component", "position": {"x": 100, "y": 250}, "data": {"componentId": "cloudflare_pages", "label": "Cloudflare Pages"}},

GRANT SELECT ON public.profiles TO anon, authenticated;    {"id": "3", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "nodejs", "label": "Node.js API"}},

GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;    {"id": "4", "type": "component", "position": {"x": 400, "y": 250}, "data": {"componentId": "railway", "label": "Railway"}},

    {"id": "5", "type": "component", "position": {"x": 700, "y": 175}, "data": {"componentId": "postgresql", "label": "PlanetScale DB"}}

GRANT ALL ON public.projects TO authenticated;  ], "edges": [

GRANT ALL ON public.diagrams TO authenticated;    {"id": "e1-2", "source": "1", "target": "2"},

GRANT ALL ON public.project_shares TO authenticated;    {"id": "e1-3", "source": "1", "target": "3"},

GRANT ALL ON public.exports TO authenticated;    {"id": "e3-4", "source": "3", "target": "4"},

    {"id": "e3-5", "source": "3", "target": "5"}

GRANT SELECT ON public.templates TO anon, authenticated;  ]}'::jsonb,

GRANT INSERT, UPDATE, DELETE ON public.templates TO authenticated;  true

),

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;(

  'Real-time Gaming Backend',

-- =====================================================  'Low-latency gaming backend with WebSocket support, session management, and player data storage.',

-- VERIFICATION  'gaming',

-- =====================================================  '{"nodes": [

    {"id": "1", "type": "component", "position": {"x": 100, "y": 100}, "data": {"componentId": "game_client", "label": "Game Client"}},

DO $$    {"id": "2", "type": "component", "position": {"x": 400, "y": 100}, "data": {"componentId": "aws_api_gateway", "label": "WebSocket API Gateway"}},

BEGIN    {"id": "3", "type": "component", "position": {"x": 700, "y": 50}, "data": {"componentId": "aws_lambda", "label": "Match Making"}},

    RAISE NOTICE '';    {"id": "4", "type": "component", "position": {"x": 700, "y": 150}, "data": {"componentId": "aws_ecs", "label": "Game Servers"}},

    RAISE NOTICE '✅ JobStack Schema Created Successfully!';    {"id": "5", "type": "component", "position": {"x": 1000, "y": 50}, "data": {"componentId": "redis", "label": "Redis (Sessions)"}},

    RAISE NOTICE '';    {"id": "6", "type": "component", "position": {"x": 1000, "y": 150}, "data": {"componentId": "dynamodb", "label": "DynamoDB (Player Data)"}}

    RAISE NOTICE 'Tables created:';  ], "edges": [

    RAISE NOTICE '  • profiles (user data)';    {"id": "e1-2", "source": "1", "target": "2"},

    RAISE NOTICE '  • projects (infrastructure projects)';    {"id": "e2-3", "source": "2", "target": "3"},

    RAISE NOTICE '  • diagrams (React Flow data)';    {"id": "e2-4", "source": "2", "target": "4"},

    RAISE NOTICE '  • templates (5 pre-built architectures)';    {"id": "e3-5", "source": "3", "target": "5"},

    RAISE NOTICE '  • project_shares (collaboration)';    {"id": "e4-6", "source": "4", "target": "6"}

    RAISE NOTICE '  • exports (Terraform code)';  ]}'::jsonb,

    RAISE NOTICE '';  true

    RAISE NOTICE 'Next steps:';)

    RAISE NOTICE '  1. Enable Email Auth in Supabase Dashboard';ON CONFLICT DO NOTHING;

    RAISE NOTICE '  2. Add environment variables to Vercel';

    RAISE NOTICE '  3. Deploy and test!';-- =====================================================

    RAISE NOTICE '';-- GRANT PERMISSIONS

END $$;-- =====================================================


GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.diagrams TO authenticated;
GRANT SELECT ON public.templates TO anon, authenticated;
GRANT ALL ON public.templates TO authenticated;
GRANT ALL ON public.project_shares TO authenticated;
GRANT ALL ON public.exports TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS! ✅
-- =====================================================
-- Schema created successfully!
--
-- Tables:
-- ✅ profiles (user data)
-- ✅ projects (infrastructure projects)
-- ✅ diagrams (React Flow diagrams with nodes/edges)
-- ✅ templates (5 pre-built architectures)
-- ✅ project_shares (collaboration)
-- ✅ exports (generated Terraform/Pulumi code)
--
-- Next: Enable Email Auth in Supabase Dashboard
-- Then: Configure .env.local with your Supabase credentials
--
-- Ready to build! 🚀
