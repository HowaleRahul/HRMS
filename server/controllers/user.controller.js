import * as UserModel from '../models/user.model.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { paginate } from '../utils/helpers.js';

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit: queryLimit } = req.query;
    const { limit, offset } = paginate(page, queryLimit);
    
    const filters = { ...req.query, limit, offset };
    const users = await UserModel.getAll(filters);
    const total = await UserModel.getCount(filters);
    
    return paginatedResponse(res, users, total, page || 1, limit);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.getById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const createUser = async (req, res) => {
  try {
    const id = await UserModel.create(req.body);
    return successResponse(res, { id }, 'User created successfully', 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 'Username or Email already exists', 400);
    }
    return errorResponse(res, 'Internal server error');
  }
};

export const updateUser = async (req, res) => {
  try {
    await UserModel.update(req.params.id, req.body);
    return successResponse(res, null, 'User updated successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const deleteUser = async (req, res) => {
  try {
    await UserModel.softDelete(req.params.id);
    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await UserModel.getRoles();
    return successResponse(res, roles);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await UserModel.getRoleById(req.params.id);
    if (!role) return errorResponse(res, 'Role not found', 404);
    const permissions = await UserModel.getRolePermissions(role.id);
    return successResponse(res, { ...role, permissions });
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const createRole = async (req, res) => {
  try {
    const id = await UserModel.createRole(req.body);
    return successResponse(res, { id }, 'Role created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const updateRole = async (req, res) => {
  try {
    await UserModel.updateRole(req.params.id, req.body);
    return successResponse(res, null, 'Role updated successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const deleteRole = async (req, res) => {
  try {
    await UserModel.deleteRole(req.params.id);
    return successResponse(res, null, 'Role deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getPermissions = async (req, res) => {
  try {
    const grouped = await UserModel.getPermissionsByModule();
    return successResponse(res, grouped);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getRolePermissions = async (req, res) => {
  try {
    const perms = await UserModel.getRolePermissions(req.params.id);
    return successResponse(res, perms);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { permissionIds } = req.body;
    await UserModel.setRolePermissions(req.params.id, permissionIds);
    return successResponse(res, null, 'Role permissions updated successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};
