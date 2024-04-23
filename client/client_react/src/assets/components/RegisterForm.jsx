import React from "react";
import Form from "../components/Form";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { useState } from 'react'

function RegisterForm({onSubmit}) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const usernameChangeHandler = (event) => {
    setUsername(event.target.value)
  }
  const passwordChangeHandler = (event) => {
    setPassword(event.target.value)
  }
  const nameChangeHandler = (event) => {
    setName(event.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password, name });
};



  return (
    <div>
        <div className="grid grid-cols-1 justify-items-center pt-10">
          <b className="text-xl font-medium">Sign up for your VietnameseTextSummarizer account</b>
          <Form
            formClass="w-1/4 md:mx-36 xl:mx-80 mx-auto drop-shadow mt-6"
            onSubmit={handleSubmit}
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
            onChange={nameChangeHandler}
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

export default RegisterForm;