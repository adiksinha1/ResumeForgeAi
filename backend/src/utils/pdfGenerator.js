import puppeteer from 'puppeteer';

// Standard styles mapping
const getFontLink = (font) => {
  switch (font) {
    case 'Roboto': return 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
    case 'Outfit': return 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap';
    case 'Playfair Display': return 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
    case 'Fira Code': return 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;700&display=swap';
    case 'Inter':
    default:
      return 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  }
};

const getFontFamily = (font) => {
  switch (font) {
    case 'Roboto': return "'Roboto', sans-serif";
    case 'Outfit': return "'Outfit', sans-serif";
    case 'Playfair Display': return "'Playfair Display', serif";
    case 'Fira Code': return "'Fira Code', monospace";
    case 'Inter':
    default:
      return "'Inter', sans-serif";
  }
};

const groupSkills = (skillsArray) => {
  const languages = [];
  const web = [];
  const tools = [];
  
  const langKeywords = ['c++', 'c', 'java', 'javascript', 'python', 'rust', 'go', 'ruby', 'php', 'swift', 'kotlin', 'typescript', 'sql', 'bash', 'shell'];
  const webKeywords = ['html', 'css', 'react', 'node', 'express', 'angular', 'vue', 'tailwind', 'sass', 'bootstrap', 'mongodb', 'redis', 'postgres', 'django', 'flask', 'next.js'];
  
  (skillsArray || []).forEach(skill => {
    const sLower = skill.toLowerCase();
    if (sLower.startsWith('languages:') || sLower.startsWith('language:')) {
      languages.push(skill.replace(/^(?:languages|language):\s*/i, ''));
    } else if (sLower.startsWith('web:') || sLower.startsWith('web technologies:') || sLower.startsWith('frameworks:')) {
      web.push(skill.replace(/^(?:web|web technologies|frameworks):\s*/i, ''));
    } else if (sLower.startsWith('developer tools:') || sLower.startsWith('tools:') || sLower.startsWith('dev tools:')) {
      tools.push(skill.replace(/^(?:developer tools|tools|dev tools):\s*/i, ''));
    } else {
      if (langKeywords.some(kw => sLower.includes(kw))) {
        languages.push(skill);
      } else if (webKeywords.some(kw => sLower.includes(kw))) {
        web.push(skill);
      } else {
        tools.push(skill);
      }
    }
  });
  
  return { languages, web, tools };
};

