import React from "react";
import NavBar from "../components/NavBar";
import MainField from "../components/MainField";

function HomePage() {
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