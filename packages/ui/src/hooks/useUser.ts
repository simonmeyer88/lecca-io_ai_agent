import { useContext } from 'react';

import { UserContext } from '../providers/user-provider';

export const useUser = () => useContext(UserContext);
