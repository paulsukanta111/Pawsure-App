// Generated from the Supabase schema. Regenerate after every migration.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_kind: string
          actor_person_id: string | null
          at: string
          details: Json
          household_id: string | null
          id: number
          subject_id: string | null
          subject_table: string | null
        }
        Insert: {
          action: string
          actor_kind: string
          actor_person_id?: string | null
          at?: string
          details?: Json
          household_id?: string | null
          id?: never
          subject_id?: string | null
          subject_table?: string | null
        }
        Update: {
          action?: string
          actor_kind?: string
          actor_person_id?: string | null
          at?: string
          details?: Json
          household_id?: string | null
          id?: never
          subject_id?: string | null
          subject_table?: string | null
        }
        Relationships: []
      }
      care_circle_members: {
        Row: {
          checkin_method: Database["public"]["Enums"]["checkin_method"] | null
          consent: Database["public"]["Enums"]["consent_status"]
          created_at: string
          helper_mode: Database["public"]["Enums"]["helper_mode"] | null
          household_id: string
          id: string
          person_id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["care_role"]
        }
        Insert: {
          checkin_method?: Database["public"]["Enums"]["checkin_method"] | null
          consent?: Database["public"]["Enums"]["consent_status"]
          created_at?: string
          helper_mode?: Database["public"]["Enums"]["helper_mode"] | null
          household_id: string
          id?: string
          person_id: string
          revoked_at?: string | null
          role: Database["public"]["Enums"]["care_role"]
        }
        Update: {
          checkin_method?: Database["public"]["Enums"]["checkin_method"] | null
          consent?: Database["public"]["Enums"]["consent_status"]
          created_at?: string
          helper_mode?: Database["public"]["Enums"]["helper_mode"] | null
          household_id?: string
          id?: string
          person_id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["care_role"]
        }
        Relationships: [
          {
            foreignKeyName: "care_circle_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_circle_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      care_days: {
        Row: {
          computed_at: string
          corrected_by: string | null
          day: string
          household_id: string
          outcome: Database["public"]["Enums"]["day_outcome"]
          owner_marked_covered: boolean | null
          pet_id: string
          reason_codes: string[]
          rule_version: string
          verified: boolean
        }
        Insert: {
          computed_at?: string
          corrected_by?: string | null
          day: string
          household_id: string
          outcome: Database["public"]["Enums"]["day_outcome"]
          owner_marked_covered?: boolean | null
          pet_id: string
          reason_codes?: string[]
          rule_version: string
          verified?: boolean
        }
        Update: {
          computed_at?: string
          corrected_by?: string | null
          day?: string
          household_id?: string
          outcome?: Database["public"]["Enums"]["day_outcome"]
          owner_marked_covered?: boolean | null
          pet_id?: string
          reason_codes?: string[]
          rule_version?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "care_days_corrected_by_fkey"
            columns: ["corrected_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_days_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_days_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          created_at: string
          due_time: string
          enabled: boolean
          ends_on: string | null
          escalation_profile: Json
          expected_minutes: number | null
          id: string
          instructions: string | null
          pet_id: string
          recurrence: string
          starts_on: string
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
        }
        Insert: {
          created_at?: string
          due_time: string
          enabled?: boolean
          ends_on?: string | null
          escalation_profile?: Json
          expected_minutes?: number | null
          id?: string
          instructions?: string | null
          pet_id: string
          recurrence?: string
          starts_on?: string
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
        }
        Update: {
          created_at?: string
          due_time?: string
          enabled?: boolean
          ends_on?: string | null
          escalation_profile?: Json
          expected_minutes?: number | null
          id?: string
          instructions?: string | null
          pet_id?: string
          recurrence?: string
          starts_on?: string
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      care_task_status_changes: {
        Row: {
          at: string
          changed_by: string | null
          from_status: Database["public"]["Enums"]["task_status"] | null
          id: number
          reason: string | null
          reassigned_to: string | null
          task_id: string
          to_status: Database["public"]["Enums"]["task_status"]
        }
        Insert: {
          at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["task_status"] | null
          id?: never
          reason?: string | null
          reassigned_to?: string | null
          task_id: string
          to_status: Database["public"]["Enums"]["task_status"]
        }
        Update: {
          at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["task_status"] | null
          id?: never
          reason?: string | null
          reassigned_to?: string | null
          task_id?: string
          to_status?: Database["public"]["Enums"]["task_status"]
        }
        Relationships: [
          {
            foreignKeyName: "care_task_status_changes_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_task_status_changes_reassigned_to_fkey"
            columns: ["reassigned_to"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_task_status_changes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      care_tasks: {
        Row: {
          assigned_person_id: string | null
          confidence: Database["public"]["Enums"]["task_confidence"]
          created_at: string
          due_at: string
          escalation_resolved_at: string | null
          household_id: string
          id: string
          late: boolean
          mismatch: boolean
          pet_id: string
          plan_id: string | null
          reason_codes: string[]
          rule_version: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          visit_status: Database["public"]["Enums"]["visit_status"]
        }
        Insert: {
          assigned_person_id?: string | null
          confidence?: Database["public"]["Enums"]["task_confidence"]
          created_at?: string
          due_at: string
          escalation_resolved_at?: string | null
          household_id: string
          id?: string
          late?: boolean
          mismatch?: boolean
          pet_id: string
          plan_id?: string | null
          reason_codes?: string[]
          rule_version?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          visit_status?: Database["public"]["Enums"]["visit_status"]
        }
        Update: {
          assigned_person_id?: string | null
          confidence?: Database["public"]["Enums"]["task_confidence"]
          created_at?: string
          due_at?: string
          escalation_resolved_at?: string | null
          household_id?: string
          id?: string
          late?: boolean
          mismatch?: boolean
          pet_id?: string
          plan_id?: string | null
          reason_codes?: string[]
          rule_version?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          visit_status?: Database["public"]["Enums"]["visit_status"]
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_assigned_person_id_fkey"
            columns: ["assigned_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_tasks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_tasks_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_signals: {
        Row: {
          after_task_prompt: boolean | null
          code: string | null
          created_at: string
          from_registered_number: boolean | null
          household_id: string
          id: string
          image_hash: string | null
          media_path: string | null
          names_task: boolean | null
          occurred_at: string
          person_id: string | null
          provider_message_id: string | null
          received_at: string
          signal_type: Database["public"]["Enums"]["signal_type"]
          task_id: string | null
        }
        Insert: {
          after_task_prompt?: boolean | null
          code?: string | null
          created_at?: string
          from_registered_number?: boolean | null
          household_id: string
          id?: string
          image_hash?: string | null
          media_path?: string | null
          names_task?: boolean | null
          occurred_at: string
          person_id?: string | null
          provider_message_id?: string | null
          received_at?: string
          signal_type: Database["public"]["Enums"]["signal_type"]
          task_id?: string | null
        }
        Update: {
          after_task_prompt?: boolean | null
          code?: string | null
          created_at?: string
          from_registered_number?: boolean | null
          household_id?: string
          id?: string
          image_hash?: string | null
          media_path?: string | null
          names_task?: boolean | null
          occurred_at?: string
          person_id?: string | null
          provider_message_id?: string | null
          received_at?: string
          signal_type?: Database["public"]["Enums"]["signal_type"]
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkin_signals_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_signals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_signals_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      code_cards: {
        Row: {
          codes: Json
          household_id: string
          id: string
          issued_at: string
          month: string
          revoke_reason: string | null
          revoked_at: string | null
        }
        Insert: {
          codes: Json
          household_id: string
          id?: string
          issued_at?: string
          month: string
          revoke_reason?: string | null
          revoked_at?: string | null
        }
        Update: {
          codes?: Json
          household_id?: string
          id?: string
          issued_at?: string
          month?: string
          revoke_reason?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_cards_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          at: string
          channel: string
          consent_text_version: string
          household_id: string | null
          id: string
          language: Database["public"]["Enums"]["app_language"]
          person_id: string
          purpose: string
          scope: Json
          status: Database["public"]["Enums"]["consent_status"]
        }
        Insert: {
          at?: string
          channel: string
          consent_text_version: string
          household_id?: string | null
          id?: string
          language: Database["public"]["Enums"]["app_language"]
          person_id: string
          purpose: string
          scope?: Json
          status: Database["public"]["Enums"]["consent_status"]
        }
        Update: {
          at?: string
          channel?: string
          consent_text_version?: string
          household_id?: string | null
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          person_id?: string
          purpose?: string
          scope?: Json
          status?: Database["public"]["Enums"]["consent_status"]
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          cohort: string
          enabled: boolean
          household_id: string | null
          id: number
          key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cohort?: string
          enabled: boolean
          household_id?: string | null
          id?: never
          key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cohort?: string
          enabled?: boolean
          household_id?: string | null
          id?: never
          key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_links: {
        Row: {
          blocked: boolean
          created_at: string
          friend_person_id: string
          household_id: string
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          friend_person_id: string
          household_id: string
        }
        Update: {
          blocked?: boolean
          created_at?: string
          friend_person_id?: string
          household_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_links_friend_person_id_fkey"
            columns: ["friend_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_links_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_profiles: {
        Row: {
          availability: Json
          availability_updated_at: string
          capabilities: string[]
          discovery_opt_in: boolean
          key_status: string
          max_open_requests: number
          nearby_opt_in: boolean
          paused_all: boolean
          paused_until: string | null
          person_id: string
          share_history: boolean
        }
        Insert: {
          availability?: Json
          availability_updated_at?: string
          capabilities?: string[]
          discovery_opt_in?: boolean
          key_status?: string
          max_open_requests?: number
          nearby_opt_in?: boolean
          paused_all?: boolean
          paused_until?: string | null
          person_id: string
          share_history?: boolean
        }
        Update: {
          availability?: Json
          availability_updated_at?: string
          capabilities?: string[]
          discovery_opt_in?: boolean
          key_status?: string
          max_open_requests?: number
          nearby_opt_in?: boolean
          paused_all?: boolean
          paused_until?: string | null
          person_id?: string
          share_history?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "friend_profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_search_recipients: {
        Row: {
          friend_person_id: string
          rank: number | null
          rank_reasons: string[]
          responded_at: string | null
          search_id: string
          state: string
        }
        Insert: {
          friend_person_id: string
          rank?: number | null
          rank_reasons?: string[]
          responded_at?: string | null
          search_id: string
          state: string
        }
        Update: {
          friend_person_id?: string
          rank?: number | null
          rank_reasons?: string[]
          responded_at?: string | null
          search_id?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_search_recipients_friend_person_id_fkey"
            columns: ["friend_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_search_recipients_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "friend_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_searches: {
        Row: {
          created_at: string
          created_by: string
          household_id: string
          id: string
          machine_state: Json
          owner_corrected_fields: string[]
          parse_source: string | null
          parsed_request: Json | null
          pet_id: string
          raw_request: string | null
          state: Database["public"]["Enums"]["search_state"]
          task_start: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          machine_state: Json
          owner_corrected_fields?: string[]
          parse_source?: string | null
          parsed_request?: Json | null
          pet_id: string
          raw_request?: string | null
          state?: Database["public"]["Enums"]["search_state"]
          task_start: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          machine_state?: Json
          owner_corrected_fields?: string[]
          parse_source?: string | null
          parsed_request?: Json | null
          pet_id?: string
          raw_request?: string | null
          state?: Database["public"]["Enums"]["search_state"]
          task_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_searches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_searches_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_searches_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      health_events: {
        Row: {
          created_at: string
          due_on: string
          event_type: string
          id: string
          last_given_on: string | null
          notes: string | null
          pet_id: string
          reminder_state: string
          source: string
        }
        Insert: {
          created_at?: string
          due_on: string
          event_type: string
          id?: string
          last_given_on?: string | null
          notes?: string | null
          pet_id: string
          reminder_state?: string
          source?: string
        }
        Update: {
          created_at?: string
          due_on?: string
          event_type?: string
          id?: string
          last_given_on?: string | null
          notes?: string | null
          pet_id?: string
          reminder_state?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_events_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      household_access_details: {
        Row: {
          access_instructions: string | null
          flat_address: string | null
          household_id: string
          spare_key_note: string | null
          updated_at: string
        }
        Insert: {
          access_instructions?: string | null
          flat_address?: string | null
          household_id: string
          spare_key_note?: string | null
          updated_at?: string
        }
        Update: {
          access_instructions?: string | null
          flat_address?: string | null
          household_id?: string
          spare_key_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_access_details_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: true
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          anchor_lat: number | null
          anchor_lng: number | null
          created_at: string
          has_gate_app: boolean
          id: string
          name: string
          pilot_cohort: string | null
          society: string | null
          tower: string | null
        }
        Insert: {
          anchor_lat?: number | null
          anchor_lng?: number | null
          created_at?: string
          has_gate_app?: boolean
          id?: string
          name: string
          pilot_cohort?: string | null
          society?: string | null
          tower?: string | null
        }
        Update: {
          anchor_lat?: number | null
          anchor_lng?: number | null
          created_at?: string
          has_gate_app?: boolean
          id?: string
          name?: string
          pilot_cohort?: string | null
          society?: string | null
          tower?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          category: string
          created_at: string
          household_id: string
          id: string
          notes: string | null
          pet_id: string | null
          reported_by: string | null
          resolution_note: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["severity"]
          task_id: string | null
          voice_note_path: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          category: string
          created_at?: string
          household_id: string
          id?: string
          notes?: string | null
          pet_id?: string | null
          reported_by?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["severity"]
          task_id?: string | null
          voice_note_path?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          category?: string
          created_at?: string
          household_id?: string
          id?: string
          notes?: string | null
          pet_id?: string | null
          reported_by?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          task_id?: string | null
          voice_note_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      look_in_link_opens: {
        Row: {
          id: number
          link_id: string
          opened_at: string
          user_agent: string | null
        }
        Insert: {
          id?: never
          link_id: string
          opened_at?: string
          user_agent?: string | null
        }
        Update: {
          id?: never
          link_id?: string
          opened_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "look_in_link_opens_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "look_in_links"
            referencedColumns: ["id"]
          },
        ]
      }
      look_in_links: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          recipient_person_id: string
          revoked_at: string | null
          scope: string
          task_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          recipient_person_id: string
          revoked_at?: string | null
          scope?: string
          task_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          recipient_person_id?: string
          revoked_at?: string | null
          scope?: string
          task_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "look_in_links_recipient_person_id_fkey"
            columns: ["recipient_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "look_in_links_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          auth_user_id: string | null
          created_at: string
          display_name: string
          id: string
          phone_e164: string
          preferred_language: Database["public"]["Enums"]["app_language"]
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          display_name: string
          id?: string
          phone_e164: string
          preferred_language?: Database["public"]["Enums"]["app_language"]
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          display_name?: string
          id?: string
          phone_e164?: string
          preferred_language?: Database["public"]["Enums"]["app_language"]
        }
        Relationships: []
      }
      pets: {
        Row: {
          age_years: number | null
          allergies: string | null
          breed: string | null
          created_at: string
          emergency_notes: string | null
          fears_habits: string | null
          food_notes: string | null
          household_id: string
          id: string
          medicines: string | null
          name: string
          nearest_24x7_clinic: string | null
          photo_path: string | null
          species: string
          updated_at: string
          vet_name: string | null
          vet_phone: string | null
        }
        Insert: {
          age_years?: number | null
          allergies?: string | null
          breed?: string | null
          created_at?: string
          emergency_notes?: string | null
          fears_habits?: string | null
          food_notes?: string | null
          household_id: string
          id?: string
          medicines?: string | null
          name: string
          nearest_24x7_clinic?: string | null
          photo_path?: string | null
          species?: string
          updated_at?: string
          vet_name?: string | null
          vet_phone?: string | null
        }
        Update: {
          age_years?: number | null
          allergies?: string | null
          breed?: string | null
          created_at?: string
          emergency_notes?: string | null
          fears_habits?: string | null
          food_notes?: string | null
          household_id?: string
          id?: string
          medicines?: string | null
          name?: string
          nearest_24x7_clinic?: string | null
          photo_path?: string | null
          species?: string
          updated_at?: string
          vet_name?: string | null
          vet_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_webhooks: {
        Row: {
          message_id: string
          provider: string
          received_at: string
        }
        Insert: {
          message_id: string
          provider: string
          received_at?: string
        }
        Update: {
          message_id?: string
          provider?: string
          received_at?: string
        }
        Relationships: []
      }
      return_checks: {
        Row: {
          answer: string
          answered_by: string
          created_at: string
          details: Json
          duration_seconds: number | null
          id: string
          task_id: string
        }
        Insert: {
          answer: string
          answered_by: string
          created_at?: string
          details?: Json
          duration_seconds?: number | null
          id?: string
          task_id: string
        }
        Update: {
          answer?: string
          answered_by?: string
          created_at?: string
          details?: Json
          duration_seconds?: number | null
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_checks_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_checks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_ledger: {
        Row: {
          created_at: string
          helper_person_id: string
          hold_until: string | null
          household_id: string
          id: string
          points: number
          reason: string
          state: Database["public"]["Enums"]["ledger_state"]
          task_id: string | null
        }
        Insert: {
          created_at?: string
          helper_person_id: string
          hold_until?: string | null
          household_id: string
          id?: string
          points: number
          reason: string
          state: Database["public"]["Enums"]["ledger_state"]
          task_id?: string | null
        }
        Update: {
          created_at?: string
          helper_person_id?: string
          hold_until?: string | null
          household_id?: string
          id?: string
          points?: number
          reason?: string
          state?: Database["public"]["Enums"]["ledger_state"]
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_ledger_helper_person_id_fkey"
            columns: ["helper_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_ledger_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_ledger_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      rights_requests: {
        Row: {
          channel: string
          closed_at: string | null
          details: string | null
          due_at: string
          id: string
          outcome: string | null
          person_id: string
          received_at: string
          type: Database["public"]["Enums"]["rights_type"]
        }
        Insert: {
          channel: string
          closed_at?: string | null
          details?: string | null
          due_at?: string
          id?: string
          outcome?: string | null
          person_id: string
          received_at?: string
          type: Database["public"]["Enums"]["rights_type"]
        }
        Update: {
          channel?: string
          closed_at?: string | null
          details?: string | null
          due_at?: string
          id?: string
          outcome?: string | null
          person_id?: string
          received_at?: string
          type?: Database["public"]["Enums"]["rights_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rights_requests_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_jobs: {
        Row: {
          attempts: number
          created_at: string
          job_key: string
          kind: string
          last_error: string | null
          payload: Json
          run_at: string
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          job_key: string
          kind: string
          last_error?: string | null
          payload?: Json
          run_at: string
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          job_key?: string
          kind?: string
          last_error?: string | null
          payload?: Json
          run_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_household: {
        Args: { p_name: string; p_society?: string; p_tower?: string }
        Returns: string
      }
    }
    Enums: {
      app_language: "en" | "hi" | "mr"
      care_role: "owner" | "co_owner" | "helper" | "backup" | "friend"
      checkin_method: "whatsapp_photo" | "whatsapp_voice" | "missed_call_code"
      consent_status: "pending" | "given" | "declined" | "withdrawn"
      day_outcome: "covered" | "not_covered" | "unknown" | "excluded"
      helper_mode: "tracked" | "trusted"
      ledger_state:
        | "earned"
        | "held"
        | "released"
        | "reversed"
        | "redeemed"
        | "expired"
      rights_type: "access" | "correct" | "erase" | "withdraw" | "grievance"
      search_state:
        | "draft"
        | "ready_for_search"
        | "awaiting_owner_approval"
        | "sent"
        | "provisional_hold"
        | "confirmed"
        | "completed"
        | "expired"
        | "cancelled"
        | "no_show"
      severity: "S1" | "S2" | "S3"
      signal_type:
        | "whatsapp_photo"
        | "in_app_photo"
        | "voice_note"
        | "ivr_code"
        | "arrival_call"
        | "exit_call"
        | "gate_entry"
      task_confidence:
        | "pending"
        | "confirmed"
        | "likely"
        | "not_confirmed"
        | "missed"
        | "matched"
      task_status:
        | "planned"
        | "reassigned"
        | "cancelled"
        | "done_with_evidence"
        | "done_reported"
        | "partly_done"
        | "skipped_with_reason"
        | "missed"
      task_type:
        | "feeding"
        | "water"
        | "walk"
        | "toilet_pad"
        | "medicine"
        | "other"
      visit_status: "confirmed" | "likely" | "not_confirmed" | "not_shown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_language: ["en", "hi", "mr"],
      care_role: ["owner", "co_owner", "helper", "backup", "friend"],
      checkin_method: ["whatsapp_photo", "whatsapp_voice", "missed_call_code"],
      consent_status: ["pending", "given", "declined", "withdrawn"],
      day_outcome: ["covered", "not_covered", "unknown", "excluded"],
      helper_mode: ["tracked", "trusted"],
      ledger_state: [
        "earned",
        "held",
        "released",
        "reversed",
        "redeemed",
        "expired",
      ],
      rights_type: ["access", "correct", "erase", "withdraw", "grievance"],
      search_state: [
        "draft",
        "ready_for_search",
        "awaiting_owner_approval",
        "sent",
        "provisional_hold",
        "confirmed",
        "completed",
        "expired",
        "cancelled",
        "no_show",
      ],
      severity: ["S1", "S2", "S3"],
      signal_type: [
        "whatsapp_photo",
        "in_app_photo",
        "voice_note",
        "ivr_code",
        "arrival_call",
        "exit_call",
        "gate_entry",
      ],
      task_confidence: [
        "pending",
        "confirmed",
        "likely",
        "not_confirmed",
        "missed",
        "matched",
      ],
      task_status: [
        "planned",
        "reassigned",
        "cancelled",
        "done_with_evidence",
        "done_reported",
        "partly_done",
        "skipped_with_reason",
        "missed",
      ],
      task_type: [
        "feeding",
        "water",
        "walk",
        "toilet_pad",
        "medicine",
        "other",
      ],
      visit_status: ["confirmed", "likely", "not_confirmed", "not_shown"],
    },
  },
} as const
