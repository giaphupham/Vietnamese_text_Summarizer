import React, {useState} from "react";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function ConfirmEmailPage() {
    const navigate = useNavigate();
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');

    const handleCodeChange = (e) => {
        setInputCode(e.target.value);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        console.log('email: ' + localStorage.getItem('email'))
        try {
            const response = await axios.post('http://127.0.0.1:5000/verify_otp', {
                'email': localStorage.getItem('email'),
                'otp': inputCode,
                
            });

            if (response.status === 200) {
                console.log('Email verified successfully!');
                const purpose = localStorage.getItem('purpose');
                if (purpose === 'register') {
                    alert('Email verified successfully! Please log in to continue.');
                    navigate('/login');
                } else if (purpose === 'forgot') {
                    navigate('/forgot-password');
                } else {
                    // Default redirection if purpose is not set or unrecognized
                    navigate('/');
                }
            } else {
                alert('Error: ' + response.data.error);
            }
        } catch (error) {
            console.log(error);
            alert('Something went wrong');
        }
    };
    
    return (
        <div>
        <NavBar isLogin={false}/>
    
        <div className="grid grid-cols-1 justify-items-center pt-10">
            <b className="text-xl font-medium">
            Confirm your VietnameseTextSummarizer account
            </b>
            <div className="my-12 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-semibold mb-4">Confirm Email</h1>
                    <p className="mb-4">A confirmation code has been sent to your email. Please check your email.</p>
                    <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-md mb-4"
                        placeholder="Enter confirmation code"
                        value={inputCode}
                        onChange={handleCodeChange}
                    />
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-[#178733] hover:bg-[#0B6722] text-white font-semibold py-2 px-4 rounded-md"
                    >
                        Confirm
                    </button>
                    </form>
                </div>
            </div>   
        </div>
        </div>
    );
}

export default {
    routeProps: {
        path: "/confirm-email",
        main: ConfirmEmailPage,
    },
};