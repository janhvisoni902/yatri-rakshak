'use client'

import React, { useState } from 'react'
import { Users, AlertTriangle, Shield, MapPin } from 'lucide-react'
import { Badge } from '@/components/badge'
import { StateData } from '@/types/map'

const statesData: StateData[] = [
  // Northern States
  {
    name: 'Jammu and Kashmir',
    code: 'JK',
    safetyScore: 75,
    tourists: 15000,
    touristCount: 15000,
    incidents: 25,
    police: 100,
    resolvedIncidents: 20,
    popularDestinations: ['Dal Lake', 'Gulmarg', 'Pahalgam'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 300, y: 80 },
    color: '#f59e0b',
    trend: 'stable'
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    safetyScore: 88,
    touristCount: 35000,
    incidents: 15,
    resolvedIncidents: 14,
    popularDestinations: ['Shimla', 'Manali', 'Dharamshala'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 320, y: 120 },
    color: '#10b981',
    trend: 'up'
  },
  {
    name: 'Punjab',
    code: 'PB',
    safetyScore: 85,
    touristCount: 20000,
    incidents: 18,
    resolvedIncidents: 16,
    popularDestinations: ['Golden Temple', 'Jallianwala Bagh', 'Wagah Border'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 280, y: 140 },
    color: '#10b981',
    trend: 'stable'
  },
  {
    name: 'Haryana',
    code: 'HR',
    safetyScore: 80,
    touristCount: 18000,
    incidents: 22,
    resolvedIncidents: 19,
    popularDestinations: ['Kurukshetra', 'Panipat', 'Faridabad'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 300, y: 160 },
    color: '#f59e0b',
    trend: 'up'
  },
  {
    name: 'Delhi',
    code: 'DL',
    safetyScore: 78,
    touristCount: 50000,
    incidents: 45,
    resolvedIncidents: 38,
    popularDestinations: ['Red Fort', 'India Gate', 'Qutub Minar'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 320, y: 180 },
    color: '#f59e0b',
    trend: 'up'
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    safetyScore: 82,
    touristCount: 40000,
    incidents: 20,
    resolvedIncidents: 18,
    popularDestinations: ['Rishikesh', 'Haridwar', 'Nainital'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 340, y: 140 },
    color: '#10b981',
    trend: 'up'
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    safetyScore: 72,
    touristCount: 60000,
    incidents: 85,
    resolvedIncidents: 70,
    popularDestinations: ['Taj Mahal', 'Varanasi', 'Lucknow'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 360, y: 200 },
    color: '#ef4444',
    trend: 'up'
  },
  
  // Eastern States
  {
    name: 'Bihar',
    code: 'BR',
    safetyScore: 68,
    touristCount: 25000,
    incidents: 55,
    resolvedIncidents: 45,
    popularDestinations: ['Bodh Gaya', 'Nalanda', 'Patna'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 400, y: 220 },
    color: '#ef4444',
    trend: 'stable'
  },
  {
    name: 'West Bengal',
    code: 'WB',
    safetyScore: 76,
    touristCount: 45000,
    incidents: 65,
    resolvedIncidents: 55,
    popularDestinations: ['Victoria Memorial', 'Darjeeling', 'Sundarbans'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 420, y: 260 },
    color: '#f59e0b',
    trend: 'up'
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    safetyScore: 70,
    touristCount: 15000,
    incidents: 40,
    resolvedIncidents: 32,
    popularDestinations: ['Ranchi', 'Jamshedpur', 'Deoghar'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 400, y: 280 },
    color: '#ef4444',
    trend: 'stable'
  },
  {
    name: 'Odisha',
    code: 'OR',
    safetyScore: 79,
    touristCount: 30000,
    incidents: 35,
    resolvedIncidents: 30,
    popularDestinations: ['Jagannath Temple', 'Konark', 'Bhubaneswar'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 400, y: 320 },
    color: '#f59e0b',
    trend: 'up'
  },
  
  // Western States
  {
    name: 'Rajasthan',
    code: 'RJ',
    safetyScore: 81,
    touristCount: 55000,
    incidents: 50,
    resolvedIncidents: 45,
    popularDestinations: ['Jaipur', 'Udaipur', 'Jaisalmer'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 260, y: 200 },
    color: '#10b981',
    trend: 'up'
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    safetyScore: 84,
    touristCount: 40000,
    incidents: 30,
    resolvedIncidents: 27,
    popularDestinations: ['Somnath', 'Dwarka', 'Gir National Park'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 220, y: 260 },
    color: '#10b981',
    trend: 'up'
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    safetyScore: 82,
    touristCount: 65000,
    incidents: 67,
    resolvedIncidents: 58,
    popularDestinations: ['Gateway of India', 'Ajanta Caves', 'Lonavala'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 280, y: 320 },
    color: '#10b981',
    trend: 'up'
  },
  
  // Central States
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    safetyScore: 77,
    touristCount: 35000,
    incidents: 45,
    resolvedIncidents: 38,
    popularDestinations: ['Khajuraho', 'Bhopal', 'Gwalior'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 320, y: 280 },
    color: '#f59e0b',
    trend: 'stable'
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    safetyScore: 73,
    touristCount: 20000,
    incidents: 30,
    resolvedIncidents: 25,
    popularDestinations: ['Raipur', 'Jagdalpur', 'Bilaspur'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 360, y: 300 },
    color: '#ef4444',
    trend: 'up'
  },
  
  // Southern States
  {
    name: 'Karnataka',
    code: 'KA',
    safetyScore: 86,
    touristCount: 50000,
    incidents: 40,
    resolvedIncidents: 36,
    popularDestinations: ['Mysore Palace', 'Hampi', 'Coorg'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 280, y: 380 },
    color: '#10b981',
    trend: 'up'
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    safetyScore: 78,
    touristCount: 35000,
    incidents: 42,
    resolvedIncidents: 35,
    popularDestinations: ['Tirupati', 'Visakhapatnam', 'Amaravati'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 340, y: 380 },
    color: '#f59e0b',
    trend: 'up'
  },
  {
    name: 'Telangana',
    code: 'TG',
    safetyScore: 80,
    touristCount: 30000,
    incidents: 35,
    resolvedIncidents: 30,
    popularDestinations: ['Charminar', 'Golconda Fort', 'Ramoji Film City'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 340, y: 360 },
    color: '#f59e0b',
    trend: 'up'
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    safetyScore: 83,
    touristCount: 55000,
    incidents: 48,
    resolvedIncidents: 43,
    popularDestinations: ['Meenakshi Temple', 'Marina Beach', 'Ooty'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 300, y: 420 },
    color: '#10b981',
    trend: 'up'
  },
  {
    name: 'Kerala',
    code: 'KL',
    safetyScore: 89,
    touristCount: 45000,
    incidents: 25,
    resolvedIncidents: 23,
    popularDestinations: ['Backwaters', 'Munnar', 'Fort Kochi'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 260, y: 420 },
    color: '#10b981',
    trend: 'up'
  },
  
  // Northeastern States
  {
    name: 'Assam',
    code: 'AS',
    safetyScore: 74,
    touristCount: 25000,
    incidents: 35,
    resolvedIncidents: 28,
    popularDestinations: ['Kaziranga', 'Guwahati', 'Majuli'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 480, y: 200 },
    color: '#ef4444',
    trend: 'stable'
  },
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    safetyScore: 76,
    touristCount: 12000,
    incidents: 15,
    resolvedIncidents: 13,
    popularDestinations: ['Tawang', 'Itanagar', 'Ziro'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 520, y: 160 },
    color: '#f59e0b',
    trend: 'up'
  },
  {
    name: 'Nagaland',
    code: 'NL',
    safetyScore: 72,
    touristCount: 8000,
    incidents: 12,
    resolvedIncidents: 10,
    popularDestinations: ['Kohima', 'Dimapur', 'Mon'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 500, y: 200 },
    color: '#ef4444',
    trend: 'stable'
  },
  {
    name: 'Manipur',
    code: 'MN',
    safetyScore: 71,
    touristCount: 10000,
    incidents: 18,
    resolvedIncidents: 15,
    popularDestinations: ['Imphal', 'Loktak Lake', 'Kangla Fort'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 500, y: 220 },
    color: '#ef4444',
    trend: 'stable'
  },
  {
    name: 'Mizoram',
    code: 'MZ',
    safetyScore: 78,
    touristCount: 9000,
    incidents: 10,
    resolvedIncidents: 9,
    popularDestinations: ['Aizawl', 'Champhai', 'Lunglei'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 480, y: 240 },
    color: '#f59e0b',
    trend: 'up'
  },
  {
    name: 'Tripura',
    code: 'TR',
    safetyScore: 75,
    touristCount: 11000,
    incidents: 14,
    resolvedIncidents: 12,
    popularDestinations: ['Agartala', 'Ujjayanta Palace', 'Neermahal'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 460, y: 260 },
    color: '#f59e0b',
    trend: 'stable'
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    safetyScore: 79,
    touristCount: 18000,
    incidents: 16,
    resolvedIncidents: 14,
    popularDestinations: ['Shillong', 'Cherrapunji', 'Living Root Bridges'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 460, y: 220 },
    color: '#f59e0b',
    trend: 'up'
  },
  {
    name: 'Sikkim',
    code: 'SK',
    safetyScore: 87,
    touristCount: 22000,
    incidents: 8,
    resolvedIncidents: 7,
    popularDestinations: ['Gangtok', 'Pelling', 'Nathu La Pass'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 420, y: 180 },
    color: '#10b981',
    trend: 'up'
  },
  
  // Union Territories
  {
    name: 'Goa',
    code: 'GA',
    safetyScore: 85,
    touristCount: 80000,
    incidents: 35,
    resolvedIncidents: 32,
    popularDestinations: ['Baga Beach', 'Old Goa', 'Dudhsagar Falls'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 240, y: 360 },
    color: '#10b981',
    trend: 'up'
  },
  {
    name: 'Puducherry',
    code: 'PY',
    safetyScore: 81,
    touristCount: 15000,
    incidents: 12,
    resolvedIncidents: 11,
    popularDestinations: ['French Quarter', 'Auroville', 'Paradise Beach'],
    emergencyContacts: { police: '100', medical: '102', tourist: '1363' },
    coordinates: { x: 320, y: 400 },
    color: '#10b981',
    trend: 'stable'
  }
]

