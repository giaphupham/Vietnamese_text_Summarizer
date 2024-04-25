import React from "react";
import Form from "../components/Form";
import Input from "../components/Input";
import NavBar from "../components/NavBar";
import HttpClient from "../components/HttpClient";
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false);

  const usernameChangeHandler = (event) => {
    setUsername(event.target.value)
  }
  const passwordChangeHandler = (event) => {
    setPassword(event.target.value)
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    await HttpClient.post('http://127.0.0.1:5000/login', {
      "username": username,
      "password": password,
      withCredentials: true,
    })
    .then(response => {
      console.log('then' + response.data)
      localStorage.setItem('email', username);
      navigate({ pathname: '/' })
    })
    .catch(error => {
      console.log('catch ' + error)
      alert('Login failed! Check your email and password again')
      setLoading(false);
    });

  };

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/home', { withCredentials: true })
        .then(response => {
            if (response.status === 200) {
                console.log(response.data.message);
                navigate({ pathname: '/' });
            } else {
                throw new Error('You have to log in first');
            }
        })
        .catch(error => {
            console.error(error);
            // Redirect to login page
            navigate('/Login');
        });
  },[]);
  

  return (
    <div>
        <NavBar isLogin={false} />

        <div className="grid grid-cols-1 justify-items-center pt-10">
          <b className="text-xl font-medium">Log in to your VietnameseTextSummarizer account</b>
          <Form
            formClass="w-1/4 md:mx-36 xl:mx-80 mx-auto drop-shadow mt-6"
            onSubmit={handleLogin}
          >
            <div className="flex flex-col mb-6">
              <button className="m-1 p-1 rounded-full border border-[#178733] text-[#178733]">
              <img src="https://img.icons8.com/color/48/000000/google-logo.png" className="w-6 h-6 inline-block mx-2" alt="google-logo"/>
                Continue with Google
              </button>
              <button className="m-1 p-1 rounded-full border border-[#178733] text-[#178733]">
              <img src="https://img.icons8.com/color/48/000000/facebook-new.png" className="w-6 h-6 inline-block mx-2" alt="facebook-logo"/>
                Continue with Facebook
              </button>
            </div>
            <Input
            id="username"
            inputTheme="h-12"
            placeholder="Email"
            onChange={usernameChangeHandler}
            value={username}
            />
            <Input
            id="password"
            inputTheme="h-12"
            placeholder="Password"
            containerTheme="pt-4"
            type="password"
            onChange={passwordChangeHandler}
            value={password}
            ></Input>
            <div className="flex justify-end">
                <b className="text-sky-500 font-medium cursor-pointer ">Forgot password?</b>
            </div>
            <div className="grid grid-cols-1 justify-items-center ">
                <button
                    type="submit"
                    className="p-2 bg-[#178733] rounded-full w-full mt-10 mb-4"
                    disabled={loading}
                >
            {loading ? (
              <div
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status">
              </div>
              ) : (
                <b className="text-xl leading-none text-white">LOG IN</b>
            )}      
                </button >
                <b className="text-sky-500 font-medium cursor-pointer" onClick={() => navigate({ pathname: '/Register' })}>Don't have account?</b>
            </div>
          </Form>
        </div>
    </div>


  )
}

export default {
  routeProps: {
    path: "/Login",
    main: LoginPage,
  },
};