import React, {useState} from 'react';
import axios from 'axios';
// MUI Components
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
// Util imports
import {makeStyles} from '@material-ui/core/styles';
// Components
import CardInput from '../components/CardInput';
// Stripe
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import HttpClient from './HttpClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    margin: '35vh auto',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-start',
  },
  div: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'space-between',
  },
  button: {
    margin: '2em auto 1em',
  },
});

function Payment({isOpen, onClose, plan_id, price_id, planName, price}) {
  const classes = useStyles();
  const [status, setStatus] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const email = localStorage.getItem('email');

  const sendUpgradeRequest = async (selectedPlan) => {
    try {
      const response = await HttpClient.post('http://127.0.0.1:5000/upgrade', { plan: selectedPlan, user: localStorage.getItem('email')});

      if (response.status === 200) {
        console.log('Upgrade request sent successfully');
        toast.success('Upgrade successfully', {autoClose: 3000});
        // You can add further actions here if needed
      } else {
        console.error('Failed to send upgrade request');
        toast.error('Failed to send upgrade request', {autoClose: 3000});
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitSub = async (event) => {
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    if (status !== '') {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: email,
          },
        },
      });
      if (result.error) {
        console.log(result.error.message);
        // Show error in payment form
      } else {
        console.log('Hell yea, you got that sub money!');
        console.log(plan_id);
        sendUpgradeRequest(plan_id);
        toast.success('Payment successful', {autoClose: 3000});
        window.location.reload();

      }
    } else {
      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: email,
        },
      });

      if (result.error) {
        console.log(result.error.message);
        // Show error in payment form
      } else {
        const payload = {
          email: email,
          payment_method: result.paymentMethod.id,
          price_id: price_id,
        };
        // Otherwise send paymentMethod.id to your server
        const res = await axios.post('http://127.0.0.1:5000/sub', payload);

        // eslint-disable-next-line camelcase
        const {client_secret, status} = res.data;

        if (status === 'requires_action') {
          setStatus(status);
          setClientSecret(client_secret);
          stripe.confirmCardPayment(client_secret).then(function(result) {
            if (result.error) {
              // Display error message in your UI.
              // The card was declined (i.e. insufficient funds, card has expired, etc)
              console.log(result.error.message);
            } else {
              // Show a success message to your customer
              console.log('Hell yea, you got that sub money!');
              console.log(plan_id);
              sendUpgradeRequest(plan_id);
              toast.success('Payment successful', {autoClose: 3000});
              window.location.reload();
            }
          });
        } else {
          console.log('Hell yea, you got that sub money!');
          console.log(plan_id);
          sendUpgradeRequest(plan_id);
          toast.success('Payment successful', {autoClose: 3000});
          window.location.reload();
        }
      }
    }
  };

  return (
    
    <div className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-50 flex items-center justify-center`}>
        <Card className="w-96">
          <CardContent className={classes.content}>
              <div className='flex flex-col justify-center'>
                <h2 className="text-2xl mb-4 mx-auto">Payment Infomation</h2>
                <h3 className="text-xl mb-4">You are subcribe for {planName} plan</h3>
                <h3 className="text-xl mb-4">Price: {price}/month</h3>
                <p className="text-sm mb-2">Please enter your payment information below</p>
              </div>
              <CardInput />
              <div className={classes.div}>
              <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmitSub}>
                  Subscription
              </Button>
              <Button variant="contained" color="secondary" className={classes.button} onClick={onClose}>
                  Close
              </Button>
              </div>
          </CardContent>
        </Card>
        <ToastContainer />
    </div>
  );
};

export default Payment;
