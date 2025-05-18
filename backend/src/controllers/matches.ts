import { Request, Response } from 'express';
import pool from '../config/database';

// Get all matches for the current user
export const getMatches = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  
  try {
    const result = await pool.query(
      `SELECT m.*, 
        mov.id as media_id, 
        mov.title, 
        mov.poster_url, 
        mov.genre,
        u1.display_name as user1_name,
        u2.display_name as user2_name
      FROM matches m
      JOIN movies mov ON m.media_id = mov.id
      JOIN users u1 ON m.user1_id = u1.id
      JOIN users u2 ON m.user2_id = u2.id
      WHERE m.user1_id = $1 OR m.user2_id = $1
      ORDER BY m.created_at DESC`,
      [userId]
    );
    
    // Transform the result to match the expected format
    const matches = result.rows.map(row => ({
      id: row.id,
      media_id: row.media_id,
      user1_id: row.user1_id,
      user2_id: row.user2_id,
      created_at: row.created_at,
      media: {
        id: row.media_id,
        title: row.title,
        poster_url: row.poster_url,
        genre: row.genre,
        created_at: row.created_at
      }
    }));
    
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

// Get a single match by ID
export const getMatchById = async (req: Request, res: Response) => {
  const userId = req.user?.userId; // From auth middleware
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT m.*, 
        mov.id as media_id, 
        mov.title, 
        mov.poster_url, 
        mov.genre,
        u1.display_name as user1_name,
        u2.display_name as user2_name
      FROM matches m
      JOIN movies mov ON m.media_id = mov.id
      JOIN users u1 ON m.user1_id = u1.id
      JOIN users u2 ON m.user2_id = u2.id
      WHERE m.id = $1 AND (m.user1_id = $2 OR m.user2_id = $2)`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    const row = result.rows[0];
    
    // Transform to match expected format
    const match = {
      id: row.id,
      media_id: row.media_id,
      user1_id: row.user1_id,
      user2_id: row.user2_id,
      created_at: row.created_at,
      media: {
        id: row.media_id,
        title: row.title,
        poster_url: row.poster_url,
        genre: row.genre,
        created_at: row.created_at
      }
    };
    
    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
};