import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import modules from "./assets/pages";

function App() {
  const group = modules.map((x) => x.routeProps);
  return (
    <BrowserRouter className="App">
      <Routes>
        {group.map((routeProps, idx) => {
          return (
            <Route
              key={idx}
              path={routeProps.path}
              element={<routeProps.main />}
            />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
};

export default App
