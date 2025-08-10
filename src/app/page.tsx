'use client'

import Navbar from "./components/Navbar";
import Bg_main from "./components/Bg_main";
import { useState, useEffect } from "react";
import Loading from "./components/Loading";



export default function Home() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500) 
  }, [])

  if (loading) return <Loading />
  return (
    <>
        <Navbar />
        <Bg_main />
    </>
   
  );
}
