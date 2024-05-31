import React from "react";
import NavBar from "../components/NavBar";
import MainField from "../components/MainField";
import axios from "axios";
import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Ads from "../components/Ads";

function HomePage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
        axios.get(`${import.meta.env.REACT_APP_API_URL}/home`, { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data.message);
                    setIsLogin(true);
                } else {
                    throw new Error('You have to log in first');
                }
            })
            .catch(error => {
                console.error(error);
                // Redirect to login page
                setIsLogin(false);
            });
    },[]);

  return (
    <div>
          <NavBar isLogin={isLogin}/>
          <MainField />
          <Ads />
          <Footer />
    </div>


  )
}

export default {
  routeProps: {
    path: "/",
    main: HomePage,
  },
};