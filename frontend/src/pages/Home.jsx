import React from "react";
import Hero from "../components/home/Hero";
import Category from "../components/home/Category";
import Featured from "../components/home/Featured";

const Home = () => {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Category />
      <Featured />
      {/* You can easily add more sections like Newsletter.jsx or Footer.jsx here */}
    </main>
  );
};

export default Home;
