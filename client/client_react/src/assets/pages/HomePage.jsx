import React from "react";
import NavBar from "../components/NavBar";
import MainField from "../components/MainField";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
        axios.get('http://127.0.0.1:5000/home', { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    setMessage(response.data.message);
                    console.log(response.data.message);
                } else {
                    throw new Error('You have to log in first');
                }
            })
            .catch(error => {
                setMessage(error.message);
                // Redirect to login page
                navigate('/Login');
            });
    });
  return (
    <div>
          <NavBar />
          <MainField />
    </div>


  )
}

export default {
  routeProps: {
    path: "/",
    main: HomePage,
  },
};