//Global access to user info across the app

import React, { createContext, useState } from 'react';

export const UserContext = createContext();

const UserProvider = ({children}) => {

    const [user, setUser] = useState(null);

    //Function to update user data
    const updateUser = (userData) =>{
        setUser(userData);
    };

    //Fn to clear user eg Logout
    const clearUser = () =>{
        setUser(null);
    };

    return(
       <UserContext.Provider
        value={{
            user,
            updateUser,
            clearUser,
        }}
       >
        {children}
       </UserContext.Provider> 
    );
}

export default UserProvider;