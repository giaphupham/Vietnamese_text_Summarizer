import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function AdminPage() {

    return(
        <div>
            <NavBar isLogin={true}/>
            <div className="mx-auto p-4 w-full max-w-7xl">
                <h1 className="grid grid-cols-1 justify-items-center text-2xl font-bold mb-4">Admin Page</h1>
                <div className="flex">
                    <div className="border-l-2 h-full">
                        <div>
                            <button className="p-2 hover:bg-gray-200 hover:rounded-md">
                                Dashboard
                            </button>
                        </div>
                        <div>
                            <button className="p-2 hover:bg-gray-200 hover:rounded-md">
                                Users management
                            </button>
                        </div>
                    </div>
                    <div className="bg-white border-2 border-gray-200 rounded-xl px-8 py-10 max-w-5xl w-full ml-6 h-screen max-h-96">
                        
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default {
    routeProps: {
        path: "/admin",
        main: AdminPage,
    },
};