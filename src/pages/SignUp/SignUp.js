// Importing neccessary libraries and classes
import React, {useEffect} from 'react'
import { Form, Input, message } from 'antd'
import './SignUp.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { showLoading, hideLoading } from '../../redux/features/alertSlice'

// This JS file is for the Signup page for the users

export default function SignUp() {
  // Creating the variable for movement to other pages
  const navigate = useNavigate()
  
  // Function to prevent entrance into signup if already logged in
  useEffect(()=>{
    if(localStorage.getItem('token')){
      navigate('/home')
    }
},[])

  // Form Handler
  const dispatch = useDispatch()
  const onFinishHandler = async (values) => {
    try {
      dispatch(showLoading())
      const res = await axios.post(productionURL, values, {headers:{"Content-Type" : "application/json"}})
      dispatch(hideLoading())
      if(res.data.success){
        message.success(res.data.message)
        navigate("/login")
      }else{
        message.error(res.data.message)
      }
    } catch (error) {
      dispatch(hideLoading())
      console.log(error)
      message.error("Something went wrong.")
    }
  }
  
  return (
    <>
    <div className='form-container'>
      <Form layout='vertical' onFinish={onFinishHandler} className='signup-form'>
        <h3 className='signupTitle'>Sign Up </h3>
          <Form.Item label="Name" name="name">
              <Input type='text' required/>
          </Form.Item>
          <Form.Item label="Age" name="age">
              <Input type='number' required/>
          </Form.Item>
          <Form.Item label="Email" name="email">
              <Input type='email' required/>
          </Form.Item>
          <Form.Item label="Area" name="area">
              <Input type='text' required/>
          </Form.Item>
          <Form.Item label="Number" name="number">
              <Input type='number' required/>
          </Form.Item>
          <Form.Item label="Password" name="password">
              <Input type='password' required/>
          </Form.Item>
          <Link to="/login" className='loginLink'>Already have an account? Login</Link>
          <div><br /></div>

          <div className='text-center'>
          <button className='btn btn-primary custom-button' type="submit">Sign Up</button>
          </div>
      </Form>
    </div>
    </>
  )
}
