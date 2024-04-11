import React from "react";
import Form from "../components/Form";
import Input from "../components/Input";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import axios from 'axios'

function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const usernameChangeHandler = (event) => {
    setUsername(event.target.value)
  }
  const passwordChangeHandler = (event) => {
    setPassword(event.target.value)
  }

  const handleRegister = async (e) => {
    e.preventDefault();


    const response = await axios.post('http://127.0.0.1:5000/register', {
      'username': username,
      'password': password,

    });

      // Handle successful login, e.g., redirect to home page
      console.log(response);
      if (response.status==200){
        navigate({ pathname: '/' })
      }
  };

  return (
    <div>
        <NavBar />

        <div className="grid grid-cols-1 justify-items-center pt-10">
          <b className="text-xl font-medium">Sign up for your VietnameseTextSummarizer account</b>
          <Form
            formClass="w-1/4 md:mx-36 xl:mx-80 mx-auto drop-shadow mt-6"
            onSubmit={handleRegister}
          >
            <div className="flex flex-col mb-6">
              <button className="m-1 p-1 rounded-full border border-[#178733] text-[#178733] font-medium">
                Continue with Google
              </button>
              <button className="m-1 p-1 rounded-full border border-[#178733] text-[#178733] font-medium">
                Continue with Facebook
              </button>
            </div>
            <Input
            id="username"
            inputTheme="h-12"
            placeholder="Email"
            onChange={usernameChangeHandler}
            />
            <Input
            id="password"
            inputTheme="h-12"
            placeholder="Password"
            containerTheme="pt-4"
            type="password"
            onChange={passwordChangeHandler}
            ></Input>
            <Input
            id="name"
            inputTheme="h-12"
            placeholder="Name"
            containerTheme="pt-4"
            type="text"
            ></Input>
            <div>

            </div>
            <div className="grid grid-cols-1 justify-items-center ">
                <button
                    type="submit"
                    className="p-2 bg-[#178733] rounded-full w-full mt-10 mb-4"
                >
                    <b className="text-xl leading-none text-white">Continue</b>
                </button>
                <b className="text-sky-500 font-medium cursor-pointer" onClick={() => navigate({ pathname: '/Login' })}>Already have an account?</b>
            </div>
          </Form>
        </div>
    </div>


  )
}

export default {
  routeProps: {
    path: "/Register",
    main: RegisterPage,
  },
};