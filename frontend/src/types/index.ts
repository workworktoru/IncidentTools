export interface Team {
  id: string;
  name: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  team_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  reported_at: string;
  resolved_at?: string;
  closed_at?: string;
  category?: string;
  requester_id: string;
  assignee_id?: string;
  ci_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Problem {
  id: string;
  title: string;
  root_cause?: string;
  workaround?: string;
  status: string;
  identified_at: string;
  resolved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Change {
  id: string;
  title: string;
  description?: string;
  status: string;
  change_type: string;
  impact_analysis?: string;
  backout_plan?: string;
  scheduled_date?: string;
  requested_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Release {
  id: string;
  version: string;
  release_note?: string;
  status: string;
  actual_date?: string;
  planned_at: string;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  environment?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}
