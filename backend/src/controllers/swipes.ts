import { Request, Response } from 'express';
import pool from '../config/database';

// Create a new swipe
export const createSwipe = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  const { media_id, liked } = req.body;
  
  if (!media_id || liked === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // First check if this swipe already exists
    const existingSwipe = await pool.query(
      'SELECT * FROM swipes WHERE user_id = $1 AND media_id = $2',
      [userId, media_id]
    );
    
    let result;
    
    if (existingSwipe.rows.length > 0) {
      // Update existing swipe
      result = await pool.query(
        'UPDATE swipes SET liked = $1, created_at = NOW() WHERE user_id = $2 AND media_id = $3 RETURNING *',
        [liked, userId, media_id]
      );
    } else {
      // Create new swipe
      result = await pool.query(
        'INSERT INTO swipes (user_id, media_id, liked) VALUES ($1, $2, $3) RETURNING *',
        [userId, media_id, liked]
      );
    }
    
    const swipe = result.rows[0];
    
    // If the swipe was a like, check for a match
    if (liked) {
      // Get the user's partner
      const userResult = await pool.query(
        'SELECT partner_id FROM users WHERE id = $1',
        [userId]
      );
      
      const partnerId = userResult.rows[0]?.partner_id;
      
      if (partnerId) {
        // Check if partner has liked the same movie
        const partnerSwipe = await pool.query(
          'SELECT * FROM swipes WHERE user_id = $1 AND media_id = $2 AND liked = true',
          [partnerId, media_id]
        );
        
        if (partnerSwipe.rows.length > 0) {
          // Create a match
          try {
            // Check if match already exists
            const existingMatch = await pool.query(
              'SELECT * FROM matches WHERE (user1_id = $1 AND user2_id = $2 OR user1_id = $2 AND user2_id = $1) AND media_id = $3',
              [userId, partnerId, media_id]
            );
            
            if (existingMatch.rows.length === 0) {
              await pool.query(
                'INSERT INTO matches (media_id, user1_id, user2_id) VALUES ($1, $2, $3)',
                [media_id, userId, partnerId]
              );
              
              // Include match information in response
              swipe.match = true;
            }
          } catch (matchError) {
            console.error('Error creating match:', matchError);
            // Continue with the response even if match creation fails
          }
        }
      }
    }
    
    res.status(201).json(swipe);
  } catch (error) {
    console.error('Error creating swipe:', error);
    res.status(500).json({ error: 'Failed to create swipe' });
  }
};

// Get all swipes for the current user
export const getUserSwipes = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  
  try {
    const result = await pool.query(
      'SELECT s.*, m.title, m.poster_url FROM swipes s JOIN movies m ON s.media_id = m.id WHERE s.user_id = $1 ORDER BY s.created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching swipes:', error);
    res.status(500).json({ error: 'Failed to fetch swipes' });
  }
};