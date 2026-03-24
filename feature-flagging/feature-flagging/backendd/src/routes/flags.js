const express = require('express');
const router = express.Router();
const Flag = require('../models/Flag');
const { getPub } = require('../services/redisClient');

// list
router.get('/', async (req,res)=>{
  const flags = await Flag.find().lean();
  res.json(flags);
});

// create
router.post('/', async (req,res)=>{
  const body = req.body;
  body.key = body.key || body.name && body.name.toLowerCase().replace(/\s+/g,'_');
  const f = new Flag(body);
  await f.save();
  // publish update
  const pub = getPub();
  pub.publish('flags_updates', JSON.stringify({key: f.key, version: f.version}));
  res.status(201).json(f);
});

// update (patch)
router.patch('/:key', async (req,res)=>{
  const key = req.params.key;
  const update = req.body;
  const f = await Flag.findOne({key});
  if(!f) return res.status(404).json({error: 'not found'});
  Object.assign(f, update);
  f.version = (f.version || 0) + 1;
  await f.save();
  const pub = getPub();
  pub.publish('flags_updates', JSON.stringify({key: f.key, version: f.version}));
  res.json(f);
});

module.exports = router;