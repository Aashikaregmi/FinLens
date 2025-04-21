//Global access to user info across the app

import React, {createContext, useState} from 'react';

export const UserContext = createContext();

const UserProvider = ({children}) => {
    //MOCK USER TO BE REPLACED AFTER CONNECTING TO DBASE
    const [user, setUser] = useState({
        fullName: "Mock Aashika",
        email: "aashika@example.com",
        profileImageUrl: "https://pbs.twimg.com/profile_images/1789834661281079296/EbSdsCSi_400x400.jpg" // just a dummy avatar image
      });
      
    // uncomment this after dbase conn:
    //const [user, setUser] = useState(null);

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