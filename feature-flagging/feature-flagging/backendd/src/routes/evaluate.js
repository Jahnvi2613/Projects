// backend/routes/evaluate.js
const express = require('express');
const router = express.Router();
const Flag = require('../models/Flag');
const crypto = require('crypto');

function hashToPercentage(userId, flagKey) {
  const hash = crypto.createHash('sha256').update(userId + flagKey).digest('hex');
  const num = parseInt(hash.substring(0, 8), 16);
  return (num % 100) + 1; // 1–100
}

router.post('/', async (req, res) => {
  const { flagKey, context } = req.body;
  if (!flagKey || !context) return res.status(400).json({ error: 'flagKey and context required' });

  const flag = await Flag.findOne({ key: flagKey });
  if (!flag) return res.status(404).json({ error: 'Flag not found' });

  if (flag.status !== 'active') return res.json({ enabled: false });

  // Check targeting
  let matched = false;
  if (flag.rules?.segments?.length) {
    matched = flag.rules.segments.some(rule => context[rule.attribute] === rule.value);
  }

  // Check percentage rollout
  const rollout = flag.rules?.percentage ?? 0;
  const userPercent = hashToPercentage(context.userId || 'anon', flag.key);
  const inRollout = userPercent <= rollout;

  const enabled = flag.enabled && (matched || inRollout);
  res.json({ enabled });
});

module.exports = router;