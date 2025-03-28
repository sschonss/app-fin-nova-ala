import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { useAuth } from './AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Game {
  id: string;
  date: Date;
  location: string;
  attendance: {
    [userId: string]: 'confirmed' | 'declined' | 'pending';
  };
}

interface GamesContextData {
  upcomingGames: Game[];
  confirmAttendance: (gameId: string, status: 'confirmed' | 'declined') => Promise<void>;
  loading: boolean;
  getGameAttendees: (gameId: string) => Promise<{ confirmed: User[], declined: User[], pending: User[] }>;
}

const GamesContext = createContext<GamesContextData>({} as GamesContextData);

export const GamesProvider: React.FC = ({ children }) => {
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getNextTuesday = (from: Date = new Date()) => {
    const date = new Date(from);
    const day = date.getDay();
    const diff = (day <= 2) ? 2 - day : 9 - day;
    
    date.setDate(date.getDate() + diff);
    date.setHours(21, 0, 0, 0);
    
    return date;
  };

  const createNextGame = async (nextGameDate: Date) => {
    try {
      // Check if game already exists for this date
      const gamesRef = collection(db, 'games');
      const startOfDay = new Date(nextGameDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(nextGameDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingGamesQuery = query(
        gamesRef,
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const existingGames = await getDocs(existingGamesQuery);
      
      if (existingGames.empty) {
        await addDoc(gamesRef, {
          date: Timestamp.fromDate(nextGameDate),
          location: 'Quadra Principal',
          attendance: {},
          createdAt: Timestamp.now()
        });
        console.log('Created next game for:', nextGameDate);
      }
    } catch (error) {
      console.error('Error creating next game:', error);
    }
  };

  const loadUpcomingGames = async () => {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // First, ensure next Tuesday's game exists
      const nextTuesday = getNextTuesday();
      await createNextGame(nextTuesday);

      // Also create the game for the following Tuesday
      const followingTuesday = getNextTuesday(new Date(nextTuesday.getTime() + 7 * 24 * 60 * 60 * 1000));
      await createNextGame(followingTuesday);

      // Then load all upcoming games
      const gamesQuery = query(
        collection(db, 'games'),
        where('date', '>=', Timestamp.fromDate(now)),
        orderBy('date', 'asc'),
        limit(3)
      );

      const snapshot = await getDocs(gamesQuery);
      const games = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      })) as Game[];

      setUpcomingGames(games);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmAttendance = async (gameId: string, status: 'confirmed' | 'declined') => {
    if (!user) return;

    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        [`attendance.${user.id}`]: status,
      });

      setUpcomingGames(games =>
        games.map(game =>
          game.id === gameId
            ? {
                ...game,
                attendance: {
                  ...game.attendance,
                  [user.id]: status,
                },
              }
            : game
        )
      );
    } catch (error) {
      console.error('Error confirming attendance:', error);
      throw error;
    }
  };

  const getGameAttendees = async (gameId: string) => {
    try {
      const game = upcomingGames.find(g => g.id === gameId);
      if (!game) throw new Error('Game not found');

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      const confirmed: User[] = [];
      const declined: User[] = [];
      const pending: User[] = [];

      users.forEach(user => {
        const status = game.attendance[user.id] || 'pending';
        if (status === 'confirmed') confirmed.push(user);
        else if (status === 'declined') declined.push(user);
        else pending.push(user);
      });

      // Sort each array by name
      const sortByName = (a: User, b: User) => a.name.localeCompare(b.name);
      confirmed.sort(sortByName);
      declined.sort(sortByName);
      pending.sort(sortByName);

      return { confirmed, declined, pending };
    } catch (error) {
      console.error('Error getting game attendees:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadUpcomingGames();
    
    // Refresh games every hour
    const interval = setInterval(loadUpcomingGames, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GamesContext.Provider
      value={{
        upcomingGames,
        confirmAttendance,
        loading,
        getGameAttendees,
      }}
    >
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = () => useContext(GamesContext);