import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  school: 'Fire' | 'Ice' | 'Storm' | 'Myth' | 'Life' | 'Death' | 'Balance' | null;
  level: number;
  bio: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = 'users';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, COLLECTION_NAME, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  const docRef = doc(db, COLLECTION_NAME, uid);
  const now = Timestamp.now();
  
  const newProfile: UserProfile = {
    uid,
    displayName: data.displayName || 'Novice Wizard',
    email: data.email || null,
    photoURL: data.photoURL || null,
    school: data.school || null,
    level: data.level || 1,
    bio: data.bio || '',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, newProfile);
  return newProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const docRef = doc(db, COLLECTION_NAME, uid);
  const updateData = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  
  await updateDoc(docRef, updateData);
  return updateData;
}
