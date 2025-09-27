import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/ui/button";
import InputField from "../components/ui/InputField";
import RoleCard from "../components/ui/RoleCard";
import SelectField from "../components/ui/SelectField";
import { Toast, ToastProvider, ToastViewport } from "../components/ui/toast";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form state
  const [role, setRole] = useState("STUDENT");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [yearId, setYearId] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/college")
      .then((res) => setColleges(res.data))
      .catch((err) => {
        console.error("Error fetching colleges", err);
        showToast("Failed to load colleges", "error");
      });
  }, []);

  useEffect(() => {
    if (!collegeId) return;
    axios
      .get(`http://localhost:3000/api/v1/department?collegeId=${collegeId}`)
      .then((res) => setDepartments(res.data))
      .catch((err) => {
        console.error("Error fetching departments", err);
        showToast("Failed to load departments", "error");
      });
  }, [collegeId]);

  useEffect(() => {
    if (!departmentId) return;
    axios
      .get(`http://localhost:3000/api/v1/year?departmentId=${departmentId}`)
      .then((res) => setYears(res.data))
      .catch((err) => {
        console.error("Error fetching years", err);
        showToast("Failed to load years", "error");
      });
  }, [departmentId]);

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!role) {
          showToast("Please select your role", "error");
          return false;
        }
        return true;
      case 2:
        if (!firstName || !lastName || !email) {
          showToast(
            "Please fill in all required personal information",
            "error"
          );
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showToast("Please enter a valid email address", "error");
          return false;
        }
        return true;
      case 3:
        if (!password || !confirmPassword) {
          showToast("Please fill in both password fields", "error");
          return false;
        }
        if (password !== confirmPassword) {
          showToast("Passwords do not match", "error");
          return false;
        }
        if (password.length < 6) {
          showToast("Password must be at least 6 characters long", "error");
          return false;
        }
        return true;
      case 4:
        if (!collegeId || !departmentId) {
          showToast("Please select college and department", "error");
          return false;
        }
        if (role === "STUDENT" && !enrollmentNo) {
          showToast("Please enter your enrollment number", "error");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    setIsLoading(true);

    const payload: any = {
      firstName,
      lastName,
      username,
      email,
      password,
      collegeId,
      role,
      departmentId,
      yearId,
      specialization,
    };

    if (role === "STUDENT") {
      payload.enrollmentNo = enrollmentNo;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/auth/signup",
        payload
      );
      console.log("Signup success", res.data);
      showToast(
        "Account created successfully! Redirecting to login...",
        "success"
      );

      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Signup failed", err);
      // Improved error handling for backend messages
      let errorMessage = "Signup failed. Please try again.";
      if (err.response?.data?.message) {
        if (typeof err.response.data.message === "string") {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          // If backend sends an array of errors, join them
          errorMessage = err.response.data.message.join(", ");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole === "FACULTY") {
      setEnrollmentNo("");
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Choose Your Role";
      case 2:
        return "Personal Information";
      case 3:
        return "Account Security";
      case 4:
        return "Academic Details";
      default:
        return "Create Account";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Tell us how you'll be using the platform";
      case 2:
        return "Let's get to know you better";
      case 3:
        return "Secure your account";
      case 4:
        return "Complete your academic profile";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RoleCard
                role="STUDENT"
                currentRole={role}
                onChange={handleRoleChange}
                icon={GraduationCap}
                title="Student"
                description="Access courses, assignments, and academic resources"
              />
              <RoleCard
                role="FACULTY"
                currentRole={role}
                onChange={handleRoleChange}
                icon={BookOpen}
                title="Faculty"
                description="Manage courses, create content, and track student progress"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                id="firstName"
                value={firstName}
                onChange={setFirstName}
                Icon={User}
                placeholder="Enter your first name"
                required
              />
              <InputField
                label="Last Name"
                id="lastName"
                value={lastName}
                onChange={setLastName}
                Icon={User}
                placeholder="Enter your last name"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Username"
                id="username"
                value={username}
                onChange={setUsername}
                Icon={User}
                placeholder="Choose a unique username"
              />
              <p className="text-xs text-gray-400 mt-1">
                Username must contain your first and last name, can include
                underscores and numbers, 3-30 characters.
              </p>
              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={email}
                onChange={setEmail}
                Icon={Mail}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Field with Eye Icon */}
              <div className="relative">
                <InputField
                  label="Password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  Icon={Lock}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-3/5 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {/* Eye is closed when password is hidden, open when visible */}
                  {!showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Confirm Password Field with Eye Icon */}
              <div className="relative">
                <InputField
                  label="Confirm Password"
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  Icon={Lock}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-3/5 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {/* Eye is closed when password is hidden, open when visible */}
                  {!showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Password Requirements:
              </h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li
                  className={`flex items-center gap-2 ${
                    password.length >= 6 ? "text-green-400" : ""
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      password.length >= 6 ? "bg-green-400" : "bg-gray-500"
                    }`}
                  />
                  At least 6 characters long
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    password === confirmPassword && password
                      ? "text-green-400"
                      : ""
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      password === confirmPassword && password
                        ? "bg-green-400"
                        : "bg-gray-500"
                    }`}
                  />
                  Passwords match
                </li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="College"
                value={collegeId}
                onChange={setCollegeId}
                options={colleges}
                required
              />
              <SelectField
                label="Department"
                value={departmentId}
                onChange={setDepartmentId}
                options={departments}
                required
              />
            </div>

            {role === "STUDENT" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Enrollment Number"
                  id="enrollmentNo"
                  value={enrollmentNo}
                  onChange={setEnrollmentNo}
                  placeholder="Enter your enrollment number"
                  required
                />
                <SelectField
                  label="Year"
                  value={yearId}
                  onChange={setYearId}
                  options={years}
                />
              </div>
            )}

            <InputField
              label="Specialization"
              id="specialization"
              value={specialization}
              onChange={setSpecialization}
              placeholder="e.g., Computer Science, Data Analytics (Optional)"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
        {toast && (
          <Toast
            variant={toast.type === "success" ? "default" : "destructive"}
            onOpenChange={() => setToast(null)}
          >
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                {toast.type === "success" ? "Success" : "Error"}
              </span>
              <span>{toast.message}</span>
            </div>
          </Toast>
        )}
        <ToastViewport />
        <div className="w-full max-w-2xl bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex flex-col items-center text-white">
              <Logo darkMode />
              <h2 className="mt-4 text-2xl font-bold">{getStepTitle()}</h2>
              <p className="mt-2 text-blue-100">{getStepDescription()}</p>
            </div>
          </div>
          {/* Progress indicator */}
          <div className="px-8 py-4 bg-gray-700/50">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        step < currentStep ? "bg-blue-600" : "bg-gray-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="px-8 py-6">
            {/* Already have account */}
            <div className="text-center mb-6">
              <p className="text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 cursor-pointer"
                >
                  Log in here
                </button>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStep()}
              {/* Terms and Conditions - only show on last step */}
              {currentStep === 4 && (
                <div className="flex items-start space-x-3 p-4 bg-gray-700/50 rounded-lg">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700 mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-300 leading-relaxed"
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePrevious}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
                <div className="flex-1" />
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
};

export default Signup;
