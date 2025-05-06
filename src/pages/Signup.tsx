import { Link } from 'react-router-dom';
import SignupForm from '../components/SignupForm';
import ScribeLogo from '../components/ScribeLogo';

const SignupPage = () => (
  <div className="flex h-screen bg-gray-900 text-white">
    <div className="w-1/2 flex items-center justify-center bg-gray-800">
      <h1 className="text-5xl font-bold">
      <ScribeLogo/>
      </h1>
    </div>
    <div className="w-1/2 flex flex-col justify-center items-center px-8">
      <SignupForm />
      <p className="text-gray-400 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  </div>
);

export default SignupPage;