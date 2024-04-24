import React from 'react'

import AccountButton from './AccountButton'
import { useNavigate } from 'react-router-dom'

const NavBar = ({isLogin = true}) => {
    const navigate = useNavigate();
    const handleHome = () => {
      navigate({ pathname: '/' })
    }
    return (
      <nav className="border-b-2">
        <div className="px-8 py-2 mx-auto flex justify-between items-center">
          <div className='flex flex-wrap cursor-pointer'
              onClick={handleHome}
          >
            <div className="text-[#66AA4C] text-2xl font-light font-serif">Vietnamese</div>
            <div className="text-[#479455] text-2xl font-bold">TextSummarizer</div>
          </div>

            
            {isLogin === true && (<AccountButton />)}

          </div>
      </nav>
      
    )
}

export default NavBar;