import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding EE Research Hub v3...')

  // Clear all
  await prisma.progressSnapshot.deleteMany()
  await prisma.taskDependency.deleteMany()
  await prisma.timeLog.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.barrier.deleteMany()
  await prisma.deliverable.deleteMany()
  await prisma.risk.deleteMany()
  await prisma.task.deleteMany()
  await prisma.group.deleteMany()
  await prisma.stakeholder.deleteMany()
  await prisma.member.deleteMany()

  // ── Members (confirmed names only) ──────────────────────────────
  const members = await prisma.member.createMany({
    data: [
      { name: 'Matt Kok',           title: 'Principal',                          email: 'matt.kok@team.com',           color: '#6366f1' },
      { name: 'Deb Dynako',         title: 'Senior Oversight',                   email: 'deb.dynako@team.com',         color: '#8b5cf6' },
      { name: 'Eric Newsum',        title: 'Senior Advisor',                     email: 'eric.newsum@team.com',        color: '#0891b2' },
      { name: 'Michael Griego',     title: 'Project Manager',                    email: 'michael.griego@team.com',     color: '#059669' },
      { name: 'Alice Yang',         title: 'Research Lead',                      email: 'alice.yang@team.com',         color: '#d97706' },
      { name: 'Carolyn Townsend',   title: 'Researcher – Qual & Quant Analysis', email: 'carolyn.townsend@team.com',   color: '#dc2626' },
      { name: 'Julietta Cervantes', title: 'Researcher – Stakeholder Interviews',email: 'julietta.cervantes@team.com', color: '#db2777' },
      { name: 'Atharva Raje',       title: 'Lead Engineer',                      email: 'atharva.raje@team.com',       color: '#2563eb' },
    ]
  })

  const [matt, deb, eric, michael, alice, carolyn, julietta, atharva] =
    await prisma.member.findMany({ orderBy: { createdAt: 'asc' } })

  // ── Groups (study phases) ────────────────────────────────────────
  const groupData = [
    { name: 'Kickoff',                      color: '#6366f1', order: 0 },
    { name: 'Data Request / Acquisition',   color: '#0891b2', order: 1 },
    { name: 'PHA Segmentation',             color: '#0f766e', order: 2 },
    { name: 'Stakeholder Outreach',         color: '#059669', order: 3 },
    { name: 'Implementer Interviews',       color: '#d97706', order: 4 },
    { name: 'PHA Interviews',               color: '#dc2626', order: 5 },
    { name: 'Barrier Synthesis',            color: '#db2777', order: 6 },
    { name: 'Market Potential Analysis',    color: '#7c3aed', order: 7 },
    { name: 'Draft Report',                 color: '#92400e', order: 8 },
    { name: 'Final Report / Presentation',  color: '#1e3a5f', order: 9 },
  ]
  await prisma.group.createMany({ data: groupData })
  const groups = await prisma.group.findMany({ orderBy: { order: 'asc' } })
  const [gKickoff, gData, gSeg, gOutreach, gImpl, gPHA, gSynth, gMarket, gDraft, gFinal] = groups

  // ── Tasks ────────────────────────────────────────────────────────
  const taskDefs = [
    // Kickoff
    { name: 'Project charter sign-off',          groupId: gKickoff.id, assigneeId: michael.id, status: 'Done',        priority: 'High',     startDate: new Date('2026-06-01'), dueDate: new Date('2026-06-05'), estimatedHours: 4  },
    { name: 'Kickoff meeting with full team',     groupId: gKickoff.id, assigneeId: michael.id, status: 'Done',        priority: 'High',     startDate: new Date('2026-06-01'), dueDate: new Date('2026-06-05'), estimatedHours: 2  },
    { name: 'Set up project workspace & tools',  groupId: gKickoff.id, assigneeId: atharva.id, status: 'Done',        priority: 'Medium',   startDate: new Date('2026-06-03'), dueDate: new Date('2026-06-07'), estimatedHours: 8  },
    { name: 'Confirm IRB & legal requirements',  groupId: gKickoff.id, assigneeId: deb.id,     status: 'In Progress', priority: 'Critical', startDate: new Date('2026-06-05'), dueDate: new Date('2026-06-20'), estimatedHours: 6  },
    { name: 'Define research questions',         groupId: gKickoff.id, assigneeId: alice.id,   status: 'Done',        priority: 'High',     startDate: new Date('2026-06-05'), dueDate: new Date('2026-06-12'), estimatedHours: 8  },
    // Data Request
    { name: 'Identify ComEd data sources',       groupId: gData.id,    assigneeId: alice.id,   status: 'Done',        priority: 'High',     startDate: new Date('2026-06-08'), dueDate: new Date('2026-06-15'), estimatedHours: 6  },
    { name: 'Submit data requests to ComEd',     groupId: gData.id,    assigneeId: michael.id, status: 'In Progress', priority: 'Critical', startDate: new Date('2026-06-10'), dueDate: new Date('2026-06-25'), estimatedHours: 4  },
    { name: 'Request HUD public housing data',   groupId: gData.id,    assigneeId: carolyn.id, status: 'In Progress', priority: 'High',     startDate: new Date('2026-06-12'), dueDate: new Date('2026-06-28'), estimatedHours: 4  },
    { name: 'Data cleaning & validation',        groupId: gData.id,    assigneeId: carolyn.id, status: 'Not Started', priority: 'High',     startDate: new Date('2026-06-25'), dueDate: new Date('2026-07-10'), estimatedHours: 20 },
    { name: 'Literature review – EE in PH',      groupId: gData.id,    assigneeId: carolyn.id, status: 'In Progress', priority: 'Medium',   startDate: new Date('2026-06-10'), dueDate: new Date('2026-07-05'), estimatedHours: 16 },
    // PHA Segmentation
    { name: 'Map all PHAs in ComEd territory',   groupId: gSeg.id,     assigneeId: alice.id,   status: 'In Progress', priority: 'High',     startDate: new Date('2026-06-20'), dueDate: new Date('2026-07-05'), estimatedHours: 12 },
    { name: 'Segment PHAs by size & type',       groupId: gSeg.id,     assigneeId: carolyn.id, status: 'Not Started', priority: 'High',     startDate: new Date('2026-07-05'), dueDate: new Date('2026-07-15'), estimatedHours: 10 },
    { name: 'Prioritize PHAs for outreach',      groupId: gSeg.id,     assigneeId: michael.id, status: 'Not Started', priority: 'High',     startDate: new Date('2026-07-10'), dueDate: new Date('2026-07-18'), estimatedHours: 6  },
    // Stakeholder Outreach
    { name: 'Develop outreach materials',        groupId: gOutreach.id, assigneeId: julietta.id, status: 'Not Started', priority: 'High',   startDate: new Date('2026-07-01'), dueDate: new Date('2026-07-15'), estimatedHours: 8  },
    { name: 'Initial contact – all PHAs',        groupId: gOutreach.id, assigneeId: julietta.id, status: 'Not Started', priority: 'High',   startDate: new Date('2026-07-15'), dueDate: new Date('2026-07-31'), estimatedHours: 12 },
    { name: 'Consent form collection',           groupId: gOutreach.id, assigneeId: deb.id,      status: 'Not Started', priority: 'Critical',startDate: new Date('2026-07-20'), dueDate: new Date('2026-08-05'), estimatedHours: 8  },
    { name: 'Schedule all interviews',           groupId: gOutreach.id, assigneeId: michael.id,  status: 'Not Started', priority: 'High',   startDate: new Date('2026-07-25'), dueDate: new Date('2026-08-10'), estimatedHours: 6  },
    // Implementer Interviews
    { name: 'Finalize implementer interview guide', groupId: gImpl.id, assigneeId: julietta.id, status: 'Not Started', priority: 'High',    startDate: new Date('2026-07-15'), dueDate: new Date('2026-07-25'), estimatedHours: 8  },
    { name: 'Conduct implementer interviews (10)', groupId: gImpl.id,  assigneeId: julietta.id, status: 'Not Started', priority: 'High',    startDate: new Date('2026-08-01'), dueDate: new Date('2026-08-25'), estimatedHours: 20 },
    { name: 'Transcribe & code implementer interviews', groupId: gImpl.id, assigneeId: carolyn.id, status: 'Not Started', priority: 'High', startDate: new Date('2026-08-20'), dueDate: new Date('2026-09-05'), estimatedHours: 16 },
    // PHA Interviews
    { name: 'Finalize PHA interview guide',      groupId: gPHA.id,    assigneeId: julietta.id, status: 'Not Started', priority: 'High',     startDate: new Date('2026-07-20'), dueDate: new Date('2026-07-30'), estimatedHours: 6  },
    { name: 'Conduct PHA interviews (15)',        groupId: gPHA.id,    assigneeId: julietta.id, status: 'Not Started', priority: 'Critical', startDate: new Date('2026-08-10'), dueDate: new Date('2026-09-10'), estimatedHours: 30 },
    { name: 'Transcribe & code PHA interviews',  groupId: gPHA.id,    assigneeId: carolyn.id,  status: 'Not Started', priority: 'High',     startDate: new Date('2026-09-01'), dueDate: new Date('2026-09-20'), estimatedHours: 20 },
    // Barrier Synthesis
    { name: 'Develop barrier coding framework',  groupId: gSynth.id,  assigneeId: alice.id,    status: 'Not Started', priority: 'High',     startDate: new Date('2026-09-05'), dueDate: new Date('2026-09-15'), estimatedHours: 10 },
    { name: 'Thematic analysis – all interviews',groupId: gSynth.id,  assigneeId: carolyn.id,  status: 'Not Started', priority: 'High',     startDate: new Date('2026-09-15'), dueDate: new Date('2026-09-25'), estimatedHours: 16 },
    { name: 'Barrier prioritization workshop',   groupId: gSynth.id,  assigneeId: alice.id,    status: 'Not Started', priority: 'High',     startDate: new Date('2026-09-22'), dueDate: new Date('2026-09-28'), estimatedHours: 6  },
    // Market Potential
    { name: 'EE measure opportunity mapping',    groupId: gMarket.id, assigneeId: alice.id,    status: 'Not Started', priority: 'High',     startDate: new Date('2026-09-10'), dueDate: new Date('2026-09-25'), estimatedHours: 16 },
    { name: 'Savings potential analysis',        groupId: gMarket.id, assigneeId: carolyn.id,  status: 'Not Started', priority: 'High',     startDate: new Date('2026-09-20'), dueDate: new Date('2026-10-01'), estimatedHours: 12 },
    { name: 'ComEd program alignment review',    groupId: gMarket.id, assigneeId: eric.id,     status: 'Not Started', priority: 'Medium',   startDate: new Date('2026-09-25'), dueDate: new Date('2026-10-05'), estimatedHours: 8  },
    // Draft Report
    { name: 'Draft report outline',              groupId: gDraft.id,  assigneeId: alice.id,    status: 'Not Started', priority: 'High',     startDate: new Date('2026-09-25'), dueDate: new Date('2026-10-02'), estimatedHours: 6  },
    { name: 'Write draft report sections',       groupId: gDraft.id,  assigneeId: alice.id,    status: 'Not Started', priority: 'Critical', startDate: new Date('2026-10-01'), dueDate: new Date('2026-10-12'), estimatedHours: 30 },
    { name: 'Internal review – Deb & Eric',      groupId: gDraft.id,  assigneeId: deb.id,      status: 'Not Started', priority: 'High',     startDate: new Date('2026-10-10'), dueDate: new Date('2026-10-16'), estimatedHours: 8  },
    { name: 'Incorporate review comments',       groupId: gDraft.id,  assigneeId: alice.id,    status: 'Not Started', priority: 'High',     startDate: new Date('2026-10-15'), dueDate: new Date('2026-10-20'), estimatedHours: 10 },
    // Final
    { name: 'Principal review – Matt Kok',       groupId: gFinal.id,  assigneeId: matt.id,     status: 'Not Started', priority: 'High',     startDate: new Date('2026-10-18'), dueDate: new Date('2026-10-22'), estimatedHours: 6  },
    { name: 'Final report production',           groupId: gFinal.id,  assigneeId: alice.id,    status: 'Not Started', priority: 'Critical', startDate: new Date('2026-10-22'), dueDate: new Date('2026-10-27'), estimatedHours: 12 },
    { name: 'Prepare final presentation deck',  groupId: gFinal.id,  assigneeId: michael.id,  status: 'Not Started', priority: 'High',     startDate: new Date('2026-10-22'), dueDate: new Date('2026-10-28'), estimatedHours: 8  },
    { name: 'Final delivery to ComEd',           groupId: gFinal.id,  assigneeId: matt.id,     status: 'Not Started', priority: 'Critical', startDate: new Date('2026-10-30'), dueDate: new Date('2026-10-31'), estimatedHours: 2  },
  ]

  for (let i = 0; i < taskDefs.length; i++) {
    await prisma.task.create({ data: { ...taskDefs[i], order: i } })
  }

  const allTasks = await prisma.task.findMany({ orderBy: { order: 'asc' } })
  const taskByName = (name: string) => allTasks.find(t => t.name === name)!

  // ── Task Dependencies ────────────────────────────────────────────
  const deps = [
    ['Identify ComEd data sources',        'Submit data requests to ComEd'],
    ['Submit data requests to ComEd',      'Data cleaning & validation'],
    ['Request HUD public housing data',    'Data cleaning & validation'],
    ['Map all PHAs in ComEd territory',    'Segment PHAs by size & type'],
    ['Segment PHAs by size & type',        'Prioritize PHAs for outreach'],
    ['Prioritize PHAs for outreach',       'Develop outreach materials'],
    ['Develop outreach materials',         'Initial contact – all PHAs'],
    ['Initial contact – all PHAs',         'Consent form collection'],
    ['Consent form collection',            'Schedule all interviews'],
    ['Finalize implementer interview guide','Conduct implementer interviews (10)'],
    ['Conduct implementer interviews (10)','Transcribe & code implementer interviews'],
    ['Finalize PHA interview guide',       'Conduct PHA interviews (15)'],
    ['Conduct PHA interviews (15)',        'Transcribe & code PHA interviews'],
    ['Transcribe & code implementer interviews', 'Develop barrier coding framework'],
    ['Transcribe & code PHA interviews',   'Develop barrier coding framework'],
    ['Develop barrier coding framework',   'Thematic analysis – all interviews'],
    ['Thematic analysis – all interviews', 'Barrier prioritization workshop'],
    ['Savings potential analysis',         'ComEd program alignment review'],
    ['Barrier prioritization workshop',    'Draft report outline'],
    ['ComEd program alignment review',     'Draft report outline'],
    ['Draft report outline',               'Write draft report sections'],
    ['Write draft report sections',        'Internal review – Deb & Eric'],
    ['Internal review – Deb & Eric',       'Incorporate review comments'],
    ['Incorporate review comments',        'Principal review – Matt Kok'],
    ['Principal review – Matt Kok',        'Final report production'],
    ['Final report production',            'Final delivery to ComEd'],
  ]

  for (const [pred, succ] of deps) {
    const p = taskByName(pred)
    const s = taskByName(succ)
    if (p && s) {
      await prisma.taskDependency.create({ data: { predecessorId: p.id, successorId: s.id } })
    }
  }

  // ── Stakeholders ────────────────────────────────────────────────
  await prisma.stakeholder.createMany({
    data: [
      { organization: 'Chicago Housing Authority',      type: 'Housing Authority',   contactName: 'TBD', territory: 'Chicago',       outreachStatus: 'Contacted',     interviewStatus: 'Scheduled' },
      { organization: 'Aurora Housing Authority',       type: 'Housing Authority',   contactName: 'TBD', territory: 'Aurora',        outreachStatus: 'Contacted',     interviewStatus: 'Not Scheduled' },
      { organization: 'Waukegan Housing Authority',     type: 'Housing Authority',   contactName: 'TBD', territory: 'Waukegan',      outreachStatus: 'Not Contacted', interviewStatus: 'Not Scheduled' },
      { organization: 'Joliet Housing Authority',       type: 'Housing Authority',   contactName: 'TBD', territory: 'Joliet',        outreachStatus: 'Not Contacted', interviewStatus: 'Not Scheduled' },
      { organization: 'Elgin Housing Authority',        type: 'Housing Authority',   contactName: 'TBD', territory: 'Elgin',         outreachStatus: 'Not Contacted', interviewStatus: 'Not Scheduled' },
      { organization: 'Rockford Housing Authority',     type: 'Housing Authority',   contactName: 'TBD', territory: 'Rockford',      outreachStatus: 'Not Contacted', interviewStatus: 'Not Scheduled' },
      { organization: 'ComEd Energy Efficiency Team',  type: 'Utility',             contactName: 'TBD', territory: 'ComEd Territory',outreachStatus: 'Responded',     interviewStatus: 'Scheduled' },
      { organization: 'Elevate Energy',                type: 'Implementer',         contactName: 'TBD', territory: 'Illinois',      outreachStatus: 'Contacted',     interviewStatus: 'Not Scheduled' },
      { organization: 'HUD Chicago Field Office',      type: 'HUD / Public Agency', contactName: 'TBD', territory: 'Chicago',       outreachStatus: 'Contacted',     interviewStatus: 'Not Scheduled' },
      { organization: 'Illinois Housing Dev Authority',type: 'Program Administrator',contactName: 'TBD', territory: 'Illinois',      outreachStatus: 'Not Contacted', interviewStatus: 'Not Scheduled' },
    ]
  })

  // ── Barriers ────────────────────────────────────────────────────
  await prisma.barrier.createMany({
    data: [
      { name: 'Split Incentives',              category: 'Financial',      frequency: 9, severity: 9, description: 'Building owners pay for EE upgrades but tenants pay utility bills, removing owner incentive.' },
      { name: 'Capital Funding Constraints',   category: 'Financial',      frequency: 8, severity: 8, description: 'PHAs lack upfront capital for EE investments despite long-term savings potential.' },
      { name: 'Aging Infrastructure',          category: 'Technical',      frequency: 8, severity: 8, description: 'Pre-1980s building stock requires extensive retrofit before EE measures are viable.' },
      { name: 'Low Program Awareness',         category: 'Informational',  frequency: 7, severity: 6, description: 'PHA staff unaware of available ComEd EE programs and incentives.' },
      { name: 'Procurement Complexity',        category: 'Administrative', frequency: 7, severity: 7, description: 'Federal procurement rules (Davis-Bacon) slow contractor selection and project delivery.' },
      { name: 'Staffing Limitations',          category: 'Capacity',       frequency: 6, severity: 6, description: 'PHAs lack dedicated energy staff to manage EE projects and program participation.' },
      { name: 'Tenant Disruption Concerns',    category: 'Social',         frequency: 6, severity: 5, description: 'Retrofit work disrupts tenants; PHAs reluctant to displace vulnerable residents.' },
      { name: 'Data Access Barriers',          category: 'Informational',  frequency: 5, severity: 7, description: 'Difficulty accessing whole-building utility data due to master-metered accounts.' },
      { name: 'Regulatory Constraints',        category: 'Administrative', frequency: 5, severity: 6, description: 'HUD regulations limit PHA flexibility in pursuing certain EE financing mechanisms.' },
    ]
  })

  // ── Deliverables ────────────────────────────────────────────────
  const [aliceMem, carolynMem, mattMem, ericMem, debMem] = [alice, carolyn, matt, eric, deb]
  await prisma.deliverable.createMany({
    data: [
      { name: 'Project Charter',                   type: 'Planning',      status: 'Complete',    completionPct: 100, ownerId: michael.id, reviewerId: mattMem.id,   dueDate: new Date('2026-06-05') },
      { name: 'Research Framework',                type: 'Research',      status: 'Complete',    completionPct: 100, ownerId: aliceMem.id, reviewerId: ericMem.id,  dueDate: new Date('2026-06-12') },
      { name: 'Data Acquisition Plan',             type: 'Research',      status: 'In Progress', completionPct: 60,  ownerId: aliceMem.id, reviewerId: debMem.id,   dueDate: new Date('2026-06-28') },
      { name: 'PHA Segmentation Report',           type: 'Research',      status: 'Not Started', completionPct: 0,   ownerId: carolynMem.id, reviewerId: aliceMem.id, dueDate: new Date('2026-07-18') },
      { name: 'Interview Guides (Implementer & PHA)', type: 'Research',   status: 'Not Started', completionPct: 0,   ownerId: julietta.id, reviewerId: aliceMem.id, dueDate: new Date('2026-07-30') },
      { name: 'Implementer Interview Summary',     type: 'Research',      status: 'Not Started', completionPct: 0,   ownerId: carolynMem.id, reviewerId: aliceMem.id, dueDate: new Date('2026-09-05') },
      { name: 'PHA Interview Summary',             type: 'Research',      status: 'Not Started', completionPct: 0,   ownerId: carolynMem.id, reviewerId: aliceMem.id, dueDate: new Date('2026-09-20') },
      { name: 'Barrier Analysis Framework',        type: 'Analysis',      status: 'Not Started', completionPct: 0,   ownerId: aliceMem.id, reviewerId: ericMem.id,  dueDate: new Date('2026-09-28') },
      { name: 'Market Potential Analysis',         type: 'Analysis',      status: 'Not Started', completionPct: 0,   ownerId: aliceMem.id, reviewerId: ericMem.id,  dueDate: new Date('2026-10-05') },
      { name: 'Final Report',                      type: 'Report',        status: 'Not Started', completionPct: 0,   ownerId: aliceMem.id, reviewerId: mattMem.id,  dueDate: new Date('2026-10-27') },
      { name: 'Final Presentation Deck',           type: 'Presentation',  status: 'Not Started', completionPct: 0,   ownerId: michael.id, reviewerId: mattMem.id,  dueDate: new Date('2026-10-28') },
    ]
  })

  // ── Risks ────────────────────────────────────────────────────────
  await prisma.risk.createMany({
    data: [
      { name: 'IRB Approval Delay',              description: 'IRB review takes longer than expected, pushing interview timeline.', probability: 'Medium', impact: 'High',     status: 'Open',       mitigationPlan: 'Submit early; prepare protocol in parallel.', ownerId: debMem.id    },
      { name: 'Low PHA Interview Response Rate', description: 'PHAs decline to participate, reducing sample size.',                  probability: 'High',   impact: 'Critical', status: 'Open',       mitigationPlan: 'Expand outreach list; offer flexible scheduling.', ownerId: julietta.id },
      { name: 'ComEd Data Access Delayed',       description: 'ComEd unable to provide consumption data in time for analysis.',     probability: 'Medium', impact: 'High',     status: 'Open',       mitigationPlan: 'Escalate via project sponsor; use proxy datasets.', ownerId: michael.id },
      { name: 'Key Staff Unavailability',        description: 'Researcher illness or departure mid-study.',                         probability: 'Low',    impact: 'High',     status: 'Monitoring', mitigationPlan: 'Document all work; cross-train team members.', ownerId: mattMem.id  },
      { name: 'Scope Creep from Sponsor',        description: 'ComEd requests additional analysis beyond agreed scope.',             probability: 'Medium', impact: 'Medium',   status: 'Monitoring', mitigationPlan: 'Change order process in project charter.', ownerId: michael.id  },
      { name: 'Data Quality Issues',             description: 'HUD / PHA data incomplete or inconsistent.',                         probability: 'High',   impact: 'Medium',   status: 'Open',       mitigationPlan: 'Build extra cleaning time; document limitations.', ownerId: carolyn.id },
    ]
  })

  // ── Progress snapshots (weekly from Jun 1) ───────────────────────
  const snapshots = [
    { date: new Date('2026-06-01'), plannedPct: 2,  actualPct: 2,  tasksPct: 2,  interviewsPct: 0, deliverablesPct: 5,  riskPenalty: 0 },
    { date: new Date('2026-06-08'), plannedPct: 6,  actualPct: 7,  tasksPct: 7,  interviewsPct: 0, deliverablesPct: 10, riskPenalty: 0 },
    { date: new Date('2026-06-15'), plannedPct: 12, actualPct: 11, tasksPct: 11, interviewsPct: 0, deliverablesPct: 18, riskPenalty: 2 },
  ]
  await prisma.progressSnapshot.createMany({ data: snapshots })

  console.log('✓ Seed complete.')
  console.log(`  Members: 8 | Groups: 10 | Tasks: ${allTasks.length} | Dependencies: ${deps.length}`)
  console.log(`  Stakeholders: 10 | Barriers: 9 | Deliverables: 11 | Risks: 6`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
