import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import ScribeLogo from '../components/ScribeLogo';

const LoginPage = () => (
  <div className="flex h-screen bg-gray-900 text-white">
    <div className="w-1/2 flex items-center justify-center bg-gray-800">
      <h1 className="text-5xl font-bold">
      <ScribeLogo/>
      </h1>
    </div>
    <div className="w-1/2 flex flex-col justify-center items-center px-8">
      <LoginForm />
      <p className="text-gray-400 mt-4">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-indigo-400 hover:underline">
          Sign up
        </Link>
      </p>
      <p className="text-1xl">
        <Link to="/forgot-password" className="text-white hover:underline"> Forgotten password?
        </Link>
        </p>

    </div>
  </div>
);

export default LoginPage;