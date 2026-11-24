const fs = require('fs');
const path = require('path');

const questionBankPath = path.join(__dirname, '../frontend/public/data/question_bank.json');
if (!fs.existsSync(questionBankPath)) {
  console.error('question_bank.json not found! Run scripts/build-question-bank.cjs first.');
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(questionBankPath, 'utf8'));
console.log(`Loaded ${questions.length} questions from question_bank.json.`);

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/boardwallah-cbse/databases/(default)/documents/question_bank';

function formatFirestoreField(val) {
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return { integerValue: String(val) };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(v => formatFirestoreField(v))
      }
    };
  }
  return { stringValue: String(val) };
}

async function uploadQuestion(q) {
  const fields = {};
  for (const [k, v] of Object.entries(q)) {
    fields[k] = formatFirestoreField(v);
  }

  const url = `${FIRESTORE_BASE}?documentId=${encodeURIComponent(q.id)}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    // If already exists, update via PATCH
    if (resp.status === 409) {
      const patchUrl = `${FIRESTORE_BASE}/${encodeURIComponent(q.id)}`;
      const patchResp = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
      return patchResp.ok;
    }
    console.warn(`Failed to upload ${q.id}:`, errText);
    return false;
  }
  return true;
}

async function runSeed() {
  console.log(`Starting Firestore Question Bank seeding (${questions.length} questions)...`);
  const batchSize = 15;
  let successCount = 0;

  for (let i = 0; i < questions.length; i += batchSize) {
    const chunk = questions.slice(i, i + batchSize);
    const results = await Promise.all(chunk.map(uploadQuestion));
    successCount += results.filter(Boolean).length;
    process.stdout.write(`\rProgress: ${successCount} / ${questions.length} questions uploaded to Firestore.`);
    // Gentle throttle
    await new Promise(r => setTimeout(r, 120));
  }

  console.log(`\nDone! Successfully seeded ${successCount} questions into Firestore collection "question_bank"!`);
}

runSeed().catch(console.error);
