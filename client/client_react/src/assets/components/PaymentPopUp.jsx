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

function Payment({isOpen, onClose}) {
  const classes = useStyles();
  const [status, setStatus] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const email = localStorage.getItem('email');

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
            }
          });
        } else {
          console.log('Hell yea, you got that sub money!');
        }
      }
    }
  };

  return (
    
    <div className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-50 flex items-center justify-center`}>
        <Card className="w-80">
        <CardContent className={classes.content}>
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
    </div>
  );
};

export default Payment;
