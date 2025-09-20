# TalentFlow - HR Management System

A React application for HR teams to manage jobs, candidates, and assessments with drag-and-drop functionality and offline-first architecture.

## Features

- **Jobs Management**: Create, edit, archive jobs with drag-and-drop reordering and optimistic updates
- **Candidate Pipeline**: Kanban board with 6-stage workflow, virtual scrolling for 1000+ candidates
- **Assessment Builder**: Job-specific forms with conditional logic and real-time validation
- **Notes & Timeline**: Track candidate interactions with @mentions and complete audit trails
- **Offline-First**: All data persists locally with MSW simulating realistic network conditions

## Tech Stack

- **React 19** with Vite and React Router DOM
- **Zustand** for state management with localStorage persistence
- **Dexie (IndexedDB)** for local data storage and querying
- **MSW** for API simulation with artificial latency and error rates
- **Tailwind CSS + Radix UI** for styling and accessibility
- **@dnd-kit** for drag-and-drop with keyboard support

## Quick Start

```bash
git clone <repository-url>
cd TalentFlow
npm install
npm run dev
```

Open http://localhost:5173

## Architecture Highlights

**Write-Through Persistence**: MSW simulates network layer while IndexedDB provides actual persistence
```
Component → Zustand Store → MSW Handler → IndexedDB → UI Update
```

**Optimistic Updates with Rollback**:
```javascript
const moveCandidate = async (candidateId, newStage) => {
  const originalCandidates = [...candidates];
  
  // Immediate UI update
  setCandidates(candidates.map(c => 
    c.id === candidateId ? {...c, stage: newStage} : c
  ));
  
  try {
    await api.updateCandidate(candidateId, {stage: newStage});
  } catch (error) {
    setCandidates(originalCandidates); // Rollback
    toast.error('Failed to update candidate');
  }
};
```

**Performance Optimizations**:
- Virtual scrolling for 1000+ candidate lists
- Debounced search with 300ms delay
- Indexed database queries for fast filtering
- Route-based code splitting

## Key Implementation Details

**Assessment Conditional Logic**:
```javascript
const shouldShowQuestion = (question, responses) => {
  if (!question.conditionalLogic) return true;
  
  const { dependsOn, operator, value } = question.conditionalLogic;
  const dependentResponse = responses[dependsOn];
  
  switch (operator) {
    case 'equals': return dependentResponse === value;
    case 'contains': return dependentResponse?.includes(value);
    default: return true;
  }
};
```

**Error Simulation**: MSW injects 5-10% error rate on write operations to test error boundaries and user feedback systems.

**Database Schema**:
```javascript
{
  jobs: "id, title, status, slug, order, createdAt",
  candidates: "id, name, email, stage, jobId, createdAt",
  assessments: "id, jobId, title, createdAt",
  assessmentResponses: "id, assessmentId, candidateId, createdAt",
  timelineEvents: "id, candidateId, type, createdAt"
}
```

## Project Structure

```
src/
├── components/         # Feature-specific components
│   ├── jobs/          # Job management UI
│   ├── candidates/    # Candidate pipeline UI  
│   └── assessments/   # Assessment builder UI
├── stores/            # Zustand state management
├── lib/               # Database & MSW configuration
├── pages/             # Route components
└── hooks/             # Custom React hooks
```

## Known Limitations

- File upload UI only (no backend processing)
- No authentication or user management
- Desktop-focused design (mobile needs improvement)
- Client-side only (no real API integration)

## Seeded Data

- 25 jobs (mixed active/archived across departments)
- 1000 candidates randomly distributed across stages
- 3+ complete assessments with conditional logic
- Full timeline history for all candidate interactions

## Live Demo