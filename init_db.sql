-- =============================================================================
-- AI-Driven Incident Management Tool - Database Initialization Script (PostgreSQL)
-- =============================================================================

-- 1. Enable pgvector extension for AI embedding support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop existing tables if they exist (Clean start)
DROP TABLE IF EXISTS change_release_map CASCADE;
DROP TABLE IF EXISTS problem_change_map CASCADE;
DROP TABLE IF EXISTS incident_problem_map CASCADE;
DROP TABLE IF EXISTS releaseconfigurationitemlink CASCADE;
DROP TABLE IF EXISTS releasechangelink CASCADE;
DROP TABLE IF EXISTS changeproblemlink CASCADE;
DROP TABLE IF EXISTS changeincidentlink CASCADE;
DROP TABLE IF EXISTS changeconfigurationitemlink CASCADE;
DROP TABLE IF EXISTS problemconfigurationitemlink CASCADE;
DROP TABLE IF EXISTS problemincidentlink CASCADE;
DROP TABLE IF EXISTS incidentconfigurationitemlink CASCADE;
DROP TABLE IF EXISTS releases CASCADE;
DROP TABLE IF EXISTS changes CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS configuration_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- 3. Create Core Tables

-- Teams Table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    full_name VARCHAR,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    team_id UUID REFERENCES teams(id)
);
CREATE INDEX ix_users_username ON users (username);
CREATE INDEX ix_users_email ON users (email);

-- Configuration Items (CI) Table
CREATE TABLE configuration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    name VARCHAR NOT NULL,
    description TEXT,
    type VARCHAR NOT NULL, -- Corresponds to ci_type in diagram
    status VARCHAR NOT NULL DEFAULT 'Active',
    environment VARCHAR, -- Added from diagram
    owner_id UUID REFERENCES users(id),
    last_updated_by_id UUID REFERENCES users(id)
);
CREATE INDEX ix_configuration_items_name ON configuration_items (name);

-- Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR NOT NULL DEFAULT 'New',
    priority VARCHAR NOT NULL,
    reported_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    closed_at TIMESTAMP WITHOUT TIME ZONE,
    category VARCHAR,
    requester_id UUID NOT NULL REFERENCES users(id),
    assignee_id UUID REFERENCES users(id),
    ci_id UUID REFERENCES configuration_items(id),
    embedding VECTOR(768) -- Gemini Embedding
);
CREATE INDEX ix_incidents_title ON incidents (title);

-- Problems Table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    title VARCHAR NOT NULL,
    description TEXT, -- Added for consistency
    root_cause TEXT, 
    workaround TEXT, 
    status VARCHAR NOT NULL DEFAULT 'Open',
    identified_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    closed_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX ix_problems_title ON problems (title);

-- Changes Table
CREATE TABLE changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    title VARCHAR NOT NULL,
    description TEXT, -- Added
    change_type VARCHAR NOT NULL DEFAULT 'Normal',
    impact_analysis TEXT, 
    backout_plan TEXT,    
    status VARCHAR NOT NULL DEFAULT 'Requested',
    scheduled_date TIMESTAMP WITHOUT TIME ZONE, 
    requested_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    requested_by_id UUID NOT NULL REFERENCES users(id), -- Added
    assignee_id UUID REFERENCES users(id)            -- Added
);
CREATE INDEX ix_changes_title ON changes (title);

-- Releases Table
CREATE TABLE releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version VARCHAR NOT NULL,     
    release_note TEXT,            
    status VARCHAR NOT NULL DEFAULT 'Planned',
    actual_date TIMESTAMP WITHOUT TIME ZONE, 
    planned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    managed_by_id UUID NOT NULL REFERENCES users(id) -- Added
);

-- 4. Create Link Tables (Mapping Tables from diagram)

-- INCIDENT_PROBLEM_MAP
CREATE TABLE incident_problem_map (
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, problem_id)
);

-- PROBLEM_CHANGE_MAP
CREATE TABLE problem_change_map (
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    change_id UUID NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, change_id)
);

-- CHANGE_RELEASE_MAP
CREATE TABLE change_release_map (
    change_id UUID NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    PRIMARY KEY (change_id, release_id)
);

-- Existing link tables (keeping for compatibility or legacy support if needed)
CREATE TABLE incidentconfigurationitemlink (
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    ci_id UUID NOT NULL REFERENCES configuration_items(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, ci_id)
);

-- 5. Trigger for updated_at (PostgreSQL specific)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_configuration_items_updated_at BEFORE UPDATE ON configuration_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_changes_updated_at BEFORE UPDATE ON changes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
