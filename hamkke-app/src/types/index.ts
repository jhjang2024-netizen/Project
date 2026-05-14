export type UserRole = 'child' | 'parent'

export interface Profile {
  id: string
  user_id: string
  name: string
  role: UserRole
  phone: string | null
  birth_date: string | null
  avatar_url: string | null
  invite_code: string | null
  created_at: string
}

export interface FamilyLink {
  id: string
  child_id: string
  parent_id: string
  invite_code: string
  status: 'pending' | 'accepted'
  created_at: string
  child?: Profile
  parent?: Profile
}

export interface Activity {
  id: string
  family_link_id: string
  type: 'movie' | 'performance' | 'restaurant' | 'travel' | 'event'
  title: string
  description: string
  venue: string | null
  date: string | null
  price_estimate: number | null
  match_score: number | null
  status: 'suggested' | 'approved' | 'rejected' | 'completed'
  ai_reason: string | null
  created_at: string
}

export interface CallLog {
  id: string
  family_link_id: string
  caller_id: string
  duration_seconds: number | null
  called_at: string
  streak_day: number
}

export interface CallSettings {
  id: string
  family_link_id: string
  notify_time: string
  is_active: boolean
  created_at: string
}

export interface HealthRecord {
  id: string
  family_link_id: string
  recorded_at: string
  heart_rate: number | null
  oxygen_level: number | null
  steps: number | null
  sleep_hours: number | null
}

export interface Notification {
  id: string
  user_id: string
  type: 'call_reminder' | 'activity_request' | 'health_alert' | 'family_invite'
  title: string
  body: string
  read: boolean
  data: Record<string, unknown>
  created_at: string
}
