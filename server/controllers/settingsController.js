import asyncHandler from 'express-async-handler';
import Settings from '../models/settingsModel.js';

// @desc Get the current system settings
// @route GET /api/settings
// @access Public
const getSystemSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ singleton: 'system_settings' });

  if (!settings) {
    // If no settings document exists, create one with default values.
    settings = await Settings.create({});
  }

  res.status(200).json(settings);
});

// @desc Update system settings (Admin only)
// @route PUT /api/settings
// @access Private/Admin
const updateSystemSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { singleton: 'system_settings' },
    { $set: req.body },
    { new: true, upsert: true }
  );

  res.status(200).json(settings);
});

export { getSystemSettings, updateSystemSettings };