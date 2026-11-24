const fs = require('fs');
const path = require('path');

const resourcesDir = 'frontend/src/pages/resources';
const files = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.astro') && f !== 'index.astro');

const questionBank = [];

for (const file of files) {
  const slug = file.replace('.astro', '');
  const content = fs.readFileSync(path.join(resourcesDir, file), 'utf8');

  // Detect subject from content
  let subject = 'General';
  if (/science|chemistry|physics|biology/i.test(content)) subject = 'Science';
  else if (/mathematics|maths/i.test(content)) subject = 'Maths';
  else if (/social science|history|geography|civics|economics|sst/i.test(content)) subject = 'SST';
  else if (/english/i.test(content)) subject = 'English';
  else if (/hindi/i.test(content)) subject = 'Hindi';

  // Extract chapter title from h1
  const h1Match = content.match(/<h1>([^<]+)<\/h1>/);
  const chapterTitle = h1Match ? h1Match[1].trim() : slug.replace(/-/g, ' ');

  const startIdx = content.indexOf('const questions = [');
  if (startIdx !== -1) {
    const endIdx = content.indexOf('];', startIdx);
    if (endIdx !== -1) {
      const arrayCode = content.substring(startIdx + 'const questions = '.length, endIdx + 1);
      try {
        const qArr = eval(arrayCode);
        qArr.forEach((qObj, idx) => {
          const qText = qObj.q || qObj.question;
          const options = qObj.opts || qObj.options || [];
          const ansIndex = (typeof qObj.ans === 'number') ? qObj.ans : ((typeof qObj.correct === 'number') ? qObj.correct : 0);
          const expText = qObj.exp || qObj.explanation || '';

          if (qText && Array.isArray(options) && options.length > 0) {
            questionBank.push({
              id: `${slug}_q${idx + 1}`,
              chapterSlug: slug,
              chapterTitle: chapterTitle,
              subject: subject,
              questionNumber: idx + 1,
              question: qText,
              options: options,
              correctAnswerIndex: ansIndex,
              correctOptionText: options[ansIndex] || '',
              explanation: expText,
              marks: 1,
              examType: 'CBSE Class 10 Board'
            });
          }
        });
      } catch (err) {
        console.warn(`Could not parse questions for ${slug}:`, err.message);
      }
    }
  }
}

const outDir = 'frontend/public/data';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'question_bank.json'), JSON.stringify(questionBank, null, 2), 'utf8');
console.log(`Successfully generated question_bank.json with ${questionBank.length} questions across ${new Set(questionBank.map(q => q.chapterSlug)).size} chapters!`);
