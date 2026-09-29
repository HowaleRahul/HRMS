import { validationResult } from 'express-validator';
import DocumentModel from '../models/document.model.js';
import path from 'path';
import { unlink } from 'fs/promises';

export const getAllDocuments = async (req, res) => {
  try {
    const filters = { employee_id: req.query.employee_id, document_type_id: req.query.document_type_id, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    let data = await DocumentModel.getAll(filters);
    
    data = data.map(doc => {
      const metadata = { ...doc };
      delete metadata.file_path;
      return metadata;
    });

    const total = await DocumentModel.getCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getDocumentById = async (req, res) => {
  try {
    const data = await DocumentModel.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    const document = { ...data };
    delete document.file_path;
    res.status(200).json({ success: true, data: document });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getEmployeeDocuments = async (req, res) => {
  try {
    const data = await DocumentModel.getByEmployee(req.params.employeeId);
    res.status(200).json({ success: true, data: data.map(({ file_path, ...document }) => document) });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const downloadDocument = async (req, res) => {
  try {
    const document = await DocumentModel.getById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Not found' });
    return res.download(path.resolve(document.file_path), document.file_name || `document-${document.id}`, (error) => {
      if (error && !res.headersSent) res.status(500).json({ success: false, message: 'Unable to download document' });
    });
  } catch (err) { return res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const uploadDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) await unlink(req.file.path).catch(() => {});
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });
  const hrRoles = ['super_admin', 'hr_admin', 'hr_executive'];
  if (!hrRoles.includes(req.user.role?.name) && Number(req.body.employee_id) !== Number(req.user.employee_id)) {
    await unlink(req.file.path).catch(() => {});
    return res.status(403).json({ success: false, message: 'Cannot upload a document for another employee' });
  }

  try {
    const data = {
      employee_id: Number(req.body.employee_id),
      document_type_id: Number(req.body.document_type_id),
      document_number: req.body.document_number || null,
      title: req.body.title,
      expiry_date: req.body.expiry_date || null,
      remarks: req.body.remarks || null,
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype
    };
    const id = await DocumentModel.create(data);
    res.status(201).json({ success: true, message: 'Uploaded', data: { id } });
  } catch (err) {
    await unlink(req.file.path).catch(() => {});
    res.status(500).json({ success: false, message: 'Server Error' });
  }
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
