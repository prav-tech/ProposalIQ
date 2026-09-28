// API client for ProposalIQ backend
const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function analyzeRfpFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/analyze-rfp`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze RFP document');
  }
  return res.json();
}

export async function analyzeRfpText(text) {
  const res = await fetch(`${BASE_URL}/api/analyze-rfp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze RFP text');
  }
  return res.json();
}

export async function analyzeSampleRfp() {
  const res = await fetch(`${BASE_URL}/api/analyze-sample`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load sample RFP');
  }
  return res.json();
}

export async function generateGenericProposal(profile) {
  const res = await fetch(`${BASE_URL}/api/generate-proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate proposal');
  }
  return res.json();
}

export async function generateHindsightProposal(profile) {
  const res = await fetch(`${BASE_URL}/api/generate-proposal-with-memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate memory-informed proposal');
  }
  return res.json();
}

export async function fetchMemories() {
  const res = await fetch(`${BASE_URL}/api/memories`);
  if (!res.ok) throw new Error('Failed to retrieve organizational memories');
  return res.json();
}

export async function recordOutcome(outcomeData) {
  const res = await fetch(`${BASE_URL}/api/outcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outcomeData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to record outcome in Hindsight');
  }
  return res.json();
}

export async function seedHindsightBank() {
  const res = await fetch(`${BASE_URL}/api/seed-memory`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed Hindsight bank');
  return res.json();
}
