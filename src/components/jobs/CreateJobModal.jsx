import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import useJobStore from "@/stores/jobStore";

export default function CreateJobModal({ isOpen, onClose, jobToEdit = null }) {
  const { createJob, updateJob, jobs } = useJobStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: jobToEdit?.title || "",
    department: jobToEdit?.department || "",
    location: jobToEdit?.location || "",
    description: jobToEdit?.description || "",
    status: jobToEdit?.status || "active",
    tags: jobToEdit?.tags || [],
    tagInput: "",
  });

  const [errors, setErrors] = useState({});

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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    // Check for unique slug (only when creating new job)
    if (!jobToEdit) {
      const slug = generateSlug(formData.title);
      const existingJob = jobs.find((job) => job.slug === slug);
      if (existingJob) {
        newErrors.title = "A job with this title already exists";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const jobData = {
        title: formData.title.trim(),
        slug: generateSlug(formData.title),
        department: formData.department,
        location: formData.location,
        description: formData.description.trim(),
        status: formData.status,
        tags: formData.tags,
      };

      if (jobToEdit) {
        await updateJob(jobToEdit.id, jobData);
      } else {
        await createJob(jobData);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to save job:", error.message || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      department: "",
      location: "",
      description: "",
      status: "active",
      tags: [],
      tagInput: "",
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    if (!jobToEdit) {
      resetForm();
    }
  };

  const addTag = (e) => {
    if (e.key === "Enter" && formData.tagInput.trim()) {
      e.preventDefault();
      const newTag = formData.tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
          tagInput: "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, tagInput: "" }));
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{jobToEdit ? "Edit Job" : "Create New Job"}</DialogTitle>
          <DialogDescription>
            {jobToEdit
              ? "Update job details"
              : "Fill in the details to create a new job posting"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={errors.title ? "border-destructive" : ""}
                placeholder="e.g. Senior Frontend Developer"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, department: value }))
                }
              >
                <SelectTrigger
                  className={errors.department ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-destructive mt-1">
                  {errors.department}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, location: value }))
                }
              >
                <SelectTrigger
                  className={errors.location ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-sm text-destructive mt-1">
                  {errors.location}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the role, requirements, and what makes it exciting..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tagInput}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tagInput: e.target.value }))
              }
              onKeyDown={addTag}
              placeholder="Press Enter to add tags (e.g. JavaScript, React, Remote)"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="pr-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gradient-primary text-white"
            >
              {isSubmitting
                ? "Saving..."
                : jobToEdit
                ? "Update Job"
                : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
