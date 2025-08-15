// app/Dashboard/page.tsx
'use client'
import React from 'react'

import HeaderDB from '../components/HeaderDB'
import OverviewChart from '../components/OverviewChart'
import DashboardStats from '../components/DashboardStats'
import ExamRoomAnalytics from '../components/ExamRoomAnalytics'

export default function Mainpage() {
  return (
    <>
      
      <div className="w-full">
        <div className="flex flex-col flex-1">
          <div className="max-w-7xl mx-auto w-full">
            <HeaderDB />
            <div className="py-4 px-4 lg:px-8">
              <DashboardStats />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <OverviewChart />
                <ExamRoomAnalytics />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
