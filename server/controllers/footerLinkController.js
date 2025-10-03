// /server/controllers/footerLinkController.js

import asyncHandler from 'express-async-handler';
import FooterLink from '../models/footerLinkModel.js';

// @desc Get all footer links
// @route GET /api/footer-links
// @access Public
const getFooterLinks = asyncHandler(async (req, res) => {
  const links = await FooterLink.find({}).sort({ createdAt: 'asc' });
  res.status(200).json(links);
});

// @desc Create a new footer link
// @route POST /api/footer-links
// @access Private/Admin
const createFooterLink = asyncHandler(async (req, res) => {
  const { title, url } = req.body;
  // Corrected: Add validation for non-empty strings
  if (!title || !title.trim() || !url || !url.trim()) {
    res.status(400);
    throw new Error('Title and URL are required');
  }
  const link = await FooterLink.create({ title: title.trim(), url: url.trim() });
  res.status(201).json(link);
});

// @desc Update a footer link
// @route PUT /api/footer-links/:id
// @access Private/Admin
const updateFooterLink = asyncHandler(async (req, res) => {
  const { title, url } = req.body;
  const link = await FooterLink.findById(req.params.id);

  if (link) {
    link.title = title || link.title;
    link.url = url || link.url;
    const updatedLink = await link.save();
    res.status(200).json(updatedLink);
  } else {
    res.status(404);
    throw new Error('Link not found');
  }
});

// @desc Delete a footer link
// @route DELETE /api/footer-links/:id
// @access Private/Admin
const deleteFooterLink = asyncHandler(async (req, res) => {
  const link = await FooterLink.findById(req.params.id);

  if (link) {
    await link.deleteOne();
    res.status(200).json({ message: 'Link deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Link not found');
  }
});

export { getFooterLinks, createFooterLink, updateFooterLink, deleteFooterLink };