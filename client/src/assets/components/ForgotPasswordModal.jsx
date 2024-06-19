import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // State for loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading state to true
        if (step === 1) {
            try {
                await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/send_otp_email`, { email });
                setStep(2);
            } catch (error) {
                setError('Failed to send OTP. Please try again.');
            } finally {
                setLoading(false); // Reset loading state
            }
        } else if (step === 2) {
            try {
                await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/verify_otp`, { email, otp: code });
                setStep(3);
            } catch (error) {
                setError('Incorrect code. Please try again.');
            } finally {
                setLoading(false); // Reset loading state
            }
        } else if (step === 3) {
            if (!newPassword || newPassword !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            try {
                await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/resetpassword`, { username: email, 'new-password': newPassword });
                setError('');
                onClose();
            } catch (error) {
                setError('Failed to reset password. Please try again.');
            } finally {
                setLoading(false); // Reset loading state
                alert('Password reset successfully');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
            <div className="relative p-8 bg-white w-96 m-auto rounded-lg shadow-lg">
                {step === 1 ? (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Forgot Password</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mb-4 px-4 py-2 border rounded-md"
                            />
                            <div className='flex justify-between'>
                            <button type="submit" className="bg-[#178733] hover:bg-[#0B6722] text-white font-semibold px-4 py-2 rounded-md" disabled={loading}>
                                {loading ? <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                                </div> : <b> Submit </b>} 
                            </button>
                            <button onClick={onClose} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">Close</button>   
                            </div>
                        </form>
                    </>
                ) : step === 2 ? (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Verify Email</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Enter verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full mb-4 px-4 py-2 border rounded-md"
                            />
                            <div className='flex justify-between'>
                            <button type="submit" className="bg-[#178733] hover:bg-[#0B6722] text-white font-semibold px-4 py-2 rounded-md" disabled={loading}>
                                {loading ? <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                                </div> : <b> Submit </b>} 
                            </button>
                            <button onClick={onClose} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md ml-2">Close</button>   
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Create New Password</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full mb-4 px-4 py-2 border rounded-md"
                            />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full mb-4 px-4 py-2 border rounded-md"
                            />
                            <div className='flex justify-between'>
                            <button type="submit" className="bg-[#178733] hover:bg-[#0B6722] text-white font-semibold px-4 py-2 rounded-md" disabled={loading}>
                                {loading ? <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                                </div> : <b> Submit </b>} 
                            </button>
                            <button onClick={onClose} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md ml-2">Close</button>   
                            </div>
                        </form>
                    </>
                )}
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
