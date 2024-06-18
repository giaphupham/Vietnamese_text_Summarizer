import React, { useState } from 'react';
import AccountButton from './AccountButton';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ isLogin }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleHome = () => {
        navigate({ pathname: '/' });
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="border-b-2 bg-white shadow-md">
            <div className="px-8 py-2 mx-auto flex justify-between items-center">
                <div className='flex flex-wrap cursor-pointer' onClick={handleHome}>
                    <div className="text-[#66AA4C] text-2xl font-light font-serif">Vietnamese</div>
                    <div className="text-[#479455] text-2xl font-bold">TextSummarizer</div>
                </div>
            <div className='flex'>
            <div className="block lg:hidden">
                    <button onClick={toggleMenu} className="text-[#178733] focus:outline-none">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                        </svg>
                    </button>
                </div>
                <div className={`w-full lg:flex lg:items-center lg:w-auto ${isOpen ? 'block' : 'hidden'}`}>
                    <div className="text-sm lg:flex-grow lg:flex lg:justify-end">
                        {isLogin ? (
                            <AccountButton />
                        ) : (
                            <div className='flex flex-wrap content-center items-center'>
                                <button>
                                    <a href="/Login" className="text-white font-semibold bg-[#178733] py-2 px-4 rounded-full hover:bg-[#0B6722]">Login</a>
                                </button>
                                <p className='mx-2 font-medium'>or</p>
                                <button>
                                    <a href="/Register" className="text-white font-semibold bg-[#178733] py-2 px-4 rounded-full hover:bg-[#0B6722]">Register</a>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </nav>
    );
};

export default NavBar;
