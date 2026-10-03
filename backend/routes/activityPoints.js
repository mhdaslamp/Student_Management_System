/**
 * @file routes/activityPoints.js
 * @description KTU Activity Points API routes. All routes require student auth.
 */

'use strict';

const express        = require('express');
const router         = express.Router();
const auth           = require('../middleware/auth');
const { evidenceUpload } = require('../src/middleware/upload');
const ctrl           = require('../controllers/activityPoints');

router.get   ('/',             auth('student'), ctrl.getMyActivities);
router.post  ('/',             auth('student'), evidenceUpload.single('evidence'), ctrl.createActivity);
router.get   ('/:id/evidence', auth('student'), ctrl.getEvidence);
router.get   ('/:id',          auth('student'), ctrl.getActivity);
router.put   ('/:id',          auth('student'), evidenceUpload.single('evidence'), ctrl.updateActivity);
router.delete('/:id',          auth('student'), ctrl.deleteActivity);

module.exports = router;
