import React from "react";
import NavBar from "../components/NavBar";
import RegisterForm from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

function RegisterPage() {
  const navigate = useNavigate()

  const handleRegister = async (data) => {
    localStorage.setItem('email', data.username);
    await axios.post('http://127.0.0.1:5000/register', {
      'username': data.username,
      'password': data.password,
      'name': data.name
    })
    .then(response => { 
      console.log('then ' + response)
      const email = data.username;
      sendOTP(email);
      navigate({ pathname: '/confirm-email' })
    })
    .catch(error => {
        console.log('catch ' + error)
        alert('Account already exists')
    });
  };

  const sendOTP = async (email) => {
    try {
        await axios.post('http://127.0.0.1:5000/send_otp_email', { 'email': email });
        console.log('OTP sent successfully!');
    } catch (error) {
        console.error(error);
        alert('Error sending OTP');
    }
};


  return (
    <div>
        <NavBar isLogin={false}/>
        <RegisterForm onSubmit={handleRegister} />
    </div>


  )
}

export default {
  routeProps: {
    path: "/Register",
    main: RegisterPage,
  },
};