import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import signupImage from '../../assets/images/signup1.png'; // image in signup page
import Input from '../../components/Inputs/Input';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import AuthLayout from '../../components/layouts/AuthLayout';
import { register } from '../../utils/api';
import { validateEmail } from '../../utils/helper';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle Signup form submit
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('password', password);
      if (profilePic) {
        formData.append('profile_image', profilePic);
      }

      console.log('FormData:', formData.get('full_name'), formData.get('email'), formData.get('password'), formData.get('profile_image'));
      console.log('Calling register API...');
      const response = await register(formData);
      console.log('Register API response:', response.data);
      navigate('/login'); // Redirect on successful signup

    } catch (error) {
      console.error('Error during signup:', error);
      setError(error.response?.data?.detail || error.message || "Signup failed");
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center overflow-y-auto">
        {/* Image at the top */}
        <div className="w-full mb-6">
          <img
            src={signupImage}
            alt="Signup Header"
            className="w-full h-auto object-cover rounded-md shadow-md"
          />
        </div>

        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6 ">Join us today by entering your details below.</p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Jonas"
              type="text"
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />

            <div className="col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Enter Your Password"
                type="password"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs pb-2 5">{error}</p>}
          <button type='submit' className="btn-primary">SIGN UP</button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account? {""}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;

