import React, { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Input from '../../components/Inputs/Input';
import AuthLayout from '../../components/layouts/AuthLayout';
import { UserContext } from '../../context/UserContext'; // Import UserContext
import { getUserInfo, login } from '../../utils/api'; // Import API calls
import { validateEmail } from '../../utils/helper';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { updateUser } = useContext(UserContext); // Get updateUser function from context
  const navigate = useNavigate();

  //handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', email); // Use 'username' as the key
      formData.append('password', password);

      console.log('Calling login API...', formData.get('username'), formData.get('password'));
      const response = await login(formData);
      console.log('Login API response:', response.data);

      // Store the access token
      localStorage.setItem("token", response.data.access_token);

      // Fetch user info after successful login
      console.log('Fetching user info...');
      const userInfoResponse = await getUserInfo();
      console.log('User info response:', userInfoResponse.data);

      // Update user context with the fetched user info
      updateUser(userInfoResponse.data);

      // Redirect to the dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error during login:', error);
      setError(error.response?.data?.detail || error.message || "Login failed");
    }
  };


  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">
          Welcome Back
        </h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Please enter your details to login
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Enter Your Password"
            type="password"
          />

          {error && <p className="text-red-500 text-xs pb-2 5">{error}</p>}
          <button type='submit' className="btn-primary">LOGIN</button>

          <p className="text-[13px] text-slate-800 mt-3">
            Don't have an account? {""}
            <Link className="font-medium text-primary underline" to="/signup">
              SignUp
            </Link>
          </p>

        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;