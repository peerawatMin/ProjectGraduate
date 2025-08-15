'use client'
import React from 'react'
import { useState , useEffect } from 'react';
import ExamSessionManager from "../components/ExamSessionManager";
import Loading from '../components/Loading';

const Page = () => {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000) 
  }, [])

  
  if (loading) return <Loading />;
  return (
    <>
      <ExamSessionManager/>
    </>

  );
};

export default Page;
