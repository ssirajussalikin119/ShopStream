import React from "react";  
import Hero from "../components/home/Hero";  
import Category from "../components/home/Category";  
import Featured from "../components/home/Featured";  
import Newsletter from "../components/home/Newsletter";  
import Footer from "../components/home/Footer";  

const Home = () => {  
  return (  
    <main className="min-h-screen bg-white">  
      <Hero />  
      <Category />  
      <Featured />  
      <Newsletter />  
      <Footer />  
    </main>  
  );  
};  

export default Home;