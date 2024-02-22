import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  // Add other user properties as needed
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

const initialUserContextValue: UserContextValue = {
  user: null,
  setUser: () => {}, // Placeholder function
};

const UserContext = createContext<UserContextValue>(initialUserContextValue);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
