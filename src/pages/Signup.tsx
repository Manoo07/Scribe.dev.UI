import React, { useState, useEffect } from "react";
import { Mail, Lock, User } from "lucide-react";
import Button from "../components/ui/Button";
import Logo from "../components/Logo";
import axios from "axios";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [role, setRole] = useState("STUDENT");

  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/college")
      .then((res) => setColleges(res.data))
      .catch((err) => console.error("Error fetching colleges", err));
  }, []);

  useEffect(() => {
    if (!collegeId) return;
    axios
      .post("http://localhost:3000/api/v1/department", {
        filter: { collegeId },
      })
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Error fetching departments", err));
  }, [collegeId]);

  useEffect(() => {
    if (!departmentId) return;
    axios
      .post("http://localhost:3000/api/v1/year", {
        filter: { departmentId },
      })
      .then((res) => setYears(res.data))
      .catch((err) => console.error("Error fetching years", err));
  }, [departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/v1/auth/signup", {
        name,
        email,
        password,
        collegeId,
        role,
        departmentId,
        sectionId,
        specialization,
      });
      console.log("Signup success", res.data);
      alert("Signup successful!");
    } catch (err) {
      console.error("Signup failed", err);
      alert("Signup failed. Check console for more info.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center">
          <Logo darkMode />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 hover:text-blue-300">
              Log in
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              id="name"
              value={name}
              onChange={setName}
              Icon={User}
              placeholder="Enter your full name"
            />
            <InputField
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={setEmail}
              Icon={Mail}
              placeholder="Enter your email"
            />

            <InputField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={setPassword}
              Icon={Lock}
              placeholder="Create a password"
            />
            <InputField
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              Icon={Lock}
              placeholder="Confirm password"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-semibold">
              Academic Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="College"
                value={collegeId}
                onChange={setCollegeId}
                options={colleges}
              />
              <SelectField
                label="Department"
                value={departmentId}
                onChange={setDepartmentId}
                options={departments}
              />
              <SelectField
                label="Year"
                value={sectionId}
                onChange={setSectionId}
                options={years}
              />
              <InputField
                label="Specialization"
                id="specialization"
                value={specialization}
                onChange={setSpecialization}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center space-x-2">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label htmlFor="terms" className="text-sm text-gray-300">
              I agree to the{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
};

// 🔹 Input Field Component
const InputField = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  Icon,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  Icon?: React.FC<any>;
  placeholder?: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <div className="mt-1 relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-500" />
        </div>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
        required={type !== "text" || id !== "specialization"}
      />
    </div>
  </div>
);

// 🔹 Select Field Component
const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; name: string }[];
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 pl-3 pr-10"
      required
    >
      <option value="">Select {label}</option>
      {options.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  </div>
);

export default Signup;
