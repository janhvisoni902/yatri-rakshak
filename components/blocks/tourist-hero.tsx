import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { Badge } from "@/components/badge";
import { 
  Shield, 
  Smartphone, 
  Eye, 
  Navigation,
  QrCode,
  AlertTriangle,
  Globe,
  Users,
  MapPin,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function TouristHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Shield className="w-4 h-4 mr-2" />
                  Smart India Hackathon 2025
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-gray-900 dark:text-white">Smart Tourist</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Safety System
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  AI-powered, blockchain-secured platform for real-time tourist safety monitoring, 
                  emergency response, and smart geo-fencing in India's tourist destinations.
                </p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Digital Tourist ID</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Blockchain-secured identity</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Live Tracking</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Real-time location monitoring</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Panic Button</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instant emergency response</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">AI Monitoring</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Anomaly detection system</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Get Digital Tourist ID
                  </Button>
                </Link>
                <Link href="/dashboard/admin">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Shield className="w-5 h-5 mr-2" />
                    Authority Dashboard
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">&lt;2min</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitoring</p>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Demo */}
            <div className="relative">
              <div className="relative z-10 space-y-6">
                {/* Mobile App Preview */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Yatri Rakshak</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tourist Safety App</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Safe Zone
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium">Digital ID: TID-2025-001234</span>
                        </div>
                        <Badge variant="secondary">Verified ✓</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">85</div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Safety Score</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Days Tracked</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                        <p className="text-sm text-red-700 dark:text-red-300">You're approaching a restricted area</p>
                      </div>
                      
                      <Button className="w-full bg-red-500 hover:bg-red-600">
                        <Zap className="w-4 h-4 mr-2" />
                        EMERGENCY SOS
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">50K+</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tourists Protected</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">250+</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tourist Zones</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Background Decorations */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-green-400 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl opacity-20"></div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              <span>Supporting 10+ Indian languages • Multilingual emergency access</span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join thousands of tourists who trust Yatri Rakshak for their safety while exploring 
              the incredible beauty and culture of India. Your safety is our priority.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
