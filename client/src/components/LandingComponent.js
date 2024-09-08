import React, { useState, Fragment } from 'react';
import { generateUserId, generateRandomColor } from './Functions';

import '../styles/landing.scss';

const LandingComponent = ({ userState, setUserState }) => {
  const { name } = userState;

  const [formData, setFormData] = useState(name);

  const [error, setError] = useState(false);

  const onChange = (e) => {
    const value = e.target.value;
    if (/^[a-z0-9 _]*[a-z0-9]*$/i.test(value) && value.length <= 30) {
      setFormData(value);
      if (error) {
        setError(false);
      }
    }
  };

  const onNameSubmit = (e) => {
    e.preventDefault();
    let name_text = formData.trim();
    if (name_text.length > 0) {
      setUserState({
        userId: generateUserId(7),
        name: name_text,
        color: generateRandomColor(),
      });
    } else {
      setError(true);
      document.getElementsByClassName('input')[0].focus();
    }
    setFormData(name_text);
  };

  return (
    <Fragment>
      <div className='navbar'>
        <div className='brand'>MERN Task</div>
        <div className='right'>
          <div className='img-container' title='Socket.io'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/9/96/Socket-io.svg'
              alt='Socket.io'
            />
          </div>
        </div>
      </div>
      <div className='container'>
        <div className='label'>Please enter your name...</div>
        <form onSubmit={onNameSubmit}>
          <input
            type='text'
            name='name'
            autoFocus
            autoComplete='off'
            value={formData}
            onChange={onChange}
            className={`input ${error && `error`}`}
          />
          {error && <span className='material-icons error-icon'>error_outline</span>}
          <button type='submit'>Continue</button>
        </form>
      </div>
    </Fragment>
  );
};

export default LandingComponent;
