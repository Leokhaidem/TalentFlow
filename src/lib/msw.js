import { http, HttpResponse, delay } from "msw";
import { setupWorker } from "msw/browser";
import { db } from "./database.js";

const simulateNetworkConditions = async () => {
  await delay(200 + Math.random() * 1000);

  if (import.meta.env.DEV && Math.random() < 0.075) {
    throw new Error("Simulated network error");
  }
};

const handlers = [
  http.get("/api/jobs", async ({ request }) => {
    await delay(100 + Math.random() * 300);

    const url = new URL(request.url);
    const rawSearch = (url.searchParams.get("search") || "").trim();
    const rawStatus = (url.searchParams.get("status") || "").trim();
    const page = Number.parseInt(url.searchParams.get("page") || "1", 10) || 1;
    const pageSize =
      Number.parseInt(url.searchParams.get("pageSize") || "10", 10) || 10;
    const sort = (url.searchParams.get("sort") || "createdAt").trim();
    const order = (url.searchParams.get("order") || "asc").trim();

    const search = rawSearch.toLowerCase();
    const statusParam =
      rawStatus.toLowerCase() === "all" || rawStatus === ""
        ? null
        : rawStatus.toLowerCase();

    console.log("[MSW] /api/jobs params:", {
      search: rawSearch,
      status: rawStatus,
      page,
      pageSize,
      sort,
      order,
    });

    // Fetch jobs from Dexie
    let jobs;
    try {
      if (sort === "newest") {
        // createdAt descending by default
        try {
          jobs = await db.jobs.orderBy("createdAt").reverse().toArray();
        } catch (e) {
          jobs = await db.jobs.toArray();
          jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      } else if (sort === "oldest") {
        // createdAt ascending
        try {
          jobs = await db.jobs.orderBy("createdAt").toArray();
        } catch (e) {
          jobs = await db.jobs.toArray();
          jobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
      } else if (sort === "title") {
        // alphabetic by title
        try {
          jobs = await db.jobs.orderBy("title").toArray();
        } catch (e) {
          jobs = await db.jobs.toArray();
          jobs.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        }
      } else if (sort === "department") {
        // alphabetic by department
        try {
          jobs = await db.jobs.orderBy("department").toArray();
        } catch (e) {
          jobs = await db.jobs.toArray();
          jobs.sort((a, b) =>
            (a.department || "").localeCompare(b.department || "")
          );
        }
      } else {
        // fallback = newest
        jobs = await db.jobs.toArray();
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (err) {
      console.error("[MSW] Error reading jobs from db:", err);
      jobs = [];
    }

    if (order === "desc") jobs = jobs.reverse();

    console.log("[MSW] jobs before filters:", jobs.length);

    if (statusParam) {
      jobs = jobs.filter(
        (job) => (job.status || "").toLowerCase() === statusParam
      );
      console.log(`[MSW] after status filter (${statusParam}):`, jobs.length);
    }

    if (search) {
      jobs = jobs.filter((job) => {
        const title = (job.title || "").toLowerCase();
        const department = (job.department || "").toLowerCase();
        const tags = (job.tags || []).map((t) =>
          typeof t === "string" ? t.toLowerCase() : ""
        );
        return (
          title.includes(search) ||
          department.includes(search) ||
          tags.some((t) => t.includes(search))
        );
      });
      console.log(`[MSW] after search filter ("${search}") :`, jobs.length);
    }

    const total = jobs.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);

    console.log(
      `[MSW] returning page ${page} (${paginatedJobs.length}/${total})`
    );

    return HttpResponse.json({
      data: paginatedJobs,
      meta: { total, page, pageSize, totalPages },
    });
  }),

  http.post("/api/jobs", async ({ request }) => {
    await simulateNetworkConditions();

    const jobData = await request.json();
    const newJob = {
      id: `job-${Date.now()}`,
      title: jobData.title || "",
      slug: jobData.slug || "",
      status: jobData.status || "active",
      tags: jobData.tags || [],
      order: jobData.order || 0,
      department: jobData.department,
      location: jobData.location,
      description: jobData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.jobs.add(newJob);
    return HttpResponse.json({ data: newJob });
  }),
  http.get("/api/jobs/:id", async ({ params }) => {
    const { id } = params;
    const jobs = await db.jobs.toArray();
    const job = jobs.find((j) => j.id === id);
    if (!job) {
      return HttpResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return HttpResponse.json(job);
  }),
  http.patch("/api/jobs/:id", async ({ params, request }) => {
    await simulateNetworkConditions();

    const { id } = params;
    const updates = await request.json();

    await db.jobs.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    const updatedJob = await db.jobs.get(id);
    return HttpResponse.json({ data: updatedJob });
  }),

  http.patch("/api/jobs/:id/reorder", async ({ params, request }) => {
    await simulateNetworkConditions();

    const { id } = params;
    const { fromOrder, toOrder } = await request.json();

    // Update job order
    await db.jobs.update(id, { order: toOrder });

    const updatedJob = await db.jobs.get(id);
    return HttpResponse.json({ data: updatedJob });
  }),

  http.post("/api/jobs/reorder", async ({ request }) => {
    await simulateNetworkConditions();

    const { jobId, beforeId, newOrder } = await request.json();

    console.log("[MSW] Bulk reordering job:", { jobId, beforeId, newOrder });

    try {
      // Update the specific job with its new order value
      await db.jobs.update(jobId, {
        order: newOrder,
        updatedAt: new Date(),
      });

      // Get the updated job
      const updatedJob = await db.jobs.get(jobId);

      return HttpResponse.json({
        data: updatedJob,
      });
    } catch (error) {
      console.error("[MSW] Error reordering jobs:", error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // Candidates endpoints
  http.get("/api/candidates", async ({ request }) => {
    await delay(150 + Math.random() * 400);

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const stage = url.searchParams.get("stage");
    const jobId = url.searchParams.get("jobId") || "";

    let candidates = await db.candidates
      .orderBy("createdAt")
      .reverse()
      .toArray();

    // Apply filters
    if (search) {
      candidates = candidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (stage) {
      candidates = candidates.filter((candidate) => candidate.stage === stage);
    }

    if (jobId) {
      candidates = candidates.filter((candidate) => candidate.jobId === jobId);
    }

    // Return all candidates directly (no pagination)
    return HttpResponse.json({
      data: candidates,
    });
  }),

  http.post("/api/candidates", async ({ request }) => {
    await simulateNetworkConditions();

    const candidateData = await request.json();
    const newCandidate = {
      id: `candidate-${Date.now()}`,
      name: candidateData.name || "",
      email: candidateData.email || "",
      stage: candidateData.stage || "applied",
      jobId: candidateData.jobId || "",
      phone: candidateData.phone,
      resumeUrl: candidateData.resumeUrl,
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.candidates.add(newCandidate);

      // Create initial timeline event
      const initialTimelineEvent = {
        id: `timeline-${newCandidate.id}-application`,
        candidateId: newCandidate.id,
        type: "Application Submitted",
        description: "Candidate submitted their application",
        createdAt: new Date(),
      };

      await db.timelineEvents.add(initialTimelineEvent);

      return HttpResponse.json({ data: newCandidate });
    } catch (error) {
      console.error("Error creating candidate:", error);
      return new HttpResponse(null, { status: 500 });
    }
  }),
  http.get("/api/candidates/:id", async ({ params }) => {
    await simulateNetworkConditions();

    const { id } = params;

    try {
      const candidate = await db.candidates.get(id);

      if (!candidate) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json({ data: candidate });
    } catch (error) {
      console.error("Error fetching candidate:", error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  http.patch("/api/candidates/:id", async ({ params, request }) => {
    await simulateNetworkConditions();

    const { id } = params;
    const updates = await request.json();

    try {
      const candidate = await db.candidates.get(id);

      // If stage is being updated, create timeline event
      if (updates.stage && candidate && updates.stage !== candidate.stage) {
        const stageLabels = {
          applied: "Applied",
          screen: "Screening",
          tech: "Technical Interview",
          offer: "Offer Extended",
          hired: "Hired",
          rejected: "Rejected",
        };

        const timelineEvent = {
          id: `timeline-${id}-${Date.now()}`,
          candidateId: id,
          type: `Stage Changed to ${stageLabels[updates.stage]}`,
          description: `Moved from ${stageLabels[candidate.stage]} to ${
            stageLabels[updates.stage]
          }`,
          createdAt: new Date(),
        };

        await db.timelineEvents.add(timelineEvent);
      }

      await db.candidates.update(id, {
        ...updates,
        updatedAt: new Date(),
      });

      const updatedCandidate = await db.candidates.get(id);
      return HttpResponse.json({ data: updatedCandidate });
    } catch (error) {
      console.error("Error updating candidate:", error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  http.post("/api/candidates/:id/notes", async ({ params, request }) => {
    await simulateNetworkConditions();

    const { id } = params;
    const noteData = await request.json();
    const newNote = {
      id: `note-${Date.now()}`,
      ...noteData,
      createdAt: new Date(),
    };

    try {
      const candidate = await db.candidates.get(id);
      if (!candidate) {
        return new HttpResponse(null, { status: 404 });
      }

      const updatedNotes = [...(candidate.notes || []), newNote];
      await db.candidates.update(id, {
        notes: updatedNotes,
        updatedAt: new Date(),
      });

      // Create timeline event for note addition
      const timelineEvent = {
        id: `timeline-${id}-note-${Date.now()}`,
        candidateId: id,
        type: "Note Added",
        description: `Note: ${noteData.content}`,
        createdAt: new Date(),
      };

      await db.timelineEvents.add(timelineEvent);

      return HttpResponse.json({ data: newNote });
    } catch (error) {
      console.error("Error adding note:", error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // Timeline endpoints
  http.get("/api/candidates/:id/timeline", async ({ params }) => {
    await delay(100 + Math.random() * 200);

    const { id } = params;

    try {
      // Get all timeline events for this candidate and sort by date (newest first)
      console.log(db.timelineEvents);
      const timelineEvents = await db.timelineEvents
        .where("candidateId")
        .equals(id)
        .toArray();

      // Now you can sort
      timelineEvents.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return HttpResponse.json({ data: timelineEvents });
    } catch (error) {
      console.error("Error fetching timeline:", error);
      return HttpResponse.json({ data: [] });
    }
  }),

  http.post("/api/candidates/:id/timeline", async ({ params, request }) => {
    await simulateNetworkConditions();

    const { id } = params;
    const eventData = await request.json();

    const timelineEvent = {
      id: `timeline-${id}-${Date.now()}`,
      candidateId: id,
      type: eventData.type,
      description: eventData.description,
      createdAt: new Date(),
    };

    try {
      await db.timelineEvents.add(timelineEvent);
      return HttpResponse.json({ data: timelineEvent });
    } catch (error) {
      console.error("Error creating timeline event:", error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // Assessments endpoints
  http.get("/api/assessments/:jobId", async ({ params }) => {
    await delay(100 + Math.random() * 300);

    const { jobId } = params;
    console.log(`[MSW] Loading assessment for job: ${jobId}`);

    try {
      const assessment = await db.assessments
        .where("jobId")
        .equals(jobId)
        .first();

      if (!assessment) {
        console.log(`[MSW] No assessment found for job: ${jobId}`);
        return new HttpResponse(null, { status: 404 });
      }

      console.log(`[MSW] Found assessment:`, assessment);
      return HttpResponse.json({ data: assessment });
    } catch (error) {
      console.error(`[MSW] Error loading assessment:`, error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  http.put("/api/assessments/:jobId", async ({ params, request }) => {
    await simulateNetworkConditions();

    const { jobId } = params;
    const assessmentData = await request.json();

    const existingAssessment = await db.assessments
      .where("jobId")
      .equals(jobId)
      .first();

    if (existingAssessment) {
      await db.assessments.update(existingAssessment.id, {
        ...assessmentData,
        updatedAt: new Date(),
      });
    } else {
      await db.assessments.add({
        ...assessmentData,
        id: `assessment-${jobId}-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const updatedAssessment = await db.assessments
      .where("jobId")
      .equals(jobId)
      .first();
    return HttpResponse.json({ data: updatedAssessment });
  }),

  http.post("/api/assessments/:jobId/submit", async ({ params, request }) => {
    await simulateNetworkConditions();

    const { jobId } = params;
    const { candidateId, responses } = await request.json();

    const assessmentResponse = {
      id: `response-${Date.now()}`,
      assessmentId: `assessment-${jobId}`,
      candidateId,
      responses,
      completedAt: new Date(),
      createdAt: new Date(),
    };

    await db.assessmentResponses.add(assessmentResponse);
    return HttpResponse.json({ data: assessmentResponse });
  }),
];

// Setup MSW worker
export const worker = setupWorker(...handlers);

// Start the worker - FIXED: Now works in both development and production
// Only suppress console logs in production for cleaner experience
const shouldStart = true; // Always start MSW for this demo app
const isProduction = !import.meta.env.DEV;

if (shouldStart) {
  worker
    .start({
      onUnhandledRequest: "bypass",
      quiet: isProduction, // Suppress logs in production
    })
    .then(() => {
      if (!isProduction) {
        console.log("🔧 Mock Service Worker started");
      }
    })
    .catch((error) => {
      console.error("Failed to start MSW:", error);
    });
}
