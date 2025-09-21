import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useJobStore from "@/stores/jobStore";
import useCandidateStore from "@/stores/candidateStore";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { jobs, loadJobs } = useJobStore();
  const { candidates, loadCandidates } = useCandidateStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    newApplications: 0,
    hired: 0,
    pending: 0,
  });

  useEffect(() => {
    loadJobs();
    loadCandidates({ pageSize: 1000 });
  }, [loadJobs, loadCandidates]);

  useEffect(() => {
    const safeJobs = jobs || [];
    const safeCandidates = candidates || [];
    
    const activeJobs = safeJobs.filter((job) => job.status === "active").length;
    const newApplications = safeCandidates.filter((candidate) => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(candidate.createdAt) > dayAgo;
    }).length;

    setStats({
      totalJobs: safeJobs.length,
      activeJobs,
      totalCandidates: safeCandidates.length,
      newApplications,
      hired: safeCandidates.filter((c) => c.stage === "hired").length,
      pending: safeCandidates.filter(
        (c) => !["hired", "rejected"].includes(c.stage)
      ).length,
    });
  }, [jobs, candidates]);

  const recentJobs = (jobs || [])
    .filter((job) => job.status === "active")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentCandidates = (candidates || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const getStageColor = (stage) => {
    const colors = {
      applied: "bg-blue-500",
      screen: "bg-yellow-500",
      tech: "bg-purple-500",
      offer: "bg-green-500",
      hired: "bg-emerald-600",
      rejected: "bg-red-500",
    };
    return colors[stage] || "bg-gray-500";
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your hiring pipeline and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalJobs}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} active positions
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalCandidates}
            </div>
            <p className="text-xs text-success">
              +{stats.newApplications} today
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.hired}</div>
            <p className="text-xs text-muted-foreground">
              Successful placements
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Active candidates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Job Postings</CardTitle>
              {/* <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button> */}
            </div>
            <CardDescription>Latest active job positions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{job.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {job.department}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {job.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="gradient-primary text-white"
                  >
                    {job.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {recentJobs.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No active jobs yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Candidates</CardTitle>
              {/* <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button> */}
            </div>
            <CardDescription>Latest candidate applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">
                    {candidate.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {candidate.email}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-white text-xs",
                      getStageColor(candidate.stage)
                    )}
                  >
                    {candidate.stage}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {recentCandidates.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No candidates yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/app/jobs" className="flex">
              <Button className="gradient-primary text-white h-auto p-4 flex-col space-y-2 w-full">
                <Briefcase className="h-6 w-6" />
                <span>Create New Job</span>
              </Button>
            </Link>
            <Link to="/app/candidates" className="flex">
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2 w-full">
              <Users className="h-6 w-6" />
              <span>Add Candidate</span>
            </Button>
            </Link>
            {/* <Link to="/app/assessments" className="flex">
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2 w-full">
              <Star className="h-6 w-6" />
              <span>Create Assessment</span>
            </Button>
            </Link> */}
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
