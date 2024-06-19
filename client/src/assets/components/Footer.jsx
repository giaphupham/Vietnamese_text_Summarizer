import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="container mx-auto px-10">
        <div className="flex flex-wrap justify-center">
          <div className="w-full md:w-1/2 lg:w-1/5 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">About Us</h4>
            <ul>
              <li><a href="#">Company</a></li>
              <li><a href="#">Our Team</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div className="w-full md:w-1/2 lg:w-1/5 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">FAQ</h4>
            <ul>
              <li><a href="#">General</a></li>
              <li><a href="#">Account</a></li>
              <li><a href="#">Payment</a></li>
            </ul>
          </div>
          <div className="w-full md:w-1/2 lg:w-1/5 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">Help Center</h4>
            <ul>
              <li><a href="#">Support</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div className="w-full md:w-1/2 lg:w-1/5 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul>
              <li><a href="#">Terms of Use</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="w-full md:w-1/2 lg:w-1/5 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">Social</h4>
            <ul className="flex">
              <li className="mr-4"><a href="#"><FontAwesomeIcon icon={faFacebook} /></a></li>
              <li><a href="#"><FontAwesomeIcon icon={faInstagram} /></a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
