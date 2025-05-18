import { Request, Response } from 'express';
import pool from '../config/database';

// Get all movies
export const getMovies = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM movies ORDER BY id'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

// Get a single movie by ID
export const getMovieById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM movies WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};