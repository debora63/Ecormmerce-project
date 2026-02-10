import { FaWhatsapp, FaFacebook, FaInstagram, FaPhone, FaEnvelope } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; // Black X icon
import { useEffect, useState } from "react";

const ContactUs = () => {
  const [gradientAngle, setGradientAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prevAngle) => (prevAngle + 0.5) % 360); // Smooth animation
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-6"
      style={{
        background: `linear-gradient(${gradientAngle}deg, #ff0000, #ff7300, #ffeb00, #00ff00, #0099ff, #6e00ff, #ff00aa)`,
        backgroundSize: "400% 400%",
        transition: "background 1s linear",
      }}
    >
      {/* 🔥 Main Contact Icons (Big Ones on Top) */}
      <h1 className="text-4xl font-extrabold text-white drop-shadow-lg mb-6">
        📢 Contact Us By
      </h1>

      <div className="flex flex-wrap justify-center gap-8 mb-8">
        <ContactLink href="https://wa.me/" icon={<FaWhatsapp />} label="WhatsApp" color="text-green-400" />
        <ContactLink href="https://twitter.com/" icon={<FaXTwitter className="text-black" />} label="X" color="text-black" />
        <ContactLink href="https://facebook.com/" icon={<FaFacebook />} label="Facebook" color="text-blue-500" />
        <ContactLink href="https://instagram.com/" icon={<FaInstagram />} label="Instagram" color="text-pink-500" />
        <ContactLink href="tel:+254XXXXXXXX" icon={<FaPhone />} label="Call" color="text-yellow-400" />
        <ContactLink href="mailto:support@electrohub.com" icon={<FaEnvelope />} label="Email" color="text-red-500" />
      </div>

      {/* 🔥 Horizontal Contact Info (White Text) */}
      <div className="flex flex-wrap justify-center space-x-6 bg-black bg-opacity-60 p-4 rounded-lg">
        <ContactInfo icon={<FaWhatsapp className="text-green-400 text-xl" />} text="+2547XXXXXX" />
        <ContactInfo icon={<FaXTwitter className="text-white text-xl" />} text="@electrohub_ke" />
        <ContactInfo icon={<FaFacebook className="text-blue-400 text-xl" />} text="Electro Hub-Ke" />
        <ContactInfo icon={<FaInstagram className="text-pink-400 text-xl" />} text="@electrohub_ke" />
        <ContactInfo icon={<FaPhone className="text-yellow-400 text-xl" />} text="+2547XXXXXX" />
        <ContactInfo icon={<FaEnvelope className="text-red-400 text-xl" />} text="support@electrohubke.com" />
      </div>
    </div>
  );
};

// 🔥 Reusable Components
const ContactLink = ({ href, icon, label, color }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
    <span className={`${color} text-6xl drop-shadow-lg hover:opacity-80 transition duration-300`}>
      {icon}
    </span>
    <span className="mt-2 text-2xl font-bold text-white drop-shadow-lg">{label}</span>
  </a>
);

const ContactInfo = ({ icon, text }) => (
  <div className="flex items-center space-x-2 text-white text-lg font-bold">
    {icon}
    <span className="text-white">{text}</span> {/* Forced White Text */}
  </div>
);

export default ContactUs;
