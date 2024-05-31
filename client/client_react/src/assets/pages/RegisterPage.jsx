import React, {useState, useEffect} from "react";
import NavBar from "../components/NavBar";
import RegisterForm from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const purpose = 'register';

  const handleRegister = async (data) => {
    localStorage.setItem('email', data.username);
    setLoading(true);
    await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/register`, {
      'username': data.username,
      'password': data.password,
      'name': data.name
    })
    .then(response => { 
      console.log('then ' + response)
      const email = data.username;
      sendOTP(email);
      localStorage.setItem('purpose', purpose);
      navigate({ pathname: '/confirm-email' })
    })
    .catch(error => {
        console.log('catch ' + error)
        toast.error('Register failed! Please try again', {autoClose: 3000});
        setLoading(false);
    });
  };

  const sendOTP = async (email) => {
    try {
        await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/send_otp_email`, { 'email': email });
        console.log('OTP sent successfully!');
    } catch (error) {
        console.error(error);
        toast.error('Error sending OTP', {autoClose: 3000});
    }
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
              //navigate('/Login');
          });
    },[]);

  return (
    <div>
        <NavBar isLogin={false}/>
        <RegisterForm onSubmit={handleRegister} load={loading} />
        <ToastContainer containerId="containerA"/>
    </div>


  )
}

export default {
  routeProps: {
    path: "/Register",
    main: RegisterPage,
  },
};