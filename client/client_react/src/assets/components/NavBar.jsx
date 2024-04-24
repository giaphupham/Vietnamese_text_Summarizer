import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGem} from '@fortawesome/free-regular-svg-icons'
import { faEarthAmericas } from '@fortawesome/free-solid-svg-icons'
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
          <div className="flex flex-wrap content-center items-center">
            <button className="bg-[#178733] mx-2 px-10 py-1.5 rounded-full flex flex-wrap items-center hover:bg-[#0B6722]">
              <FontAwesomeIcon icon={faGem} className='text-white '  />
              <div className='text-white font-medium pl-2'>Upgrade to Premium</div>
            </button>
            
            {isLogin === true && (<AccountButton />)}

          </div>
        </div>
      </nav>
      
    )
}

export default NavBar;