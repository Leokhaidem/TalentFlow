import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  Users,
  Briefcase,
  FileText,
  CheckCircle2,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: Briefcase,
      title: "Job Management",
      description:
        "Create, edit, and manage job postings with advanced filtering and search capabilities.",
    },
    {
      icon: Users,
      title: "Candidate Pipeline",
      description:
        "Track candidates through stages with drag-and-drop kanban boards and detailed profiles.",
    },
    {
      icon: FileText,
      title: "Custom Assessments",
      description:
        "Build interactive assessments with multiple question types and conditional logic.",
    },
    // {
    //   icon: TrendingUp,
    //   title: 'Analytics Dashboard',
    //   description: 'Get insights into your hiring pipeline with comprehensive analytics and reporting.'
    // },
    // {
    //   icon: Shield,
    //   title: 'Secure & Reliable',
    //   description: 'Enterprise-grade security with local data storage and backup capabilities.'
    // },
    // {
    //   icon: CheckCircle2,
    //   title: 'Workflow Automation',
    //   description: 'Streamline repetitive tasks with automated workflows and notifications.'
    // }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              TalentFlow
            </span>
          </div>
          <Link to="/app">
            <Button className="gradient-primary text-white shadow-elegant hover:shadow-lg transition-smooth">
              Launch App
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge
            variant="secondary"
            className="mb-6 gradient-primary text-white"
          >
            Mini Hiring Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Streamline Your
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent block">
              Hiring Process
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A comprehensive platform for managing jobs, candidates, and
            assessments. Built with modern technology and designed for HR teams
            who value efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app">
              <Button
                size="lg"
                className="gradient-primary text-white shadow-elegant hover:shadow-lg transition-smooth"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {/* <Button size="lg" variant="outline">
              View Demo
            </Button> */}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make hiring simple, efficient, and
            effective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="card-interactive transition-smooth hover:shadow-lg"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16 ">
        <Card className="card-elevated bg-gradient-to-r from-primary/5 to-primary-hover/5 border-primary/10">
          <CardContent className="p-12 items-center">
            <div className="flex justify-center gap-16 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">
                  1000+
                </div>
                <div className="text-muted-foreground">Candidate Profiles</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">25+</div>
                <div className="text-muted-foreground">Job Positions</div>
              </div>
              {/* <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Local Storage</div>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of HR professionals who trust TalentFlow to
            streamline their recruitment process.
          </p>
          <Link to="/app">
            <Button
              size="lg"
              className="gradient-primary text-white shadow-elegant hover:shadow-lg transition-smooth"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              TalentFlow
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with React, Zustand, and Shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}
