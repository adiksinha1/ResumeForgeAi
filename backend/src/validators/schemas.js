import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const profileSchema = z.object({
  body: z.object({
    phone: z.string().optional(),
    address: z.string().optional(),
    portfolioUrl: z.string().url('Invalid URL format').or(z.string().length(0)).optional(),
    githubUsername: z.string().optional(),
    linkedinUrl: z.string().url('Invalid URL format').or(z.string().length(0)).optional(),
    skills: z.array(z.string()).optional(),
    experience: z.array(z.object({
      company: z.string(),
      role: z.string(),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.array(z.string()).optional()
    })).optional(),
    education: z.array(z.object({
      school: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      cgpa: z.string().optional(),
      current: z.boolean().optional()
    })).optional(),
    projects: z.array(z.object({
      title: z.string(),
      description: z.string(),
      technologies: z.array(z.string()).optional(),
      githubUrl: z.string().url('Invalid URL format').or(z.string().length(0)).optional(),
      liveUrl: z.string().url('Invalid URL format').or(z.string().length(0)).optional(),
      achievements: z.array(z.string()).optional()
    })).optional(),
    certifications: z.array(z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string().optional(),
      url: z.string().url('Invalid URL format').or(z.string().length(0)).optional()
    })).optional(),
    languages: z.array(z.object({
      language: z.string(),
      proficiency: z.string()
    })).optional(),
    achievements: z.array(z.string()).optional()
  })
});

export const resumeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Resume title is required').optional(),
    targetRole: z.string().optional(),
    templateId: z.string().optional(),
    styling: z.object({
      fontFamily: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      textColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      margin: z.string().optional(),
      spacing: z.string().optional(),
      pageSize: z.string().optional()
    }).optional(),
    sectionOrder: z.array(z.string()).optional(),
    sectionVisibility: z.object({
      summary: z.boolean().optional(),
      experience: z.boolean().optional(),
      education: z.boolean().optional(),
      projects: z.boolean().optional(),
      skills: z.boolean().optional(),
      certifications: z.boolean().optional(),
      languages: z.boolean().optional(),
      achievements: z.boolean().optional()
    }).optional(),
    personalInfo: z.object({
      name: z.string().optional(),
      email: z.string().email('Invalid email').or(z.string().length(0)).optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      portfolioUrl: z.string().optional(),
      githubUsername: z.string().optional(),
      linkedinUrl: z.string().optional()
    }).optional(),
    summary: z.string().optional(),
    experience: z.array(z.any()).optional(),
    education: z.array(z.any()).optional(),
    projects: z.array(z.any()).optional(),
    skills: z.array(z.string()).optional(),
    certifications: z.array(z.any()).optional(),
    languages: z.array(z.any()).optional(),
    achievements: z.array(z.string()).optional()
  })
});
