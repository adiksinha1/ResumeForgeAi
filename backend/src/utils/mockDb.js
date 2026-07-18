import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), '..', 'mock_db_data.json');

export const saveToFile = () => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save mock database to file:', err.message);
  }
};

export const loadFromFile = () => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      Object.keys(inMemoryDb).forEach(key => {
        if (parsed[key] && Array.isArray(parsed[key])) {
          inMemoryDb[key] = parsed[key];
        }
      });
      // Ensure demo user is always present
      const hasDemoUser = inMemoryDb.users.some(u => u.email === 'demo@resumeforge.ai');
      if (!hasDemoUser) {
        seedDemoUser();
      }
      console.log('Persistent mock database loaded from:', DB_FILE_PATH);
    } else {
      seedDemoUser();
      saveToFile();
    }
  } catch (err) {
    console.error('Failed to load mock database from file:', err.message);
    seedDemoUser();
  }
};

// Complete local JS database collections
export const inMemoryDb = {
  users: [],
  profiles: [],
  resumes: [],
  resumeversions: [],
  coverletters: [],
  jobdescriptions: [],
  atsreports: [],
  notifications: []
};

// Seed initial details so that "Try Demo Mode" logs in instantly with data
const seedDemoUser = () => {
  const demoUserId = new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d1');
  const demoUser = {
    _id: demoUserId,
    name: 'Alex Mercer',
    email: 'demo@resumeforge.ai',
    password: 'demopassword123',
    isVerified: true,
    role: 'user',
    createdAt: new Date(),
    comparePassword: async () => true
  };
  inMemoryDb.users.push(demoUser);

  const demoProfile = {
    _id: new mongoose.Types.ObjectId(),
    user: demoUserId,
    phone: '+1 (555) 019-2834',
    address: 'San Francisco, CA',
    portfolioUrl: 'https://alexmercer.dev',
    githubUsername: 'alexmercer',
    linkedinUrl: 'https://linkedin.com/in/alex-mercer',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'TypeScript', 'Docker', 'AWS', 'Jest', 'Tailwind CSS'],
    experience: [
      {
        company: 'Stripe',
        role: 'Software Engineer II',
        location: 'San Francisco, CA',
        startDate: '2024-03',
        endDate: '',
        current: true,
        description: [
          'Developed and optimized developer dashboard components using React and TypeScript, increasing user interaction speed by 35%.',
          'Refactored checkout API endpoints, reducing median latency by 120ms through intelligent Redis caching strategies.',
          'Collaborated with product designers to implement responsive, pixel-perfect layouts matching Vercel/Stripe aesthetics.'
        ]
      },
      {
        company: 'Vercel',
        role: 'Junior Frontend Developer',
        location: 'Remote',
        startDate: '2022-06',
        endDate: '2024-02',
        current: false,
        description: [
          'Shipped modular dashboard cards and components integrated with Next.js router configurations.',
          'Wrote over 40+ unit and integration tests with Jest and Testing Library, increasing test coverage from 72% to 94%.',
          'Implemented smooth layout transition animations utilizing Framer Motion, enhancing user satisfaction ratings.'
        ]
      }
    ],
    education: [
      {
        school: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2018-09',
        endDate: '2022-06',
        cgpa: '3.92',
        current: false
      }
    ],
    projects: [
      {
        title: 'ResumeForge AI Builder',
        description: 'A full-stack, state-of-the-art resume builder platform that analyzes and scores ATS optimization levels in real time.',
        technologies: ['React', 'Redux', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Gemini API'],
        githubUrl: 'https://github.com/alexmercer/resumeforge',
        liveUrl: 'https://resumeforge.ai',
        achievements: [
          'Engineered custom parsing engine using Puppeteer to generate high-quality PDF templates in milliseconds.',
          'Designed a live ATS score meter showing score feedback in real time with interactive suggestions.'
        ]
      }
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2025-01', url: 'https://aws.amazon.com' }
    ],
    languages: [{ language: 'English', proficiency: 'Native' }, { language: 'Spanish', proficiency: 'Conversational' }],
    achievements: [
      'First place at Stanford Hackathon 2021 for AI-powered education assistant.',
      'Open-source contributor to major React and Next.js libraries with over 500+ stars combined.'
    ]
  };
  inMemoryDb.profiles.push(demoProfile);
};

// Mimics a Mongoose query builder chain (.sort().select().then())
class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort() { return this; }
  select() { return this; }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.data).then(onfulfilled, onrejected);
  }
}

// Mimics a Mongoose Document instance with .save() and .toObject() hooks
const makeDoc = (item, collectionName) => {
  if (!item) return null;
  const doc = {
    ...item,
    toObject() { return { ...this }; },
    save: function() {
      const list = inMemoryDb[collectionName];
      const idx = list.findIndex(x => x._id.toString() === this._id.toString());
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...this };
      } else {
        list.push(this);
      }
      saveToFile();
      return Promise.resolve(this);
    }
  };
  if (collectionName === 'users') {
    doc.comparePassword = async function(candidatePassword) {
      return candidatePassword === this.password;
    };
  }
  return doc;
};

