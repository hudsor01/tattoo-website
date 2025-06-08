'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, DollarSign, TrendingUp } from 'lucide-react'

export function SectionCards() {
  const stats = [
    {
      title: "Total Appointments",
      value: "2,350",
      description: "+20.1% from last month",
      icon: CalendarDays,
      trend: "up",
      change: "+180"
    },
    {
      title: "Active Customers", 
      value: "1,234",
      description: "+15.3% from last month",
      icon: Users,
      trend: "up",
      change: "+164"
    },
    {
      title: "Revenue",
      value: "$45,231.89",
      description: "+10.8% from last month",
      icon: DollarSign,
      trend: "up",
      change: "+$4,389"
    },
    {
      title: "Conversion Rate",
      value: "12.5%",
      description: "+2.1% from last month",
      icon: TrendingUp,
      trend: "up",
      change: "+2.1%"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'secondary'}
                  className={`text-xs ${stat.trend === 'up' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}`}
                >
                  {stat.change}
                </Badge>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}