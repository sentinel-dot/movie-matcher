import { Request, Response } from 'express';
import pool from '../config/database';

// Create a partner request
export const createPartnerRequest = async (req: Request, res: Response) => {
  const requesterId = req.user?.userId; // From auth middleware
  const { recipient_email } = req.body;
  
  if (!recipient_email) {
    return res.status(400).json({ error: 'Recipient email is required' });
  }
  
  try {
    // Check if recipient exists
    const recipientCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [recipient_email]
    );
    
    if (recipientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const recipientId = recipientCheck.rows[0].id;
    
    // Don't allow self-requests
    if (requesterId === recipientId) {
      return res.status(400).json({ error: 'Cannot send partner request to yourself' });
    }
    
    // Check if a request already exists
    const existingRequest = await pool.query(
      'SELECT * FROM partner_requests WHERE (requester_id = $1 AND recipient_id = $2) OR (requester_id = $2 AND recipient_id = $1)',
      [requesterId, recipientId]
    );
    
    if (existingRequest.rows.length > 0) {
      const request = existingRequest.rows[0];
      if (request.status === 'pending') {
        return res.status(400).json({ error: 'A pending request already exists between these users' });
      } else if (request.status === 'accepted') {
        return res.status(400).json({ error: 'These users are already partners' });
      }
    }
    
    // Check if they are already partners
    const partnerCheck = await pool.query(
      'SELECT * FROM users WHERE (id = $1 AND partner_id = $2) OR (id = $2 AND partner_id = $1)',
      [requesterId, recipientId]
    );
    
    if (partnerCheck.rows.length > 0) {
      return res.status(400).json({ error: 'These users are already partners' });
    }
    
    // Create the partner request
    const result = await pool.query(
      'INSERT INTO partner_requests (requester_id, recipient_id, status) VALUES ($1, $2, $3) RETURNING *',
      [requesterId, recipientId, 'pending']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating partner request:', error);
    res.status(500).json({ error: 'Failed to create partner request' });
  }
};

// Get all partner requests for the current user (both sent and received)
export const getPartnerRequests = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  
  try {
    const result = await pool.query(
      `SELECT pr.*,
        u_requester.email as requester_email,
        u_recipient.email as recipient_email
      FROM partner_requests pr
      JOIN users u_requester ON pr.requester_id = u_requester.id
      JOIN users u_recipient ON pr.recipient_id = u_recipient.id
      WHERE pr.requester_id = $1 OR pr.recipient_id = $1
      ORDER BY pr.created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting partner requests:', error);
    res.status(500).json({ error: 'Failed to get partner requests' });
  }
};

// Get pending partner requests received by the current user
export const getPendingPartnerRequests = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  
  try {
    const result = await pool.query(
      `SELECT pr.*,
        u_requester.email as requester_email
      FROM partner_requests pr
      JOIN users u_requester ON pr.requester_id = u_requester.id
      WHERE pr.recipient_id = $1 AND pr.status = 'pending'
      ORDER BY pr.created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting pending partner requests:', error);
    res.status(500).json({ error: 'Failed to get pending partner requests' });
  }
};

// Respond to a partner request (accept or reject)
export const respondToPartnerRequest = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  const { request_id, status } = req.body;
  
  if (!request_id) {
    return res.status(400).json({ error: 'Request ID is required' });
  }
  
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be either "accepted" or "rejected"' });
  }
  
  try {
    // Check if the request exists and belongs to the current user
    const requestCheck = await pool.query(
      'SELECT * FROM partner_requests WHERE id = $1 AND recipient_id = $2',
      [request_id, userId]
    );
    
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Partner request not found or you are not authorized to respond to it' });
    }
    
    const request = requestCheck.rows[0];
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been processed' });
    }
    
    // Update the request status
    await pool.query(
      'UPDATE partner_requests SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, request_id]
    );
    
    // If accepted, update both users' partner_id
    if (status === 'accepted') {
      await pool.query(
        'UPDATE users SET partner_id = $1, updated_at = NOW() WHERE id = $2',
        [request.requester_id, userId]
      );
      
      await pool.query(
        'UPDATE users SET partner_id = $1, updated_at = NOW() WHERE id = $2',
        [userId, request.requester_id]
      );
    }
    
    // Get the updated request with user details
    const result = await pool.query(
      `SELECT pr.*,
        u_requester.email as requester_email,
        u_recipient.email as recipient_email
      FROM partner_requests pr
      JOIN users u_requester ON pr.requester_id = u_requester.id
      JOIN users u_recipient ON pr.recipient_id = u_recipient.id
      WHERE pr.id = $1`,
      [request_id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error responding to partner request:', error);
    res.status(500).json({ error: 'Failed to respond to partner request' });
  }
};

// Set partner for the current user
export const setPartner = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  const { partner_id } = req.body;
  
  if (!partner_id) {
    return res.status(400).json({ error: 'Partner ID is required' });
  }
  
  try {
    // Check if partner exists
    const partnerCheck = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [partner_id]
    );
    
    if (partnerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    // Update user's partner
    const result = await pool.query(
      'UPDATE users SET partner_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [partner_id, userId]
    );
    
    // Also set the partner's partner to the current user (bidirectional)
    await pool.query(
      'UPDATE users SET partner_id = $1, updated_at = NOW() WHERE id = $2',
      [userId, partner_id]
    );
    
    // Return updated user
    const user = result.rows[0];
    delete user.password; // Don't send password back
    
    res.json(user);
  } catch (error) {
    console.error('Error setting partner:', error);
    res.status(500).json({ error: 'Failed to set partner' });
  }
};

// Get partner for the current user
export const getPartner = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  
  try {
    // Get user's partner ID
    const userResult = await pool.query(
      'SELECT partner_id FROM users WHERE id = $1',
      [userId]
    );
    
    const partnerId = userResult.rows[0]?.partner_id;
    
    if (!partnerId) {
      return res.json(null); // No partner set
    }
    
    // Get partner details
    const partnerResult = await pool.query(
      'SELECT id, email, display_name, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [partnerId]
    );
    
    if (partnerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(partnerResult.rows[0]);
  } catch (error) {
    console.error('Error getting partner:', error);
    res.status(500).json({ error: 'Failed to get partner' });
  }
};

// Search for a user by email
export const searchUserByEmail = async (req: Request, res: Response) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, avatar_url, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error searching for user:', error);
    res.status(500).json({ error: 'Failed to search for user' });
  }
};