export const generateHTMLContent = (resume) => {
  const { personalInfo, summary, experience, education, projects, skills, certifications, languages, achievements, styling, sectionOrder, sectionVisibility } = resume;

  const fontUrl = getFontLink(styling.fontFamily);
  const fontFamily = getFontFamily(styling.fontFamily);

  // Styling helper tokens
  const marginPx = styling.margin === 'compact' ? '20px' : styling.margin === 'loose' ? '50px' : '35px';
  const spacingRem = styling.spacing === 'compact' ? '1.15' : styling.spacing === 'loose' ? '1.75' : '1.4';
  const sectionGap = styling.spacing === 'compact' ? '12px' : styling.spacing === 'loose' ? '28px' : '18px';

  // Format templates style injections
  let templateCss = '';
  if (resume.templateId === 'google_style') {
    templateCss = `
      .header-name { text-align: left; font-size: 24px; border-bottom: 2px solid ${styling.primaryColor}; padding-bottom: 5px; }
      .section-title { font-weight: 700; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; color: ${styling.primaryColor}; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
      .contact-bar { display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; margin-top: 5px; color: #555; }
    `;
  } else if (resume.templateId === 'stripe_style') {
    templateCss = `
      .header-name { text-align: left; font-size: 28px; background: linear-gradient(135deg, ${styling.primaryColor}, ${styling.secondaryColor}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .section-title { font-weight: 600; font-size: 15px; color: ${styling.primaryColor}; display: flex; align-items: center; gap: 8px; }
      .section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, #e2e8f0, transparent); }
      .grid-skills { display: flex; flex-wrap: wrap; gap: 8px; }
      .skill-tag { background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 11px; border: 1px solid #e2e8f0; }
    `;
  } else if (resume.templateId === 'developer') {
    templateCss = `
      body { background-color: #fafafa; }
      .container { background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border-top: 4px solid ${styling.primaryColor}; }
      .section-title { font-family: 'Fira Code', monospace; font-size: 13px; color: ${styling.primaryColor}; background: #f8fafc; padding: 4px 8px; border-left: 3px solid ${styling.primaryColor}; }
      .tech-item { font-family: 'Fira Code', monospace; font-size: 11px; }
    `;
  } else if (resume.templateId === 'academic_serif') {
    templateCss = `
      body {
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size: 11px;
        color: #000;
        line-height: 1.35;
      }
      .container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
      }
      .header-name {
        text-align: center;
        font-size: 26px;
        font-weight: 500;
        font-family: 'Georgia', serif;
        margin-bottom: 8px;
        color: #000;
      }
      .contact-bar {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 10px;
        color: #000;
        margin-bottom: 6px;
      }
      .contact-bar span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .section-container {
        margin-top: 15px;
        margin-bottom: 10px;
      }
      .section-title {
        font-family: 'Georgia', serif;
        font-weight: 700;
        font-size: 13px;
        color: #000;
        border-bottom: 1px solid #7f7f7f;
        padding-bottom: 2px;
        margin-bottom: 6px;
        text-transform: none;
      }
      .section-content {
        margin-top: 4px;
        font-size: 10.5px;
      }
      .bullet-list {
        list-style-type: none;
        margin-left: 0;
        padding-left: 0;
      }
      .bullet-list li {
        position: relative;
        padding-left: 12px;
        margin-bottom: 4px;
        text-align: justify;
      }
      .bullet-list li::before {
        content: "◦";
        position: absolute;
        left: 0;
        top: -1px;
        font-size: 12px;
        font-weight: bold;
      }
      .academic-item-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 11px;
        margin-bottom: 2px;
      }
      .academic-item-subheader {
        font-style: italic;
        font-size: 10.5px;
        margin-bottom: 4px;
      }
      .not-present {
        font-style: italic;
        color: #555;
      }
    `;
  } else {
    // Modern Minimal / Classic defaults
    templateCss = `
      .header-name { text-align: center; font-size: 26px; font-weight: 700; color: ${styling.primaryColor}; }
      .contact-bar { display: flex; justify-content: center; gap: 12px; font-size: 11px; color: #64748b; margin-top: 6px; }
      .section-title { font-weight: 600; font-size: 14px; text-transform: uppercase; color: ${styling.primaryColor}; border-bottom: 1.5px solid ${styling.primaryColor}; padding-bottom: 3px; }
    `;
  }

  // HTML parts generators
  const renderHeader = () => {
    if (!personalInfo) return '';
    if (resume.templateId === 'academic_serif') {
      const cleanLinkedIn = personalInfo.linkedinUrl ? personalInfo.linkedinUrl.replace(/https?:\/\/(?:www\.)?/, '') : 'Not Present';
      return `
        <header class="resume-header" style="text-align: center;">
          <h1 class="header-name">${personalInfo.name || 'Not Present'}</h1>
          <div class="contact-bar" style="margin-bottom: 4px;">
            <span>📍 ${personalInfo.address || 'Not Present'}</span>
            <span>✉ ${personalInfo.email || 'Not Present'}</span>
            <span>📞 ${personalInfo.phone || 'Not Present'}</span>
          </div>
          <div class="contact-bar">
            <span><b>in</b> ${cleanLinkedIn}</span>
          </div>
        </header>
      `;
    }
    const contacts = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.address,
      personalInfo.portfolioUrl,
      personalInfo.githubUsername ? `github.com/${personalInfo.githubUsername}` : '',
      personalInfo.linkedinUrl
    ].filter(Boolean);

    return `
      <header class="resume-header">
        <h1 class="header-name">${personalInfo.name || 'Your Name'}</h1>
        <div class="contact-bar">
          ${contacts.map(c => `<span>${c}</span>`).join(' | ')}
        </div>
      </header>
    `;
  };

  const renderSummary = () => {
    if (!sectionVisibility.summary) return '';
    if (resume.templateId === 'academic_serif') {
      return `
        <section class="section-container">
          <h2 class="section-title">Introduction</h2>
          <div class="section-content text-justify">${summary || 'Not Present'}</div>
        </section>
      `;
    }
    if (!summary) return '';
    return `
      <section class="section-container">
        <h2 class="section-title">Professional Summary</h2>
        <div class="section-content text-justify">${summary}</div>
      </section>
    `;
  };

  const renderExperience = () => {
    if (!sectionVisibility.experience) return '';
    if (resume.templateId === 'academic_serif') {
      const content = (experience && experience.length)
        ? experience.map(exp => `
            <div class="item-block" style="margin-bottom: 8px;">
              <div class="academic-item-header">
                <span>${exp.role}</span>
                <span style="font-weight: normal; font-style: italic;">${exp.startDate} – ${exp.current ? 'Present' : (exp.endDate || '')}</span>
              </div>
              <div class="academic-item-subheader">${exp.company} ${exp.location ? '| ' + exp.location : ''}</div>
              ${exp.description && exp.description.length ? `
                <ul class="bullet-list" style="margin-left: 12px;">
                  ${exp.description.map(bullet => `<li>${bullet}</li>`).join('')}
                </ul>
              ` : '<ul class="bullet-list" style="margin-left: 12px;"><li class="not-present">Not Present</li></ul>'}
            </div>
          `).join('')
        : '<ul class="bullet-list" style="margin-left: 12px;"><li class="not-present">Not Present</li></ul>';
      return `
        <section class="section-container">
          <h2 class="section-title">Work Experience</h2>
          ${content}
        </section>
      `;
    }
    if (!experience || !experience.length) return '';
    return `
      <section class="section-container">
        <h2 class="section-title">Professional Experience</h2>
        <div class="section-list">
          ${experience.map(exp => `
            <div class="item-block">
              <div class="item-header">
                <span class="item-title">${exp.role}</span>
                <span class="item-date">${exp.startDate} – ${exp.current ? 'Present' : (exp.endDate || '')}</span>
              </div>
              <div class="item-subheader">
                <span class="item-subtitle">${exp.company}</span>
                ${exp.location ? `<span class="item-location">${exp.location}</span>` : ''}
              </div>
              ${exp.description && exp.description.length ? `
                <ul class="bullet-list">
                  ${exp.description.map(bullet => `<li>${bullet}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  };

  const renderProjects = () => {
    if (!sectionVisibility.projects) return '';
    if (resume.templateId === 'academic_serif') {
      const content = (projects && projects.length)
        ? projects.map(proj => {
            const toolsText = proj.technologies && proj.technologies.length ? proj.technologies.join(', ') : 'Not Present';
            return `
              <div class="item-block" style="margin-bottom: 8px;">
                <div class="academic-item-header" style="margin-bottom: 4px;">
                  <span>${proj.title}</span>
                </div>
                <ul class="bullet-list" style="margin-left: 12px;">
                  <li>${proj.description || 'Not Present'}</li>
                  <li>Tools Used: ${toolsText}</li>
                </ul>
              </div>
            `;
          }).join('')
        : '<ul class="bullet-list" style="margin-left: 12px;"><li class="not-present">Not Present</li></ul>';
      return `
        <section class="section-container">
          <h2 class="section-title">Projects</h2>
          ${content}
        </section>
      `;
    }
    if (!projects || !projects.length) return '';
    return `
      <section class="section-container">
        <h2 class="section-title">Projects</h2>
        <div class="section-list">
          ${projects.map(proj => `
            <div class="item-block">
              <div class="item-header">
                <span class="item-title">${proj.title}</span>
                <span class="item-links">
                  ${proj.githubUrl ? `<a href="${proj.githubUrl}">GitHub</a>` : ''}
                  ${proj.liveUrl ? ` | <a href="${proj.liveUrl}">Live Demo</a>` : ''}
                </span>
              </div>
              <div class="item-subheader">
                <span class="item-subtitle font-italic">${proj.technologies ? proj.technologies.join(', ') : ''}</span>
              </div>
              <div class="project-description text-justify">${proj.description}</div>
              ${proj.achievements && proj.achievements.length ? `
                <ul class="bullet-list">
                  ${proj.achievements.map(ach => `<li>${ach}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  };

  const renderSkills = () => {
    if (!sectionVisibility.skills) return '';
    if (resume.templateId === 'academic_serif') {
      const { languages, web, tools } = groupSkills(skills || []);
      
      const langText = languages.length ? languages.join(', ') : 'Not Present';
      const webText = web.length ? web.join(', ') : 'Not Present';
      const toolsText = tools.length ? tools.join(', ') : 'Not Present';
      
      return `
        <section class="section-container">
          <h2 class="section-title">Technologies</h2>
          <div class="section-content" style="display: flex; flex-direction: column; gap: 4px; line-height: 1.4;">
            <div><b>Languages:</b> ${langText}</div>
            <div><b>Web:</b> ${webText}</div>
            <div><b>Developer Tools:</b> ${toolsText}</div>
          </div>
        </section>
      `;
    }
    if (!skills || !skills.length) return '';
    return `
      <section class="section-container">
        <h2 class="section-title">Skills</h2>
        <div class="grid-skills">
          ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join(' ')}
        </div>
      </section>
    `;
  };

  const renderEducation = () => {
    if (!sectionVisibility.education) return '';
    if (resume.templateId === 'academic_serif') {
      const content = (education && education.length)
        ? education.map(edu => {
            const gpaBullet = edu.cgpa ? `<li>CGPA: ${edu.cgpa}</li>` : '<li>CGPA: Not Present</li>';
            const courseworkBullet = edu.coursework ? `<li>Coursework: ${edu.coursework}</li>` : '<li>Coursework: Not Present</li>';
            return `
              <div class="item-block" style="margin-bottom: 8px;">
                <div class="academic-item-header">
                  <span>${edu.school}</span>
                  <span style="font-weight: normal; font-style: italic;">${edu.startDate} – ${edu.current ? 'Present' : (edu.endDate || '')}</span>
                </div>
                <div class="academic-item-subheader">${edu.degree} in ${edu.fieldOfStudy || 'Not Present'}</div>
                <ul class="bullet-list" style="margin-left: 12px;">
                  ${gpaBullet}
                  ${courseworkBullet}
                </ul>
              </div>
            `;
          }).join('')
        : '<ul class="bullet-list" style="margin-left: 12px;"><li class="not-present">Not Present</li></ul>';
      return `
        <section class="section-container">
          <h2 class="section-title">Education</h2>
          ${content}
        </section>
      `;
    }
    if (!education || !education.length) return '';
    return `
      <section class="section-container">
        <h2 class="section-title">Education</h2>
        <div class="section-list">
          ${education.map(edu => `
            <div class="item-block">
              <div class="item-header">
                <span class="item-title">${edu.degree} in ${edu.fieldOfStudy || ''}</span>
                <span class="item-date">${edu.startDate} – ${edu.current ? 'Present' : (edu.endDate || '')}</span>
              </div>
              <div class="item-subheader">
                <span class="item-subtitle">${edu.school}</span>
                ${edu.cgpa ? `<span class="item-cgpa">GPA: ${edu.cgpa}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  };

  const renderCertifications = () => {
    if (!sectionVisibility.certifications) return '';
    if (resume.templateId === 'academic_serif') {
      const content = (certifications && certifications.length)
        ? certifications.map(c => `<li>${c.name}${c.issuer ? ' organized by ' + c.issuer : ''}</li>`).join('')
        : '<li class="not-present">Not Present</li>';
      return `
        <section class="section-container">
          <h2 class="section-title">Certificates</h2>
          <ul class="bullet-list">
            ${content}
          </ul>
        </section>
      `;
    }
    if (!certifications || !certifications.length) return '';
    return `
      <section class="section-container">
        <h2 class="section-title">Certifications</h2>
        <div class="section-list">
          ${certifications.map(cert => `
            <div class="item-block-compact">
              <div class="item-header">
                <span class="item-title-compact font-bold">${cert.name}</span>
                <span class="item-date">${cert.date || ''}</span>
              </div>
              <div class="item-subheader-compact">${cert.issuer}</div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  };

  const renderLanguages = () => {
    if (!languages || !languages.length || !sectionVisibility.languages) return '';
    return `
      <section class="section-container">
        <h2 class="section-title">Languages</h2>
        <div class="grid-skills">
          ${languages.map(l => `<span class="skill-tag">${l.language} (${l.proficiency})</span>`).join('')}
        </div>
      </section>
    `;
  };

  const renderAchievements = () => {
    if (!achievements || !achievements.length || !sectionVisibility.achievements) return '';
    return `
      <section class="section-container">
        <h2 class="section-title">Achievements</h2>
        <ul class="bullet-list">
          ${achievements.map(ach => `<li>${ach}</li>`).join('')}
        </ul>
      </section>
    `;
  };

  // Compile section outputs based on customized order
  const sectionsHtml = sectionOrder.map(section => {
    switch (section) {
      case 'summary': return renderSummary();
      case 'experience': return renderExperience();
      case 'projects': return renderProjects();
      case 'skills': return renderSkills();
      case 'education': return renderEducation();
      case 'certifications': return renderCertifications();
      case 'languages': return renderLanguages();
      case 'achievements': return renderAchievements();
      default: return '';
    }
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${personalInfo?.name || 'Resume'} - ResumeForge</title>
      <link href="${fontUrl}" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: ${fontFamily};
          font-size: 12px;
          line-height: ${spacingRem};
          color: ${styling.textColor};
          background-color: ${styling.backgroundColor};
          padding: ${marginPx};
          width: 210mm;
          min-height: 297mm;
        }
        a { color: ${styling.primaryColor}; text-decoration: none; }
        a:hover { text-decoration: underline; }
        
        .resume-header { margin-bottom: ${sectionGap}; }
        .section-container { margin-bottom: ${sectionGap}; }
        .section-content { margin-top: 5px; }
        
        .section-list { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
        .item-block { display: flex; flex-direction: column; }
        .item-block-compact { display: flex; flex-direction: column; margin-top: 4px; }
        
        .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 12.5px; color: ${styling.primaryColor}; }
        .item-subheader { display: flex; justify-content: space-between; font-size: 11.5px; color: ${styling.secondaryColor}; margin-bottom: 4px; }
        .item-title { font-weight: 600; }
        .item-subtitle { font-weight: 500; }
        .item-date { font-weight: 400; font-size: 11px; }
        .item-location { font-size: 11px; }
        
        .bullet-list { margin-left: 18px; margin-top: 4px; list-style-type: square; }
        .bullet-list li { margin-bottom: 2px; text-align: justify; }
        
        .grid-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .skill-tag { border: 1.5px solid #cbd5e1; padding: 2px 6px; border-radius: 3px; font-size: 11px; display: inline-block; font-weight: 500; }
        
        .text-justify { text-align: justify; }
        .font-italic { font-style: italic; }
        .font-bold { font-weight: 700; }
        
        ${templateCss}
      </style>
    </head>
    <body>
      <div class="container">
        ${renderHeader()}
        ${sectionsHtml}
      </div>
    </body>
    </html>
  `;
};

export const generatePDF = async (resume) => {
  const htmlContent = generateHTMLContent(resume);

  try {
    // Add flags that bypass sandbox check inside Docker containers
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Format page format selection
    const pdfBuffer = await page.pdf({
      format: resume.styling?.pageSize || 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px'
      }
    });

    await browser.close();
    return pdfBuffer;
  } catch (err) {
    console.error('Puppeteer generation failed, returning HTML fallback buffer:', err.message);
    // If Puppeteer crashes, we return the plain HTML so the user gets their resume file anyway
    return Buffer.from(htmlContent, 'utf-8');
  }
};
