import Dexie from "dexie";

export class TalentFlowDB extends Dexie {
  constructor() {
    super("TalentFlowDB");
    this.version(1).stores({
      jobs: "id, title, status, slug, order, createdAt",
      candidates: "id, name, email, stage, jobId, createdAt",
      assessments: "id, jobId, title, createdAt",
      assessmentResponses: "id, assessmentId, candidateId, createdAt",
      timelineEvents: "id, candidateId, type, createdAt",
    });
  }

  async seedData() {
    const existingJobs = await this.jobs.count();
    if (existingJobs > 0) return;

    console.log("Seeding TalentFlow database...");
    const jobTitles = [
      "Senior Frontend Developer",
      "Backend Engineer",
      "Product Manager",
      "UX/UI Designer",
      "DevOps Engineer",
      "Data Scientist",
      "Marketing Manager",
      "Sales Representative",
      "Customer Success Manager",
      "Technical Writer",
      "Quality Assurance Engineer",
      "Mobile Developer",
      "Engineering Manager",
      "Product Designer",
      "Business Analyst",
      "HR Specialist",
      "Security Engineer",
      "Machine Learning Engineer",
      "Growth Hacker",
      "Operations Manager",
      "Content Creator",
      "Financial Analyst",
      "Solution Architect",
      "Scrum Master",
      "Customer Support Specialist",
    ];

    const departments = [
      "Engineering",
      "Product",
      "Design",
      "Marketing",
      "Sales",
      "HR",
      "Operations",
    ];
    const locations = [
      "Remote",
      "New York",
      "San Francisco",
      "London",
      "Berlin",
      "Toronto",
    ];
    const tags = [
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "AWS",
      "Docker",
      "Agile",
      "Remote",
      "Full-time",
      "Senior",
      "Junior",
      "Mid-level",
    ];

    const jobs = jobTitles.map((title, index) => ({
      id: `job-${index + 1}`,
      title,
      slug: title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      status: Math.random() > 0.3 ? "active" : "archived",
      department: departments[Math.floor(Math.random() * departments.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      tags: tags.slice(0, Math.floor(Math.random() * 5) + 1),
      order: index + 1,
      description: `We are looking for a talented ${title} to join our growing team. This is an exciting opportunity to work on cutting-edge projects and make a real impact.`,
      createdAt: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ),
      updatedAt: new Date(),
    }));

    await this.jobs.bulkAdd(jobs);
    const firstNames = [
      "John",
      "Jane",
      "Alice",
      "Bob",
      "Charlie",
      "Diana",
      "Eve",
      "Frank",
      "Grace",
      "Henry",
      "Ivy",
      "Jack",
      "Kate",
      "Leo",
      "Mia",
      "Noah",
      "Olivia",
      "Peter",
      "Quinn",
      "Ruby",
    ];
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Gonzalez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Martin",
    ];
    const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

    const candidates = [];
    const timelineEvents = []; // Initialize timeline events array
    const activeJobs = jobs.filter((job) => job.status === "active");

    for (let i = 0; i < 1000; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const job = activeJobs[Math.floor(Math.random() * activeJobs.length)];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const candidateId = `candidate-${i + 1}`;
      const createdAt = new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
      );

      candidates.push({
        id: candidateId,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        stage,
        jobId: job.id,
        phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${
          Math.floor(Math.random() * 900) + 100
        }-${Math.floor(Math.random() * 9000) + 1000}`,
        notes: [],
        createdAt,
        updatedAt: new Date(),
      });

      // Create timeline events for each candidate
      const stageLabels = {
        applied: "Applied",
        screen: "Screening",
        tech: "Technical Interview",
        offer: "Offer Extended",
        hired: "Hired",
        rejected: "Rejected",
      };

      // Application submitted event
      timelineEvents.push({
        id: `timeline-${candidateId}-application`,
        candidateId,
        type: "Application Submitted",
        description: "Candidate submitted their application",
        createdAt,
      });

      // If not in applied stage, create stage progression events
      if (stage !== "applied") {
        const stageOrder = ["applied", "screen", "tech", "offer", "hired"];
        const currentStageIndex = stageOrder.indexOf(stage);

        // Create events for each stage up to current stage
        for (let j = 1; j <= currentStageIndex; j++) {
          const stageChangeDate = new Date(
            createdAt.getTime() + j * 2 * 24 * 60 * 60 * 1000
          ); // 2 days between stages
          const newStage = stageOrder[j];
          const prevStage = stageOrder[j - 1];

          timelineEvents.push({
            id: `timeline-${candidateId}-stage-${j}`,
            candidateId,
            type: `Stage Changed to ${stageLabels[newStage]}`,
            description: `Moved from ${stageLabels[prevStage]} to ${stageLabels[newStage]}`,
            createdAt: stageChangeDate,
          });
        }

        // If rejected, create rejection event instead
        if (stage === "rejected") {
          const rejectionDate = new Date(
            createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000
          ); // Random rejection within 2 weeks
          timelineEvents.push({
            id: `timeline-${candidateId}-rejected`,
            candidateId,
            type: "Stage Changed to Rejected",
            description: "Application was rejected",
            createdAt: rejectionDate,
          });
        }
      }

      // Add some random notes for variety
      if (Math.random() > 0.7) {
        // 30% chance of having a note
        const noteDate = new Date(
          createdAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000
        );
        const noteTexts = [
          "Strong technical background",
          "Good communication skills",
          "Cultural fit assessment needed",
          "Impressive portfolio",
          "Follow up scheduled",
          "Reference check completed",
          "Salary expectations discussed",
        ];
        const randomNote =
          noteTexts[Math.floor(Math.random() * noteTexts.length)];

        timelineEvents.push({
          id: `timeline-${candidateId}-note-${Date.now()}`,
          candidateId,
          type: "Note Added",
          description: `Note: ${randomNote}`,
          createdAt: noteDate,
        });
      }
    }

    await this.candidates.bulkAdd(candidates);
    await this.timelineEvents.bulkAdd(timelineEvents);

    // Seed Assessments for first few jobs
    const assessments = jobs.slice(0, 5).map((job) => ({
      id: `assessment-${job.id}`,
      jobId: job.id,
      title: `${job.title} Assessment`,
      description:
        "Please complete this assessment to help us evaluate your fit for this role.",
      sections: [
        {
          id: `section-1-${job.id}`,
          title: "Technical Skills",
          description:
            "Questions about your technical background and experience.",
          order: 0,
          questions: [
            {
              id: `q1-${job.id}`,
              type: "single-choice",
              title: "How many years of experience do you have in your field?",
              required: true,
              options: ["0-1 years", "1-3 years", "3-5 years", "5+ years"],
              order: 0,
            },
            {
              id: `q2-${job.id}`,
              type: "multi-choice",
              title: "Which technologies are you most comfortable with?",
              required: true,
              options: [
                "JavaScript",
                "Python",
                "React",
                "Node.js",
                "AWS",
                "Docker",
              ],
              order: 1,
            },
            {
              id: `q3-${job.id}`,
              type: "long-text",
              title: "Describe a challenging project you worked on recently.",
              required: true,
              validation: [
                {
                  type: "min-length",
                  value: 100,
                  message: "Please provide at least 100 characters",
                },
              ],
              order: 2,
            },
          ],
        },
        {
          id: `section-2-${job.id}`,
          title: "Background & Motivation",
          description: "Tell us about yourself and your career goals.",
          order: 1,
          questions: [
            {
              id: `q4-${job.id}`,
              type: "short-text",
              title: "What interests you most about this role?",
              required: true,
              validation: [
                {
                  type: "max-length",
                  value: 500,
                  message: "Please keep under 500 characters",
                },
              ],
              order: 0,
            },
            {
              id: `q5-${job.id}`,
              type: "numeric",
              title: "What are your salary expectations? (USD)",
              required: false,
              validation: [
                {
                  type: "min-value",
                  value: 30000,
                  message: "Minimum salary is $30,000",
                },
                {
                  type: "max-value",
                  value: 500000,
                  message: "Maximum salary is $500,000",
                },
              ],
              order: 1,
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await this.assessments.bulkAdd(assessments);

    console.log("Database seeded successfully!");
  }
}

export const db = new TalentFlowDB();

