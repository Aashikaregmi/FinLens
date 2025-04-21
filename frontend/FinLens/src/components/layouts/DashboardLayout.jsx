import React from 'react';
import { useContext } from 'react';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import { UserContext } from '../../context/UserContext';

const DashboardLayout = ({children, activeMenu}) => {
    const{user} = useContext(UserContext);
  return (
    <div className=''>
        <Navbar activeMenu={activeMenu}/>
        
{/* HO YO LOGIC CHAI USER BHAKO BELA MATRA SIDEBAR DEKHNA LAI HO */}
      {user && (
        <div className="flex">
            <div className="max-[1080px]:hidden">
                <SideMenu activeMenu={activeMenu}/>
            </div>

            <div className="grow mx-5">{children}</div>
        </div>
      )} 
    </div>
  )
}

export default DashboardLayout;

