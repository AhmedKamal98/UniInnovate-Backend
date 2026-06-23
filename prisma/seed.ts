import { PrismaClient, Role, EntityStatus, Priority, PlanTier, Visibility, ProjectHealth, LegalType, Severity, InvoiceStatus, ServiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UniInnovate database...');

  const hash = await bcrypt.hash('password123', 10);

  // ─── Tenants ──────────────────────────────────────────────────────────
  const tenants = await Promise.all([
    prisma.tenant.create({ data: { id: 'uni-cairo-tech', name: 'Cairo Institute of Technology', country: 'Egypt', city: 'Cairo', status: 'ACTIVE', plan: 'ENTERPRISE', brandingColor: '#1d4ed8' } }),
    prisma.tenant.create({ data: { id: 'uni-alex-innovation', name: 'Alexandria Innovation University', country: 'Egypt', city: 'Alexandria', status: 'ACTIVE', plan: 'GROWTH', brandingColor: '#0f766e' } }),
    prisma.tenant.create({ data: { id: 'uni-nile-science', name: 'Nile Science and Research University', country: 'Egypt', city: 'Giza', status: 'PENDING', plan: 'STARTER', brandingColor: '#7c3aed' } }),
  ]);

  // ─── Users ────────────────────────────────────────────────────────────
  const usersData = [
    { id: 'usr-super-001', name: 'Amina Hassan', email: 'admin@tto.edu', primaryRole: Role.SUPER_ADMIN, roles: [Role.SUPER_ADMIN], tenantId: null, companyId: null, department: null, title: 'Platform Super Admin', mfaEnabled: true },
    { id: 'usr-tto-001', name: 'Omar El-Sayed', email: 'tto@university.edu', primaryRole: Role.TTO, roles: [Role.TTO, Role.REVIEWER], tenantId: 'uni-cairo-tech', companyId: null, department: 'Technology Transfer Office', title: 'TTO Staff Lead', mfaEnabled: true },
    { id: 'usr-university-admin-001', name: 'Laila Mansour', email: 'university.admin@tto.edu', primaryRole: Role.UNIVERSITY_ADMIN, roles: [Role.UNIVERSITY_ADMIN, Role.TTO], tenantId: 'uni-cairo-tech', companyId: null, department: 'Innovation Affairs', title: 'University Innovation Admin', mfaEnabled: false },
    { id: 'usr-company-001', name: 'Karim Nassar', email: 'company@tech.com', primaryRole: Role.COMPANY, roles: [Role.COMPANY], tenantId: null, companyId: 'co-nile-robotics', department: null, title: 'Industry Innovation Manager', mfaEnabled: true },
    { id: 'usr-student-001', name: 'Mariam Adel', email: 'student@university.edu', primaryRole: Role.STUDENT, roles: [Role.STUDENT], tenantId: 'uni-cairo-tech', companyId: null, department: 'Computer Engineering', title: 'Graduate Student', mfaEnabled: false },
    { id: 'usr-researcher-001', name: 'Dr. Youssef Samir', email: 'researcher@university.edu', primaryRole: Role.RESEARCHER, roles: [Role.RESEARCHER, Role.MENTOR], tenantId: 'uni-cairo-tech', companyId: null, department: 'Applied AI Lab', title: 'Principal Researcher', mfaEnabled: true },
    { id: 'usr-mentor-001', name: 'Nadine Farouk', email: 'mentor@university.edu', primaryRole: Role.MENTOR, roles: [Role.MENTOR], tenantId: 'uni-alex-innovation', companyId: null, department: 'Venture Studio', title: 'Startup Mentor', mfaEnabled: true },
    { id: 'usr-reviewer-001', name: 'Dr. Hany Fouad', email: 'reviewer@university.edu', primaryRole: Role.REVIEWER, roles: [Role.REVIEWER], tenantId: 'uni-alex-innovation', companyId: null, department: 'Mechanical Engineering', title: 'Technical Reviewer', mfaEnabled: false },
    { id: 'usr-legal-001', name: 'Salma Ibrahim', email: 'legal@university.edu', primaryRole: Role.LEGAL, roles: [Role.LEGAL], tenantId: 'uni-cairo-tech', companyId: null, department: 'Legal and IP Office', title: 'Legal/IP Officer', mfaEnabled: true },
    { id: 'usr-company-002', name: 'Dina Maher', email: 'dina.maher@renewgrid.com', primaryRole: Role.COMPANY, roles: [Role.COMPANY], tenantId: null, companyId: 'co-renew-grid', department: null, title: 'R&D Partnerships Lead', mfaEnabled: true },
  ];

  for (const u of usersData) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: hash,
        primaryRole: u.primaryRole,
        status: 'ACTIVE',
        tenantId: u.tenantId,
        companyId: u.companyId,
        department: u.department,
        title: u.title,
        mfaEnabled: u.mfaEnabled,
        lastActiveAt: new Date(),
        roles: { create: u.roles.map((role, i) => ({ id: `${u.id}-role-${i}`, role })) },
      },
    });
  }

  // ─── Companies ────────────────────────────────────────────────────────
  await Promise.all([
    prisma.company.create({ data: { id: 'co-nile-robotics', ownerUserId: 'usr-company-001', name: 'Nile Robotics', industry: 'Advanced Manufacturing', status: 'ACTIVE', engagementScore: 91 } }),
    prisma.company.create({ data: { id: 'co-renew-grid', ownerUserId: 'usr-company-002', name: 'RenewGrid Energy', industry: 'Clean Energy', status: 'ACTIVE', engagementScore: 84 } }),
    prisma.company.create({ data: { id: 'co-healthsync', ownerUserId: 'usr-company-001', name: 'HealthSync Analytics', industry: 'Digital Health', status: 'PENDING', engagementScore: 63 } }),
    prisma.company.create({ data: { id: 'co-urbanflow', ownerUserId: 'usr-company-002', name: 'UrbanFlow Mobility', industry: 'Smart Cities', status: 'ACTIVE', engagementScore: 76, flagged: true } }),
  ]);

  // ─── Challenges ───────────────────────────────────────────────────────
  await Promise.all([
    prisma.challenge.create({ data: { id: 'chg-2026-001', companyId: 'co-nile-robotics', assignedReviewerId: 'usr-reviewer-001', title: 'Computer vision quality inspection for low-light assembly lines', industry: 'Advanced Manufacturing', status: 'UNDER_REVIEW', priority: 'URGENT', budget: 4200000, applicants: 18, summary: 'Reduce false rejects in visual inspection stations.', submittedAt: new Date('2026-05-08') } }),
    prisma.challenge.create({ data: { id: 'chg-2026-002', companyId: 'co-renew-grid', assignedReviewerId: 'usr-researcher-001', title: 'Battery degradation prediction for solar microgrids', industry: 'Clean Energy', status: 'APPROVED', priority: 'HIGH', budget: 5500000, applicants: 24, summary: 'Predictive analytics for lithium battery packs.', submittedAt: new Date('2026-05-05') } }),
    prisma.challenge.create({ data: { id: 'chg-2026-003', companyId: 'co-healthsync', title: 'Privacy-preserving patient risk scoring', industry: 'Digital Health', status: 'PENDING', priority: 'MEDIUM', budget: 3000000, applicants: 9, summary: 'Model evaluation protecting patient identity.', submittedAt: new Date('2026-05-01') } }),
    prisma.challenge.create({ data: { id: 'chg-2026-005', companyId: 'co-nile-robotics', assignedReviewerId: 'usr-reviewer-001', title: 'Low-cost robotic gripper for fragile packaged foods', industry: 'Advanced Manufacturing', status: 'PUBLISHED', priority: 'HIGH', budget: 2600000, applicants: 31, summary: 'Compliant gripper reducing product damage.', submittedAt: new Date('2026-04-15') } }),
  ]);

  // ─── Opportunities ────────────────────────────────────────────────────
  await Promise.all([
    prisma.opportunity.create({ data: { id: 'opp-2026-001', challengeId: 'chg-2026-001', mentorId: 'mentor-001', title: 'AI Vision System for Manufacturing Quality', status: 'DRAFT', requiredSkills: ['Computer Vision', 'Edge AI', 'Python'], deadline: new Date('2026-06-15'), applicants: 18, proposals: 7, ndaRequired: true, visibility: 'UNIVERSITY' } }),
    prisma.opportunity.create({ data: { id: 'opp-2026-002', challengeId: 'chg-2026-002', mentorId: 'mentor-002', title: 'Predictive Battery Health Research Sprint', status: 'PUBLISHED', requiredSkills: ['Energy Systems', 'Forecasting', 'IoT'], deadline: new Date('2026-06-01'), applicants: 24, proposals: 9, ndaRequired: false, visibility: 'PUBLIC' } }),
    prisma.opportunity.create({ data: { id: 'opp-2026-003', challengeId: 'chg-2026-005', mentorId: 'mentor-003', title: 'Soft Robotics Gripper Prototype', status: 'PUBLISHED', requiredSkills: ['Mechanical Design', 'Rapid Prototyping'], deadline: new Date('2026-05-29'), applicants: 31, proposals: 12, ndaRequired: true, visibility: 'PUBLIC' } }),
  ]);

  // ─── Mentors ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.mentor.create({ data: { id: 'mentor-001', userId: 'usr-researcher-001', expertise: ['Computer Vision', 'AI Productization'], workload: 72, rating: 4.8, assignedProjects: 4, available: true } }),
    prisma.mentor.create({ data: { id: 'mentor-002', userId: 'usr-mentor-001', expertise: ['Energy Systems', 'Venture Validation'], workload: 54, rating: 4.6, assignedProjects: 3, available: true } }),
    prisma.mentor.create({ data: { id: 'mentor-003', userId: 'usr-reviewer-001', expertise: ['Mechanical Design', 'Manufacturing'], workload: 88, rating: 4.7, assignedProjects: 5, available: false } }),
  ]);

  // ─── Proposals ────────────────────────────────────────────────────────
  await Promise.all([
    prisma.proposal.create({ data: { id: 'prp-2026-001', opportunityId: 'opp-2026-001', universityId: 'uni-cairo-tech', title: 'Hybrid Transformer Inspection Pipeline', teamName: 'Vision Forge', status: 'UNDER_REVIEW', innovationScore: 88, feasibilityScore: 82, marketValueScore: 79, budgetEstimate: 3900000, reviewerNotes: 'Strong dataset strategy.', submittedAt: new Date('2026-05-10') } }),
    prisma.proposal.create({ data: { id: 'prp-2026-003', opportunityId: 'opp-2026-002', universityId: 'uni-nile-science', title: 'Microgrid Battery Digital Twin', teamName: 'GridPulse', status: 'APPROVED', innovationScore: 91, feasibilityScore: 78, marketValueScore: 88, budgetEstimate: 5200000, reviewerNotes: 'Best alignment with company objectives.', submittedAt: new Date('2026-05-02') } }),
    prisma.proposal.create({ data: { id: 'prp-2026-004', opportunityId: 'opp-2026-003', universityId: 'uni-cairo-tech', title: 'Compliant Palm Gripper with Food-Safe Materials', teamName: 'SoftMotion Lab', status: 'APPROVED', innovationScore: 84, feasibilityScore: 89, marketValueScore: 74, budgetEstimate: 2400000, reviewerNotes: 'Rapid prototype can start after NDA.', submittedAt: new Date('2026-04-26') } }),
  ]);

  // ─── Projects ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.project.create({ data: { id: 'prj-2026-001', proposalId: 'prp-2026-003', companyId: 'co-renew-grid', mentorId: 'mentor-002', title: 'Battery Health Digital Twin MVP', status: 'ACTIVE', health: 'ON_TRACK', progress: 64, nextMilestone: 'Field telemetry validation', dueDate: new Date('2026-06-21'), ndaStatus: 'SIGNED', ipStatus: 'University-owned background IP declared', lastActivity: new Date('2026-05-11') } }),
    prisma.project.create({ data: { id: 'prj-2026-002', proposalId: 'prp-2026-004', companyId: 'co-nile-robotics', mentorId: 'mentor-003', title: 'Food-Safe Soft Gripper POC', status: 'ACTIVE', health: 'AT_RISK', progress: 38, nextMilestone: 'Material fatigue test', dueDate: new Date('2026-06-08'), ndaStatus: 'UNSIGNED', ipStatus: 'IP agreement pending company signature', lastActivity: new Date('2026-05-08') } }),
  ]);

  // ─── Legal Records ────────────────────────────────────────────────────
  await Promise.all([
    prisma.legalRecord.create({ data: { id: 'leg-2026-001', projectId: 'prj-2026-001', ownerId: 'usr-legal-001', type: 'NDA', status: 'SIGNED', dueDate: new Date('2026-05-16'), notes: 'All signatures completed.' } }),
    prisma.legalRecord.create({ data: { id: 'leg-2026-002', projectId: 'prj-2026-002', ownerId: 'usr-legal-001', type: 'IP_OWNERSHIP', status: 'UNDER_REVIEW', dueDate: new Date('2026-05-18'), notes: 'Joint foreground IP clause needs company approval.' } }),
    prisma.legalRecord.create({ data: { id: 'leg-2026-004', projectId: 'prj-2026-001', ownerId: 'usr-legal-001', type: 'PATENT', status: 'PENDING', dueDate: new Date('2026-06-05'), notes: 'Prior art screen requested.' } }),
  ]);

  // ─── Notifications ────────────────────────────────────────────────────
  await Promise.all([
    prisma.notification.create({ data: { id: 'ntf-001', tenantId: 'uni-cairo-tech', targetRole: 'TTO', title: 'Urgent review needed', body: 'Low-light inspection challenge has SLA breach risk.', severity: 'WARNING' } }),
    prisma.notification.create({ data: { id: 'ntf-002', targetRole: 'LEGAL', title: 'NDA ready for signature', body: 'Battery Health Digital Twin MVP has a completed NDA packet.', severity: 'SUCCESS' } }),
    prisma.notification.create({ data: { id: 'ntf-003', targetRole: 'SUPER_ADMIN', title: 'Platform incident resolved', body: 'Document vault latency returned to normal.', severity: 'INFO', read: true } }),
    prisma.notification.create({ data: { id: 'ntf-004', targetRole: 'STUDENT', title: 'Proposal approved', body: 'GridPulse proposal moved into active project setup.', severity: 'SUCCESS' } }),
  ]);

  // ─── Billing ──────────────────────────────────────────────────────────
  const plans = await Promise.all([
    prisma.billingPlan.create({ data: { id: 'plan-starter', name: 'Starter', price: 120000, status: 'ACTIVE', features: ['Challenge intake', 'Opportunity publishing', 'Basic reports'] } }),
    prisma.billingPlan.create({ data: { id: 'plan-growth', name: 'Growth', price: 360000, status: 'ACTIVE', features: ['All Starter features', 'Legal/IP workflows', 'Mentor matching'] } }),
    prisma.billingPlan.create({ data: { id: 'plan-enterprise', name: 'Enterprise', price: 780000, status: 'ACTIVE', features: ['All Growth features', 'Billing', 'Advanced analytics', 'SSO'] } }),
  ]);

  await Promise.all([
    prisma.invoice.create({ data: { id: 'inv-2026-041', tenantId: 'uni-cairo-tech', planId: 'plan-enterprise', amount: 780000, status: 'PAID', issuedAt: new Date('2026-05-01'), paidAt: new Date('2026-05-03') } }),
    prisma.invoice.create({ data: { id: 'inv-2026-042', tenantId: 'uni-alex-innovation', planId: 'plan-growth', amount: 360000, status: 'PENDING', issuedAt: new Date('2026-05-01') } }),
  ]);

  // ─── Platform Health ──────────────────────────────────────────────────
  await Promise.all([
    prisma.platformServiceStatus.create({ data: { id: 'svc-api', name: 'Application API', status: 'OPERATIONAL', uptime: '99.98%', latencyMs: 84, errorRate: 0.04 } }),
    prisma.platformServiceStatus.create({ data: { id: 'svc-db', name: 'Primary Database', status: 'OPERATIONAL', uptime: '99.99%', latencyMs: 21, errorRate: 0.01 } }),
    prisma.platformServiceStatus.create({ data: { id: 'svc-vault', name: 'Secure Vault', status: 'DEGRADED', uptime: '99.71%', latencyMs: 220, errorRate: 0.3 } }),
    prisma.platformServiceStatus.create({ data: { id: 'svc-jobs', name: 'Background Jobs', status: 'OPERATIONAL', uptime: '99.95%', latencyMs: 110, errorRate: 0.08 } }),
  ]);

  // ─── Theme Settings ───────────────────────────────────────────────────
  await prisma.themeSettings.create({
    data: { id: 'theme-cairo', tenantId: 'uni-cairo-tech', tenantName: 'Cairo Institute of Technology', primaryColor: '#1d4ed8', secondaryColor: '#0f766e', accentColor: '#f5c542' },
  });

  // ─── Feature Flags ────────────────────────────────────────────────────
  await Promise.all([
    prisma.featureFlag.create({ data: { id: 'ff-ai-matching', key: 'ai-matching', label: 'AI matching', enabled: true, tenants: 4 } }),
    prisma.featureFlag.create({ data: { id: 'ff-nda-workflow', key: 'nda-workflow', label: 'NDA workflow', enabled: true, tenants: 4 } }),
    prisma.featureFlag.create({ data: { id: 'ff-marketplace', key: 'marketplace', label: 'Marketplace', enabled: false, tenants: 1 } }),
    prisma.featureFlag.create({ data: { id: 'ff-billing', key: 'billing', label: 'Billing', enabled: true, tenants: 3 } }),
  ]);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
