import { validationResult } from 'express-validator';
import DocumentModel from '../models/document.model.js';
import fs from 'fs';

export const getAllDocuments = async (req, res) => {
  try {
    const filters = { employee_id: req.query.employee_id, document_type_id: req.query.document_type_id, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    let data = await DocumentModel.getAll(filters);
    
    // Add file_url for frontend
    data = data.map(doc => ({
      ...doc,
      file_url: doc.file_path ? `/${doc.file_path.replace(/\\\\/g, '/')}` : null
    }));

    const total = await DocumentModel.getCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getDocumentById = async (req, res) => {
  try {
    const data = await DocumentModel.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getEmployeeDocuments = async (req, res) => {
  try {
    const data = await DocumentModel.getByEmployee(req.params.employeeId);
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const uploadDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

  try {
    const data = {
      ...req.body,
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype
    };
    const id = await DocumentModel.create(data);
    res.status(201).json({ success: true, message: 'Uploaded', data: { id } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await DocumentModel.getById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Attempt soft delete. Optional: actually delete file from disk.
    await DocumentModel.softDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const verifyDocument = async (req, res) => {
  try {
    await DocumentModel.verify(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Verified' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