export const patchModel = (model, collectionName) => {
  const originalFindOne = model.findOne;
  const originalFindById = model.findById;
  const originalFind = model.find;
  const originalCreate = model.create;
  const originalFindOneAndDelete = model.findOneAndDelete;
  const originalFindByIdAndDelete = model.findByIdAndDelete;
  const originalCountDocuments = model.countDocuments;
  const originalDeleteMany = model.deleteMany;

  model.findOne = function(query) {
    if (mongoose.connection.readyState === 1) {
      return originalFindOne.apply(this, arguments);
    }
    const list = inMemoryDb[collectionName] || [];
    let found = null;
    
    if (query?.email) {
      found = list.find(x => x.email === query.email);
    } else if (query?.user) {
      found = list.find(x => x.user?.toString() === query.user.toString());
    } else if (query?.verificationToken) {
      found = list.find(x => x.verificationToken === query.verificationToken);
    } else if (query?._id) {
      found = list.find(x => x._id?.toString() === query._id.toString());
    }
    
    return new MockQuery(makeDoc(found, collectionName));
  };

  model.findById = function(id) {
    if (mongoose.connection.readyState === 1) {
      return originalFindById.apply(this, arguments);
    }
    const list = inMemoryDb[collectionName] || [];
    const found = list.find(x => x._id?.toString() === id?.toString());
    return new MockQuery(makeDoc(found, collectionName));
  };

  model.find = function(query) {
    if (mongoose.connection.readyState === 1) {
      return originalFind.apply(this, arguments);
    }
    const list = inMemoryDb[collectionName] || [];
    let filtered = [...list];
    if (query?.user) {
      filtered = list.filter(x => x.user?.toString() === query.user.toString());
    }
    return new MockQuery(filtered.map(x => makeDoc(x, collectionName)));
  };

  model.create = function(data) {
    if (mongoose.connection.readyState === 1) {
      return originalCreate.apply(this, arguments);
    }
    const list = inMemoryDb[collectionName] || [];
    
    let defaultedData = { ...data };
    if (collectionName === 'resumes') {
      defaultedData = {
        styling: {
          fontFamily: 'Inter',
          primaryColor: '#0f172a',
          secondaryColor: '#475569',
          textColor: '#334155',
          backgroundColor: '#ffffff',
          margin: 'comfortable',
          spacing: 'normal',
          pageSize: 'A4'
        },
        sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'languages', 'achievements'],
        sectionVisibility: {
          summary: true,
          experience: true,
          education: true,
          projects: true,
          skills: true,
          certifications: true,
          languages: true,
          achievements: true
        },
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
        languages: [],
        achievements: [],
        atsScore: 0,
        ...data
      };
      
      if (data.styling) {
        defaultedData.styling = { ...defaultedData.styling, ...data.styling };
      }
      if (data.sectionVisibility) {
        defaultedData.sectionVisibility = { ...defaultedData.sectionVisibility, ...data.sectionVisibility };
      }
    } else if (collectionName === 'profiles') {
      defaultedData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        languages: [],
        achievements: [],
        ...data
      };
    } else if (collectionName === 'users') {
      defaultedData = {
        isVerified: false,
        role: 'user',
        ...data
      };
    }

    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...defaultedData
    };
    
    if (collectionName === 'users') {
      newItem.comparePassword = async () => true;
    }
    
    list.push(newItem);
    saveToFile();
    return Promise.resolve(makeDoc(newItem, collectionName));
  };

  model.findOneAndDelete = function(query) {
    if (mongoose.connection.readyState === 1) {
      return originalFindOneAndDelete.apply(this, arguments);
    }
    const list = inMemoryDb[collectionName] || [];
    let idx = -1;
    if (query?._id) {
      idx = list.findIndex(x => x._id?.toString() === query._id.toString());
    }
    let found = null;
    if (idx !== -1) {
      found = list[idx];
      list.splice(idx, 1);
      saveToFile();
    }
    return new MockQuery(makeDoc(found, collectionName));
  };

  model.findByIdAndDelete = function(id) {
    if (mongoose.connection.readyState === 1) {
      return originalFindByIdAndDelete.apply(this, arguments);
    }
    const list = inMemoryDb[collectionName] || [];
    const idx = list.findIndex(x => x._id?.toString() === id?.toString());
    let found = null;
    if (idx !== -1) {
      found = list[idx];
      list.splice(idx, 1);
      saveToFile();
    }
    return new MockQuery(makeDoc(found, collectionName));
  };

  model.countDocuments = function() {
    if (mongoose.connection.readyState === 1) {
      return originalCountDocuments.apply(this, arguments);
    }
    const list = inMemoryDb[collectionName] || [];
    return new MockQuery(list.length);
  };

  model.deleteMany = function(query) {
    if (mongoose.connection.readyState === 1) {
      return originalDeleteMany.apply(this, arguments);
    }
    if (query?.resume) {
      inMemoryDb[collectionName] = (inMemoryDb[collectionName] || []).filter(x => x.resume?.toString() !== query.resume.toString());
      saveToFile();
    } else if (query?.user) {
      inMemoryDb[collectionName] = (inMemoryDb[collectionName] || []).filter(x => x.user?.toString() !== query.user.toString());
      saveToFile();
    }
    return new MockQuery({ deletedCount: 1 });
  };
};

export const startSimulation = () => {
  loadFromFile();
  const modelNames = mongoose.modelNames();
  modelNames.forEach(name => {
    const model = mongoose.model(name);
    // Map to pluralized collection name matching the inMemoryDb keys
    const collName = name.toLowerCase() + 's';
    patchModel(model, collName);
  });
  console.log('Dynamic Mongoose Model Interceptors successfully activated.');
};

// Trigger server reload to parse real-time SJB and Edunet data.
