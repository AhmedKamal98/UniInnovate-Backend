-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super-admin', 'university-admin', 'tto', 'company', 'student', 'researcher', 'mentor', 'reviewer', 'legal');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('active', 'inactive', 'pending', 'suspended', 'approved', 'rejected', 'draft', 'under-review', 'published', 'archived', 'on-track', 'at-risk', 'delayed', 'completed', 'sent', 'signed', 'unsigned', 'blocked');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('starter', 'growth', 'enterprise');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('public', 'university', 'invited');

-- CreateEnum
CREATE TYPE "ProjectHealth" AS ENUM ('on_track', 'at_risk', 'delayed');

-- CreateEnum
CREATE TYPE "LegalType" AS ENUM ('NDA', 'IP_OWNERSHIP', 'PATENT', 'VAULT_ACCESS', 'CONTRACT');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('info', 'success', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('paid', 'pending', 'overdue');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('operational', 'degraded', 'incident');

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'pending',
    "plan" "PlanTier" NOT NULL DEFAULT 'starter',
    "branding_color" VARCHAR(7),
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "company_id" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "primary_role" "Role" NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'pending',
    "avatar_url" TEXT,
    "department" VARCHAR(255),
    "title" VARCHAR(255),
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(100) NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'pending',
    "engagement_score" INTEGER NOT NULL DEFAULT 0,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "last_activity" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "assigned_reviewer_id" TEXT,
    "title" VARCHAR(500) NOT NULL,
    "industry" VARCHAR(100) NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "budget" INTEGER NOT NULL DEFAULT 0,
    "applicants" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "requested_info" TEXT,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "mentor_id" TEXT,
    "title" VARCHAR(500) NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "required_skills" TEXT[],
    "deadline" TIMESTAMP(3),
    "applicants" INTEGER NOT NULL DEFAULT 0,
    "proposals" INTEGER NOT NULL DEFAULT 0,
    "nda_required" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "Visibility" NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal" (
    "id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "team_name" VARCHAR(255) NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "innovation_score" INTEGER NOT NULL DEFAULT 0,
    "feasibility_score" INTEGER NOT NULL DEFAULT 0,
    "market_value_score" INTEGER NOT NULL DEFAULT 0,
    "budget_estimate" INTEGER NOT NULL DEFAULT 0,
    "reviewer_notes" TEXT,
    "company_validation_status" VARCHAR(20),
    "final_recommendation" TEXT,
    "selected_winner" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "opportunity_id" TEXT,
    "company_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "team_name" VARCHAR(255),
    "status" "EntityStatus" NOT NULL DEFAULT 'pending',
    "health" "ProjectHealth" NOT NULL DEFAULT 'on_track',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "next_milestone" VARCHAR(500),
    "due_date" TIMESTAMP(3),
    "nda_status" "EntityStatus" NOT NULL DEFAULT 'unsigned',
    "ip_status" TEXT,
    "vault_ready" BOOLEAN NOT NULL DEFAULT false,
    "last_activity" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expertise" TEXT[],
    "workload" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assigned_projects" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_assignment" (
    "id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_record" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "type" "LegalType" NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "target_user_id" TEXT,
    "target_role" "Role",
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "action" VARCHAR(255) NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(255) NOT NULL,
    "details" TEXT,
    "ip_address" VARCHAR(45),
    "device" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_plan" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "status" "EntityStatus" NOT NULL DEFAULT 'active',
    "features" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "issued_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_service_status" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'operational',
    "uptime" VARCHAR(10) NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "error_rate" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_service_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "mode" VARCHAR(10) NOT NULL DEFAULT 'system',
    "primary_color" VARCHAR(7) NOT NULL DEFAULT '#1d4ed8',
    "secondary_color" VARCHAR(7) NOT NULL DEFAULT '#0f766e',
    "accent_color" VARCHAR(7) NOT NULL DEFAULT '#f5c542',
    "radius" INTEGER NOT NULL DEFAULT 12,
    "font_family" VARCHAR(50) NOT NULL DEFAULT 'Inter',
    "sidebar_style" VARCHAR(10) NOT NULL DEFAULT 'soft',
    "header_style" VARCHAR(10) NOT NULL DEFAULT 'soft',
    "logo_url" TEXT,
    "tenant_name" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flag" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "tenants" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_attachment" (
    "id" TEXT NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_event" (
    "id" TEXT NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status_snapshot" "EntityStatus",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_tenant_id_idx" ON "user"("tenant_id");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_id_role_key" ON "user_role"("user_id", "role");

-- CreateIndex
CREATE INDEX "challenge_company_id_idx" ON "challenge"("company_id");

-- CreateIndex
CREATE INDEX "challenge_status_idx" ON "challenge"("status");

-- CreateIndex
CREATE INDEX "opportunity_challenge_id_idx" ON "opportunity"("challenge_id");

-- CreateIndex
CREATE INDEX "proposal_opportunity_id_idx" ON "proposal"("opportunity_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_proposal_id_key" ON "project"("proposal_id");

-- CreateIndex
CREATE INDEX "project_company_id_idx" ON "project"("company_id");

-- CreateIndex
CREATE INDEX "project_proposal_id_idx" ON "project"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_user_id_key" ON "mentor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_assignment_mentor_id_project_id_key" ON "mentor_assignment"("mentor_id", "project_id");

-- CreateIndex
CREATE INDEX "legal_record_project_id_idx" ON "legal_record"("project_id");

-- CreateIndex
CREATE INDEX "notification_tenant_id_target_role_idx" ON "notification"("tenant_id", "target_role");

-- CreateIndex
CREATE INDEX "audit_log_tenant_id_idx" ON "audit_log"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "theme_settings_tenant_id_key" ON "theme_settings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flag_key_key" ON "feature_flag"("key");

-- CreateIndex
CREATE INDEX "file_attachment_entity_type_entity_id_idx" ON "file_attachment"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "timeline_event_entity_type_entity_id_idx" ON "timeline_event"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_assigned_reviewer_id_fkey" FOREIGN KEY ("assigned_reviewer_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor" ADD CONSTRAINT "mentor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_assignment" ADD CONSTRAINT "mentor_assignment_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_assignment" ADD CONSTRAINT "mentor_assignment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_record" ADD CONSTRAINT "legal_record_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_record" ADD CONSTRAINT "legal_record_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "billing_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachment" ADD CONSTRAINT "file_attachment_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_event" ADD CONSTRAINT "timeline_event_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
