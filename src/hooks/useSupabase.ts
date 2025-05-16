import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Media, Swipe, Match } from '../types';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all movies
  const fetchMovies = async (): Promise<Media[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('id');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Record a swipe
  const recordSwipe = async (userId: string, mediaId: string, liked: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.from('swipes').insert({
        user_id: userId,
        media_id: mediaId,
        liked,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check for a match
  const checkForMatch = async (userId: string, partnerId: string, mediaId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if partner has liked this media
      const { data, error } = await supabase
        .from('swipes')
        .select('*')
        .eq('user_id', partnerId)
        .eq('media_id', mediaId)
        .eq('liked', true)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        throw new Error(error.message);
      }
      
      // If partner has liked, create a match
      if (data) {
        const { error: createMatchError } = await supabase.from('matches').insert({
          media_id: mediaId,
          user1_id: userId,
          user2_id: partnerId,
        });
        
        if (createMatchError) {
          throw new Error(createMatchError.message);
        }
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch matches for a user
  const fetchMatches = async (userId: string): Promise<Match[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          media_id,
          user1_id,
          user2_id,
          created_at,
          media:media_id (
            id,
            title,
            poster_url,
            genre
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchMovies,
    recordSwipe,
    checkForMatch,
    fetchMatches,
  };
};