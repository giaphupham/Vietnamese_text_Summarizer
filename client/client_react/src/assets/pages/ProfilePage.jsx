import React from 'react';
import NavBar from '../components/NavBar';
import { VscAccount } from "react-icons/vsc";
import { MdCreditScore } from "react-icons/md";

function UserProfile(){
  const { name, email, subscription, joinedAt, picture } = NaN;

  return (
    <div>
    <NavBar isLogin={true}/>
    <div className="flex flex-col items-center justify-center mt-12 w-full max-w-6xl mx-auto">
        <div className="px-6 py-6 min-w-full">
          <div className="flex items-center">
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={picture}
              alt={name}
            />
            <div className='flex flex-col text-2xl px-12 font-light'>
                <b className='font-semibold '>Phạm Trần Gia Phú</b>
                <b className='font-normal text-base text-slate-700 pt-2'>rongcon110701@gmail.com</b>
            </div>
          </div>
        <div className='flex justify-center mt-4'>
            <div className='flex flex-col w-40 mt-6 border-l-2 h-full'>
                <div className='flex items-center px-4 py-2  border-gray-300 cursor-pointer hover:bg-gray-200 hover:rounded-md'>
                    <VscAccount/>
                    <p className='pl-2'>Profile</p>
                </div>
                <div className='flex items-center px-4 py-2  border-gray-300 cursor-pointer hover:bg-gray-200 hover:rounded-md'>
                    <MdCreditScore />
                    <p className='pl-2'>Subscription</p>
                </div>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden px-8 py-10 max-w-3xl w-full ml-6">
                <h1 className="text-sm text-gray-600 p-6">Name: {name}</h1>
                <p className="text-sm text-gray-600 p-6">Email: {email}</p>
                <p className="text-sm text-gray-600 p-6">Subscription: {subscription}</p>
                <p className="text-sm text-gray-600 p-6">Joined: {joinedAt}</p>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default {
    routeProps: {
        path: "/profile",
        main: UserProfile,
    },
};
