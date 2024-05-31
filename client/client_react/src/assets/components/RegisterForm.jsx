import React from "react";
import Form from "../components/Form";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import HttpClient from "../components/HttpClient";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import FacebookLogin from "react-facebook-login";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegisterForm({onSubmit, load}) {
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

const responseFacebook = async (res) => {

  

  await HttpClient.post(`${import.meta.env.REACT_APP_API_URL}/login_by_acc`, {      
      email: res.email,
      name: res.name,
      withCredentials: true,
  }).then(response => {
    console.log('then' + response.data)
    localStorage.setItem('email', res.email);
    navigate({ pathname: '/' })
  }).catch(error => {
    console.log('catch ' + error)
    toast.error('Login failed! Check your email and password again', {autoClose: 3000});
    
  });
};

const responseGoogle = async (response) => {
  const res = jwtDecode(response.credential);
    
  await HttpClient.post(`${import.meta.env.VITE_REACT_APP_API_URL}/login_by_acc`, {      
      email: res.email,
      name: res.name,
      withCredentials: true,
  }).then(response => {
    console.log('then' + response.data)
    localStorage.setItem('email', res.email);
    navigate({ pathname: '/' })
  }).catch(error => {
    console.log('catch ' + error)
    toast.error('Login failed! Check your email and password again', {autoClose: 3000});
    
  });
};



  return (
    <div>
        <div className="grid grid-cols-1 justify-items-center pt-10">
          <b className="text-xl font-medium">Sign up for your VietnameseTextSummarizer account</b>
          <Form
            formClass="w-1/4 md:mx-36 xl:mx-80 mx-auto drop-shadow mt-6"
            onSubmit={handleSubmit}
          >
                        <div className="flex flex-col mb-6 justify-center">
              <div className="mb-4">
                <FacebookLogin
                  appId="414388071398115"
                  fields="name,email"
                  callback={responseFacebook}
                  autoLoad={false}
                  textButton="Continue with Facebook"
                  cssClass="py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white w-full"
                />
              </div>
              <div className="w-full">
                <GoogleLogin
                  text="signup_with"
                  size="large"
                  width={270}
                  shape="pill"
                  onSuccess={responseGoogle}
                  onError={() => {
                    console.log('Login Failed');
                  }}
                />
              </div>
            </div>
            <Input
            id="username"
            inputTheme="h-12"
            placeholder="Email"
            type="email"
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
            {load ? (
              <div
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status">
              </div>
              ) : (
                <b className="text-xl leading-none text-white">CONTINUE</b>
            )} 
                </button>
                <b className="text-sky-500 font-medium cursor-pointer" onClick={() => navigate({ pathname: '/Login' })}>Already have an account?</b>
            </div>
          </Form>
        </div>
        <ToastContainer />
    </div>


  )
}

export default RegisterForm;