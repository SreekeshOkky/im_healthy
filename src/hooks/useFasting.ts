import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FastingSession, FastingState } from '../types';

const STORAGE_KEY = 'fasting-state-temp';

export const useFasting = () => {
  const { user } = useAuth();
  const [state, setState] = useState<FastingState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { activeFast: null, history: [] };
  });
  const [, setIndexError] = useState(false);

  // Load history from Firestore once when component mounts and user is authenticated
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      try {
        const fastingsRef = collection(db, 'fastings');
        const q = query(
          fastingsRef,
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const history: FastingSession[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FastingSession));
        
        // Sort in memory
        history.sort((a, b) => b.startTime - a.startTime);
        
        // Update both history and activeFast if it exists
        setState(prev => {
          const newState = { ...prev, history };
          if (prev.activeFast) {
            // If there's an active fast, ensure it has the correct document ID
            const activeFastDoc = querySnapshot.docs.find(doc => 
              doc.data().startTime === prev.activeFast?.startTime
            );
            if (activeFastDoc) {
              newState.activeFast = {
                ...prev.activeFast,
                id: activeFastDoc.id
              };
            }
          }
          return newState;
        });
      } catch (error) {
        console.error('Error loading fasting history:', error);
      }
    };

    loadHistory();
  }, [user]);

  // Listen for active fasts in real-time
  useEffect(() => {
    if (!user) return;

    const fastingsRef = collection(db, 'fastings');
    const activeFastQuery = query(
      fastingsRef,
      where('userId', '==', user.uid),
      where('endTime', '==', null)
    );

    const unsubscribe = onSnapshot(activeFastQuery, (snapshot) => {
      const activeFasts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FastingSession));

      if (activeFasts.length > 0) {
        // Update active fast if there's one in Firestore
        setState(prev => ({
          ...prev,
          activeFast: activeFasts[0]
        }));
      } else {
        // Clear active fast if none exists in Firestore
        setState(prev => ({
          ...prev,
          activeFast: null
        }));
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const startFast = async (targetHours: number) => {
    if (!user) {
      console.error('Cannot start fast: No user logged in');
      return;
    }

    try {
      const newFast: Omit<FastingSession, 'id'> = {
        userId: user.uid,
        startTime: Date.now(),
        endTime: null,
        targetHours
      };

      // Save to Firestore immediately
      const fastingsRef = collection(db, 'fastings');
      const docRef = await addDoc(fastingsRef, newFast);
      
      // Update local state with the Firestore document ID
      setState(prev => ({ 
        ...prev, 
        activeFast: { ...newFast, id: docRef.id } 
      }));
    } catch (error) {
      console.error('Error starting fast:', error);
      throw error;
    }
  };

  const endFast = async () => {
    if (!state.activeFast || !user) {
      console.error('Cannot end fast: No active fast or user not logged in');
      return;
    }
    
    try {
      const completedFast: FastingSession = {
        ...state.activeFast,
        endTime: Date.now()
      };
      
      // Save to Firestore
      const fastingsRef = collection(db, 'fastings');
      const docRef = await addDoc(fastingsRef, completedFast);
      
      // Update local state with the Firestore document ID
      setState(prev => ({
        activeFast: null,
        history: [{ ...completedFast, id: docRef.id }, ...prev.history]
      }));
    } catch (error) {
      console.error('Error ending fast:', error);
      throw error;
    }
  };

  const updateStartTime = async (newStartTime: number) => {
    if (!state.activeFast || !user) {
      console.error('Cannot update start time: No active fast or user not logged in');
      return;
    }

    try {
      const updatedFast = {
        ...state.activeFast,
        startTime: newStartTime
      };

      // Update in Firestore
      const fastRef = doc(db, 'fastings', state.activeFast.id);
      await updateDoc(fastRef, {
        startTime: newStartTime
      });

      // Update local state
      setState(prev => ({ ...prev, activeFast: updatedFast }));
    } catch (error) {
      console.error('Error updating start time:', error);
      throw error;
    }
  };

  const deleteFast = async (fastId: string) => {
    if (!user) {
      console.error('Cannot delete fast: No user logged in');
      return;
    }

    try {
      const fastingsRef = collection(db, 'fastings');
      const fastRef = doc(fastingsRef, fastId);
      
      // Check if document exists before deletion
      const docSnap = await getDoc(fastRef);
      if (!docSnap.exists()) {
        console.error('Document does not exist:', fastId);
        return;
      }
      
      await deleteDoc(fastRef);
      
      setState(prev => ({
        ...prev,
        history: prev.history.filter(fast => fast.id !== fastId)
      }));
    } catch (error) {
      console.error('Error in deleteFast:', error);
      throw error;
    }
  };

  const updateEndTime = async (fastId: string, newEndTime: number) => {
    if (!user) return;

    try {
      const q = query(collection(db, 'fastings'), where('id', '==', fastId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]; // Assuming 'id' is unique
        const docRef = doc(db, 'fastings', docSnap.id);
        await updateDoc(docRef, { endTime: newEndTime });
      } else {
        throw new Error('No matching document found for id: ' + fastId);
      }
      
      // Update local state
      setState(prev => ({
        ...prev,
        history: prev.history.map(fast => 
          fast.id === fastId 
            ? { ...fast, endTime: newEndTime }
            : fast
        )
      }));
    } catch (error) {
      console.error('Error updating end time:', error);
      throw error;
    }
  };

  return {
    activeFast: state.activeFast,
    history: state.history,
    startFast,
    endFast,
    updateStartTime,
    deleteFast,
    updateEndTime
  };
};