import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let aiModel = null;

if (apiKey) {
  try {
    const ai = new GoogleGenerativeAI(apiKey);
    aiModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Gemini AI Service initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini SDK:', err.message);
  }
} else {
  console.log('No GEMINI_API_KEY provided. Operating in AI Simulation mode.');
}

// Strip markdown ```json ... ``` wrapper from Gemini response if present
const cleanJSONResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
};

const executePrompt = async (prompt, isJson = false, mockData = {}) => {
  if (aiModel) {
    try {
      const response = await aiModel.generateContent(prompt);
      const text = response.response.text();
      if (isJson) {
        try {
          const cleanedText = cleanJSONResponse(text);
          return JSON.parse(cleanedText);
        } catch (jsonErr) {
          console.error('Failed to parse Gemini JSON response, returning mock data:', jsonErr);
          // Try to regex parse or just fallback
          return mockData;
        }
      }
      return text;
    } catch (err) {
      console.error('Gemini Execution Error:', err.message);
      return isJson ? mockData : (mockData.text || 'AI service temporarily offline. Please verify API configuration.');
    }
  }
  // Simulated delay to feel realistic
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockData;
};

export const geminiService = {
  generateSummary: async (profile) => {
    const prompt = `Generate a compelling, ATS-optimized professional summary for a resume based on the following profile details: ${JSON.stringify(profile)}. Keep it under 4 sentences, focusing on key strengths, experience level, and core technologies. Return a raw JSON object with a single key "summary".`;
    
    // Tailor summary dynamically based on user profile details
    const skillsList = profile.skills && profile.skills.length ? profile.skills.slice(0, 4).join(', ') : 'Software Engineering';
    const role = profile.targetRole || 'Software Engineer';
    const summaryText = `Dedicated and detail-oriented ${role} with a strong foundation in core engineering principles and hands-on experience in ${skillsList}. Adept at quick learning, systematic problem-solving, and collaborating across cross-functional teams to deliver clean software solutions and optimize performance architectures.`;
    
    const mock = { summary: summaryText };
    return executePrompt(prompt, true, mock);
  },

  improveBulletPoints: async (bullets) => {
    const prompt = `Take the following list of resume bullet points and rewrite them to be highly professional, action-oriented, and highlight measurable achievements (STAR format): ${JSON.stringify(bullets)}. Return a raw JSON object with a key "bullets" containing an array of improved strings.`;
    
    // Dynamically rewrite bullet points based on content keywords
    const improved = (bullets || []).map(b => {
      const lower = b.toLowerCase();
      if (lower.includes('analytics') || lower.includes('dashboard')) {
        return 'Spearheaded design and development of high-performance analytics dashboards, reducing query render overhead by 35%.';
      }
      if (lower.includes('state') || lower.includes('redux') || lower.includes('context')) {
        return 'Refactored global state management structures, improving application load speeds by 25% and resolving memory leak issues.';
      }
      if (lower.includes('react') || lower.includes('vue') || lower.includes('frontend')) {
        return 'Engineered reusable UI components using advanced React patterns, boosting frontend code efficiency and consistency by 30%.';
      }
      if (lower.includes('database') || lower.includes('sql') || lower.includes('mongo')) {
        return 'Optimized database schema indexing and query pipelines, cutting retrieval latencies by 45% under peak traffic.';
      }
      if (lower.includes('test') || lower.includes('jest') || lower.includes('qa')) {
        return 'Implemented automated testing suites with 92% coverage, successfully capturing critical edge-case bugs pre-release.';
      }
      // General action verb enhancement fallback
      const cleanBullet = b.replace(/^(?:helped in|wrote|worked on|did|responsible for)\s+/i, '');
      const firstCap = cleanBullet.charAt(0).toUpperCase() + cleanBullet.slice(1);
      return `Spearheaded execution of "${firstCap.replace(/\.$/, '')}", boosting system operational throughput by 20% and improving delivery timelines.`;
    });

    const mock = { bullets: improved };
    return executePrompt(prompt, true, mock);
  },

  suggestSkills: async (profile) => {
    const prompt = `Based on the following profile details: ${JSON.stringify(profile)}, suggest 8 relevant technologies, soft skills, or domain expertise areas that would strengthen this resume. Return a raw JSON object with a key "skills" containing an array of strings.`;
    const mock = { skills: ['System Design', 'TypeScript', 'Jest', 'CI/CD Pipelines', 'REST APIs', 'Cloud Computing (AWS)', 'Agile Methodologies', 'Docker'] };
    return executePrompt(prompt, true, mock);
  },

  suggestCertifications: async (profile) => {
    const prompt = `Suggest 4 highly valuable professional certifications for someone with the following profile: ${JSON.stringify(profile)}. Return a raw JSON object with a key "certifications" containing an array of objects with keys: "name", "issuer", "description".`;
    const mock = {
      certifications: [
        { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', description: 'Validates expertise in designing and deploying scalable systems on AWS.' },
        { name: 'Certified ScrumMaster (CSM)', issuer: 'Scrum Alliance', description: 'Demonstrates understanding of Agile methodologies and Scrum framework.' },
        { name: 'MongoDB Certified Developer', issuer: 'MongoDB', description: 'Validates proficiency in developing applications using MongoDB.' },
        { name: 'Google Cloud Associate Cloud Engineer', issuer: 'Google Cloud', description: 'Demonstrates ability to deploy apps, monitor operations, and manage enterprise solutions.' }
      ]
    };
    return executePrompt(prompt, true, mock);
  },

  generateATSKeywords: async (role, details) => {
    const prompt = `Given the target role "${role}" and the following user profile details: ${JSON.stringify(details)}, output 10 industry-standard keywords/skills that an applicant must have to pass automated ATS filters. Return a raw JSON object with a key "keywords" containing an array of strings.`;
    const mock = { keywords: ['Scalability', 'Microservices', 'Git', 'Agile', 'Unit Testing', 'Relational Databases', 'UI/UX Design', 'Kubernetes', 'API Security', 'State Management'] };
    return executePrompt(prompt, true, mock);
  },

  createCoverLetter: async (company, role, resume, jobDescription) => {
    const prompt = `Create a professional cover letter for the role "${role}" at "${company}". Customize it based on the candidate's resume: ${JSON.stringify(resume)}. Address the requirements in the job description: "${jobDescription}". Return a raw JSON object with keys "subject", "body".`;
    const mock = {
      subject: `Application for ${role} position at ${company}`,
      body: `Dear Hiring Team at ${company},\n\nI am writing to express my strong interest in the ${role} position at ${company}. With my background in software development and experience building modern, scalable applications, I am confident in my ability to make an immediate impact on your engineering team.\n\nThroughout my career, I have honed my skills in modern technologies, including React, Node.js, and cloud systems. In my previous work, I successfully designed features that improved user engagement and refactored backend structures to reduce server latency. I am drawn to ${company}'s commitment to innovation and would love the opportunity to contribute to your upcoming projects.\n\nThank you for your time and consideration. I look forward to the possibility of discussing how my experience aligns with your team's needs.\n\nSincerely,\n[Your Name]`
    };
    return executePrompt(prompt, true, mock);
  },

  analyzeJobDescription: async (resume, jobDescription) => {
    const prompt = `Perform a comprehensive match analysis between the user's resume: ${JSON.stringify(resume)} and this job description: "${jobDescription}". Estimate the ATS match percentage. Detail missing keywords, formatting suggestions, and weak bullet points. Return a raw JSON object with keys: "matchPercentage" (number), "missingKeywords" (array of strings), "formattingSuggestions" (array of strings), "weakBullets" (array of strings), "optimizedBullets" (array of strings).`;
    const mock = {
      matchPercentage: 78,
      missingKeywords: ['Redux State Management', 'GraphQL', 'AWS Lambdas', 'Integration Testing'],
      formattingSuggestions: ['Ensure dates are aligned consistently on the right margin.', 'Include a dedicated section for technical achievements.'],
      weakBullets: ['Responsible for writing front-end code.', 'Helped in fixing database bugs.'],
      optimizedBullets: ['Developed responsive frontend components using React and Redux, improving user conversion rates by 15%.', 'Resolved database performance issues, reducing query latency by 40% using MongoDB indexing.']
    };
    return executePrompt(prompt, true, mock);
  },

  compareResumes: async (resumeA, resumeB) => {
    const prompt = `Compare two versions of a resume: Version A: ${JSON.stringify(resumeA)} and Version B: ${JSON.stringify(resumeB)}. Calculate their ATS match difference, evaluate strengths/weaknesses of each, and recommend which one is better. Return a raw JSON object with keys: "scoreDifference" (number), "strengthsA" (array), "strengthsB" (array), "weaknessesA" (array), "weaknessesB" (array), "recommendation" (string).`;
    const mock = {
      scoreDifference: 12,
      strengthsA: ['Clear contact details', 'Strong education section'],
      strengthsB: ['Action-oriented STAR achievements', 'Higher density of industry-specific keywords', 'Projects link to live repositories'],
      weaknessesA: ['Lacks impact metrics in project descriptions', 'Skills list is generic'],
      weaknessesB: ['Slightly longer formatting'],
      recommendation: 'Version B is significantly better due to its usage of action verbs and measurable performance impact metrics.'
    };
    return executePrompt(prompt, true, mock);
  },

  createCareerRoadmap: async (role, skills) => {
    const prompt = `Generate a customized 5-step career learning roadmap for a candidate aiming to become a "${role}". Their current skills are: ${JSON.stringify(skills)}. Return a raw JSON object with a key "roadmap" containing an array of objects with keys: "step" (number), "title" (string), "description" (string), "resources" (array of strings), "skillsToLearn" (array of strings).`;
    const mock = {
      roadmap: [
        { step: 1, title: 'Master Core Programming & Advanced Languages', description: 'Deepen knowledge in advanced JavaScript/TypeScript patterns, algorithms, and data structures.', resources: ['MDN Web Docs', 'You Don\'t Know JS', 'LeetCode'], skillsToLearn: ['TypeScript', 'Design Patterns'] },
        { step: 2, title: 'System Design & Architecture', description: 'Understand horizontal/vertical scaling, database partitioning, load balancing, caching, and message queues.', resources: ['System Design Primer (GitHub)', 'ByteByteGo'], skillsToLearn: ['Redis', 'RabbitMQ', 'SQL Optimization'] },
        { step: 3, title: 'Cloud Engineering & DevOps', description: 'Gain proficiency in cloud providers (AWS/GCP), containerization, and automated deployments.', resources: ['AWS Skill Builder', 'Docker & Kubernetes (Udemy)'], skillsToLearn: ['Docker', 'AWS ECS/S3', 'GitHub Actions'] },
        { step: 4, title: 'AI Integration & Engineering', description: 'Learn how to consume, embed, and fine-tune large language models in enterprise web environments.', resources: ['DeepLearning.AI', 'LangChain documentation'], skillsToLearn: ['Vector Databases', 'Prompt Engineering', 'Gemini APIs'] },
        { step: 5, title: 'Leadership & Project Stewardship', description: 'Build experience in mentoring junior engineers, running Scrum meetings, and managing client deliverables.', resources: ['Scrum Guide', 'The Mythical Man-Month'], skillsToLearn: ['Agile Leadership', 'Technical Mentoring'] }
      ]
    };
    return executePrompt(prompt, true, mock);
  },

  generateInterviewQuestions: async (resumeData) => {
    const prompt = `Analyze the candidate resume: ${JSON.stringify(resumeData)}. Generate a list of standard interview questions. Create 3 HR questions, 3 technical questions (role specific), 3 Java/coding/DSA questions, 3 behavioral questions, and 3 system design questions. Return a raw JSON object with keys: "hr" (array), "technical" (array), "coding" (array), "behavioral" (array), "system" (array) - each containing objects with keys "question" and "suggestedAnswer".`;
    const mock = {
      hr: [
        { question: 'Tell me about yourself and your background.', suggestedAnswer: 'Briefly summarize your journey, key projects from your resume, and why your skills make you a good fit for this role.' },
        { question: 'Why do you want to join our company?', suggestedAnswer: 'Connect your values and technical interests to the company\'s products and mission statement.' },
        { question: 'Where do you see yourself in five years?', suggestedAnswer: 'Express a desire to grow as a technical leader, mastering engineering challenges and guiding team projects.' }
      ],
      technical: [
        { question: 'What is the difference between Virtual DOM and Shadow DOM?', suggestedAnswer: 'Virtual DOM is a React concept for optimizing UI renders, while Shadow DOM is a browser technology for scoping CSS styles.' },
        { question: 'How does indexing work in MongoDB?', suggestedAnswer: 'Indexes store a small portion of the dataset in an easy-to-traverse form, allowing fast queries by mapping keys to document IDs.' },
        { question: 'Explain JWT authentication and how to prevent token leakage.', suggestedAnswer: 'JWTs encode claims signed with a secret. Store tokens in secure, HttpOnly cookies to defend against XSS attacks.' }
      ],
      coding: [
        { question: 'How would you reverse a linked list in place?', suggestedAnswer: 'Maintain pointers to previous, current, and next nodes, iterate through the list, and update current node pointers.' },
        { question: 'Explain how Map and Set work in JavaScript.', suggestedAnswer: 'Maps hold key-value pairs (any key type is allowed), and Sets hold unique values, both offering fast constant-time lookup.' },
        { question: 'Write a function to check if a string is a palindrome.', suggestedAnswer: 'Compare characters from start and end moving inward, returning false if a mismatch occurs, or true if they meet.' }
      ],
      behavioral: [
        { question: 'Describe a time you faced a technical conflict in a team. How did you resolve it?', suggestedAnswer: 'Explain the issue objectively, present the data/prototypes analyzed, and describe how you reached a consensual decision.' },
        { question: 'Tell me about a project that failed. What did you learn?', suggestedAnswer: 'Highlight what unexpected challenges occurred, how you handled communication, and what engineering process you improved since.' },
        { question: 'How do you handle tight deadlines?', suggestedAnswer: 'Prioritize key functional deliverables, establish clear communication milestones with stakeholders, and avoid unnecessary refactoring.' }
      ],
      system: [
        { question: 'How would you design a real-time notification service?', suggestedAnswer: 'Use WebSockets or Server-Sent Events (SSE) backed by a Redis Pub/Sub mechanism to distribute alerts dynamically to client instances.' },
        { question: 'How would you handle high image traffic for a portfolio website?', suggestedAnswer: 'Use Cloudinary or an S3 bucket integrated with a CDN (CloudFront) to cache assets closer to users, utilizing lazy loading.' },
        { question: 'Design an API rate limiter.', suggestedAnswer: 'Implement a token bucket or sliding window algorithm stored in Redis to track IP request counts over specified intervals.' }
      ]
    };
    return executePrompt(prompt, true, mock);
  },

  chatCareerBot: async (history, message) => {
    // history: [{ role: 'user', content: '...' }, { role: 'model', content: '...' }]
    const prompt = `You are a helpful AI Career Coach called ResumeForge Coach.
    Previous chat history: ${JSON.stringify(history)}.
    User message: "${message}".
    Provide a professional, brief, actionable career advice. Return a raw JSON object with keys "response" (string) and "suggestedActions" (array of strings).`;
    const mock = {
      response: `To optimize your resume for Amazon, you should focus heavily on the Leadership Principles. Rewrite your experience bullet points to emphasize customer obsession, ownership, and deliver results. Use the STAR format, showing exactly what actions you took and the measurable business outcome.`,
      suggestedActions: [
        'Add quantitative metrics (%, $, hours) to experiences',
        'Incorporate Amazon Leadership Principle keywords',
        'Review and tailor projects in the STAR editor'
      ]
    };
    return executePrompt(prompt, true, mock);
  }
};
