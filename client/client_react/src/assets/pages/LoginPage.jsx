import React from "react";
import Form from "../components/Form";
import Input from "../components/Input";
import NavBar from "../components/NavBar";
import HttpClient from "../components/HttpClient";
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import FacebookLogin from "react-facebook-login";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);


  const handleForgotPassword = () => {
    setForgotPassword(true);
  };
  
  const usernameChangeHandler = (event) => {
    setUsername(event.target.value)
  }
  const passwordChangeHandler = (event) => {
    setPassword(event.target.value)
  }

  const handleLogin = async (e) => {

    e.preventDefault();
    console.log(import.meta.env.VITE_REACT_APP_URL)
    setLoading(true);
    await HttpClient.post(`${import.meta.env.VITE_REACT_APP_URL}/login`, {
      "username": username,
      "password": password,
      withCredentials: true,
    })
    .then(response => {
      console.log(response.data)
      localStorage.setItem('email', username);
      localStorage.setItem('role', response.data.role)
      if (response.data.role === 'admin' || response.data.role === 's_admin') {
        navigate({ pathname: '/Admin' })
      } else {
        navigate({ pathname: '/' })
      }
    })
    .catch(error => {
      console.log('catch ' + error.response.data.error)
      toast.error(error.response.data.error, {autoClose: 3000});
      setLoading(false);
    });

  };

  const responseFacebook = async (res) => {

    setLoading(true);
    console.log(res);
    await HttpClient.post(`${import.meta.env.VITE_REACT_APP_URL}/login_by_acc`, {      
        email: res.email,
        name: res.name,
        withCredentials: true,
    }).then(response => {
      console.log('then' + response.data)
      localStorage.setItem('email', res.email);
      localStorage.setItem('role', response.data.role)
      if (response.data.role === 'admin' || response.data.role === 's_admin') {
        navigate({ pathname: '/Admin' })
      } else {
        navigate({ pathname: '/' })
      }
    }).catch(error => {
      console.log('catch ' + error)
      toast.error('Login failed! Please try again', {autoClose: 3000});
      setLoading(false);
    });
  };

  const responseGoogle = async (response) => {
    const res = jwtDecode(response.credential);
    console.log(res);
      
    await HttpClient.post(`${import.meta.env.VITE_REACT_APP_URL}/login_by_acc`, {      
        email: res.email,
        name: res.name,
        withCredentials: true,
    }).then(response => {
      console.log('then' + response.data)
      localStorage.setItem('email', res.email);
      localStorage.setItem('role', response.data.role)
      if (response.data.role === 'admin' || response.data.role === 's_admin') {
        navigate({ pathname: '/Admin' })
      } else {
        navigate({ pathname: '/' })
      }
    }).catch(error => {
      console.log('catch ' + error)
      toast.error(error.response.data.error, {autoClose: 3000});
      setLoading(false);
    });
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_REACT_APP_URL}/home`, { withCredentials: true })
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
            <div className="flex flex-col mb-6 justify-center">
              <div className="mb-4">
                <FacebookLogin
                  appId={import.meta.env.VITE_FACEBOOK_ID}
                  callback={responseFacebook}
                  fields="name,email"
                  autoLoad={false}
                  textButton="Continue with Facebook"
                  cssClass="py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white w-full"
                  access_token={responseFacebook}
                  scope={['email']}
                />
              </div>
              <div className="w-full">
                <GoogleLogin
                  text="signin_with"
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
            <div className="flex justify-end" onClick={handleForgotPassword}>
                <b className="text-sky-500 font-medium cursor-pointer ">Forgot password?</b>
            </div>
            <div className="grid grid-cols-1 justify-items-center ">
                <button
                    type="submit"
                    className="p-2 bg-[#178733] rounded-full w-full mt-10 mb-4 hover:bg-[#0f5e2b]"
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
        {forgotPassword && <ForgotPasswordModal onClose={() => setForgotPassword(false)} />}
        <ToastContainer />
    </div>


  )
}

export default {
  routeProps: {
    path: "/Login",
    main: LoginPage,
  },
};