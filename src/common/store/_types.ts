export type User = {
    name: string;
};

export interface UserStore {
    user: User;
    setUser: (user: User) => void;
    updateUser: (updates: Partial<User>) => void;
}
