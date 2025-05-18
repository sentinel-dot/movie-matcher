import { Request, Response } from 'express';
import pool from '../config/database';

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