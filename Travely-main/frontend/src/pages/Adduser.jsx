import React, { useState } from "react";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import Swal from "sweetalert2";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/spinner/LoadingSpinner";
import DOMPurify from 'dompurify';

const Adduser = () => {
  const [loading2, setLoading2] = useState(false);
  const navigate = useNavigate();
  const [file, setFile] = useState(null); // Changed initial state to null
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [country, setCountry] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [type, setType] = useState("traveler");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // Regular Expressions for Validation
  const namePattern = /^[a-zA-Z\s]*$/; // Only letters and spaces
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobilePattern = /^[0-9]{10}$/; // 10-digit number
  const passwordPattern = /^[a-zA-Z0-9!@#$%^&*]{6,}$/; // At least 6 characters
  const specialCharPattern = /[<>%$]/; // Special characters to prevent

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Define regular expressions for validation
    // Already defined above

    // XSS Prevention: Check for script tags
    const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

    // Validate Name
    if (!namePattern.test(name)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Name",
        text: "Name should only contain letters and spaces.",
      });
      return;
    }

    // Validate Email
    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Enter a valid email address.",
      });
      return;
    }

    // Validate Mobile
    if (!mobilePattern.test(mobile)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Mobile number should be a 10-digit number.",
      });
      return;
    }

    // Validate Password
    if (!passwordPattern.test(password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be at least 6 characters long and can include letters, numbers, and special characters (!@#$%^&*).",
      });
      return;
    }

    // Confirm Password
    if (password !== password2) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match.",
      });
      return;
    }

    // Check for Special Characters
    if (
      specialCharPattern.test(name) ||
      specialCharPattern.test(email) ||
      specialCharPattern.test(country) ||
      specialCharPattern.test(type)
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid Characters",
        text: "Inputs contain invalid special characters.",
      });
      return;
    }

    // Check for Potential XSS Attacks
    if (xssPattern.test(name) || xssPattern.test(email) || xssPattern.test(country)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Your input contains potentially harmful content.",
      });
      return;
    }

    // Confirm Submission
    const result = await Swal.fire({
      title: "Do you want to sign up this account?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    });

    if (result.isDenied || result.isDismissed) {
      Swal.fire("Details are not saved", "", "info");
      return;
    }

    // Sanitize Inputs
    const cleanName = DOMPurify.sanitize(name);
    const cleanEmail = DOMPurify.sanitize(email);
    const cleanCountry = DOMPurify.sanitize(country);
    const cleanType = DOMPurify.sanitize(type);

    // Further check if sanitization altered the input
    if (
      cleanName !== name ||
      cleanEmail !== email ||
      cleanCountry !== country ||
      cleanType !== type
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Your input contains potentially harmful content.",
      });
      return;
    }

    // Proceed with Submission
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "upload");

    try {
      setLoading2(true);
      let imageUrl = "";

      if (file) {
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dpgelkpd4/image/upload",
          data
        );

        imageUrl = uploadRes.data.url;
      }

      // Prepare user data
      const userData = {
        name: cleanName,
        email: cleanEmail,
        mobile,
        country: cleanCountry,
        type: cleanType,
        isAdmin,
        password,
        ...(imageUrl && { img: imageUrl }), // Include img only if imageUrl exists
      };

      // Send user data to backend
      await axios.post("auth/register", userData);

      setLoading2(false);
      Swal.fire("Success!", "Account registered successfully.", "success");
      navigate("/users");
    } catch (err) {
      setLoading2(false);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  // Handle isAdmin as boolean
  const handleIsAdminChange = (e) => {
    const value = e.target.value;
    setIsAdmin(value === "true");
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8 md:px-24 p-4 sm:py-8">
        <div className="flex flex-col justify-center items-center md:py-36 py-10 gap-5 rounded-lg md:m-20 m-5 bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
          <div className="text-center mx-6 pt-3 pb-3">
            <h1 className="text-4xl font-bold text-blue-500">Add User</h1>
          </div>
          <div>
            <img
              className="w-44 h-44 rounded-full shadow-lg border-4 border-blue-500 object-cover"
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="User Profile"
            />
          </div>
          <div className="text-center mx-6 pt-3">
            <h1 className="text-xl font-semibold">Available Points</h1>
            <h3 className="text-blue-500">1500</h3>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">Account Status</h1>
            <h3 className="text-blue-500">Blue</h3>
          </div>
        </div>
        <div className="grid rounded-lg items-center bg-white p-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Name Field */}
            <input
              type="text"
              placeholder="Name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full md:mt-6 px-4 py-2 rounded-lg placeholder-gray-400 text-gray-600 bg-white border border-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Email Field */}
            <input
              type="email"
              placeholder="Email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg placeholder-gray-400 text-gray-600 bg-white border border-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Country Field */}
            <input
              type="text"
              placeholder="Country"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 rounded-lg placeholder-gray-400 text-gray-600 bg-white border border-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Mobile Field */}
            <input
              type="text"
              placeholder="Mobile"
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-2 rounded-lg placeholder-gray-400 text-gray-600 bg-white border border-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* isAdmin Select */}
            <select
              id="isAdmin"
              value={isAdmin}
              onChange={handleIsAdminChange}
              className="w-full px-4 py-2 rounded-lg placeholder-gray-400 text-gray-600 bg-white border border-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={false}>False</option>
              <option value={true}>True</option>
            </select>

            {/* Type Select */}
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg placeholder-gray-400 text-gray-600 bg-white border border-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="traveler">Traveler</option>
              <option value="hotelOwner">Hotel Owner</option>
              <option value="vehicleOwner">Vehicle Owner</option>
              <option value="resturentOwner">Restaurant Owner</option>
              <option value="tourGuide">Tour Guide</option>
              <option value="eventOrganizer">Event Organizer</option>
            </select>

            {/* Password Field */}
            <input
              type="password"
              placeholder="Password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg placeholder-gray-400 text-gray-600 bg-white border border-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Confirm Password Field */}
            <input
              type="password"
              placeholder="Confirm Password"
              id="password2"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full px-4 py-2 rounded-lg placeholder-gray-400 text-gray-600 bg-white border border-gray-300 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* File Upload */}
            <div className="text-center">
              <label htmlFor="file" className="cursor-pointer flex items-center justify-center gap-2">
                Click here to add a profile picture
                <DriveFolderUploadOutlinedIcon />
              </label>
              <input
                type="file"
                id="file"
                name="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Spinner */}
            {loading2 && <Spinner />}

            {/* Submit Button */}
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold mb-9"
              type="submit"
              disabled={loading2} // Disable button while loading
            >
              {loading2 ? "Adding User..." : "Add User"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
export default Adduser;