interface TooltipProps {
  state: StateData | null
  position: { x: number; y: number }
  visible: boolean
}

const Tooltip: React.FC<TooltipProps> = ({ state, position, visible }) => {
  if (!visible || !state) return null

  return (
    <div 
      className="fixed z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-[280px] pointer-events-none"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y - 10}px`,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-lg">{state.name}</h4>
          <Badge 
            variant={state.safetyScore >= 85 ? 'default' : state.safetyScore >= 75 ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {state.safetyScore}% Safe
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Tourists:</span>
            </div>
            <p className="text-white font-medium">{(state.touristCount || state.tourists || 0).toLocaleString()}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-gray-300">Incidents:</span>
            </div>
            <p className="text-white font-medium">{state.incidents}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="text-gray-300 text-sm font-medium">Popular Destinations:</h5>
          <div className="flex flex-wrap gap-1">
            {(state.popularDestinations || []).slice(0, 3).map((dest, idx) => (
              <span key={idx} className="text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded">
                {dest}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-red-400 font-medium">Police</div>
            <div className="text-white">{state.emergencyContacts?.police || '100'}</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-medium">Medical</div>
            <div className="text-white">{state.emergencyContacts?.medical || '102'}</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-medium">Tourist</div>
            <div className="text-white">{state.emergencyContacts?.tourist || '1363'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface InteractiveIndiaMapProps {
  height?: number
  showLegend?: boolean
  className?: string
  onStateClick?: (state: StateData) => void
}

const InteractiveIndiaMap: React.FC<InteractiveIndiaMapProps> = ({ 
  height = 600, 
  showLegend = true, 
  className = "",
  onStateClick 
}) => {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null)
  const [selectedState, setSelectedState] = useState<StateData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY })
  }

  const handleStateHover = (state: StateData | null) => {
    setHoveredState(state)
  }

  const handleStateClick = (state: StateData) => {
    setSelectedState(state)
    onStateClick?.(state)
  }

  return (
    <div className={`relative ${className}`} onMouseMove={handleMouseMove}>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">India Safety Map</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Interactive state-wise safety and tourism data</p>
        </div>
        
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Map visualization removed</p>
        </div>

        {showLegend && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Safety Score Legend</h4>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">85+ (Excellent)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700 dark:text-gray-300">75-84 (Good)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-gray-700 dark:text-gray-300">&lt;75 (Needs Attention)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Tooltip 
        state={hoveredState} 
        position={mousePosition} 
        visible={!!hoveredState} 
      />
    </div>
  )
}

export default InteractiveIndiaMap