'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, MapPin, AlertTriangle, Phone, Star, Search, Lock, ArrowRight, Play, Zap, Database, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-6">
            <div className="flex items-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Yatri Rakshak</h1>
            </div>
            <nav className="hidden lg:flex space-x-8">
              <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors">Home</Link>
              <Link href="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/kyc" className="text-foreground/80 hover:text-foreground transition-colors">KYC</Link>
              <Link href="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">Features</Link>
              <Link href="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">FAQ</Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-foreground/80">Protection</span>
              </div>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/auth/signup">
                <Button className="defi-button text-xs sm:text-sm px-3 sm:px-4 py-2">Create Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-20 px-3 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black"></div>
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-20 h-20 sm:w-40 sm:h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Play Button */}
              <div className="flex justify-center lg:justify-start mb-4 sm:mb-8">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center defi-pulse">
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 text-primary ml-1" />
                  </div>
                  <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full animate-ping"></div>
                </div>
              </div>
              
              {/* Unlock Button */}
              <div className="flex justify-center lg:justify-start mb-4 sm:mb-6">
                <Button variant="outline" className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm px-3 sm:px-4 py-2">
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Unlock Your Safety Spark!</span>
                  <span className="xs:hidden">Safety Spark!</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </Button>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="text-foreground">One-click for</span>
                <br />
                <span className="defi-text-gradient">Asset Defense</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-xl text-foreground/70 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0">
                Dive into the art of safety, where innovative blockchain technology meets comprehensive security expertise.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-2 sm:px-0">
                <Link href="/dashboard">
                  <Button size="sm" className="defi-button px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg w-full xs:w-auto">
                    Open App
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" size="sm" className="border-primary/30 bg-transparent text-foreground hover:bg-primary/10 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg w-full xs:w-auto">
                    Discover More
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Content - Data Visualization */}
            <div className="flex-1 relative mt-6 lg:mt-0">
              <div className="relative w-full h-64 sm:h-80 lg:h-96 xl:h-[500px]">
                {/* Network Visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48 xs:w-60 xs:h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96">
                    {/* Central Hub */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-primary rounded-full flex items-center justify-center defi-glow">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary-foreground" />
                    </div>
                    
                    {/* Data Points */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-8 lg:left-8 defi-card p-2 sm:p-3 lg:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-foreground/60">Cortex</div>
                      <div className="text-sm sm:text-lg lg:text-2xl font-bold text-foreground">20.945</div>
                    </div>
                    
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-8 lg:right-8 defi-card p-2 sm:p-3 lg:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-foreground/60">Aelf</div>
                      <div className="text-sm sm:text-lg lg:text-2xl font-bold text-foreground">19.346</div>
                    </div>
                    
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 lg:bottom-8 lg:left-8 defi-card p-2 sm:p-3 lg:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-foreground/60">Quant</div>
                      <div className="text-sm sm:text-lg lg:text-2xl font-bold text-foreground">2.945</div>
                    </div>
                    
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:bottom-8 lg:right-8 defi-card p-2 sm:p-3 lg:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-foreground/60">Meeton</div>
                      <div className="text-sm sm:text-lg lg:text-2xl font-bold text-foreground">440</div>
                    </div>
                    
                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgb(102, 126, 234)" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="rgb(118, 75, 162)" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      <line x1="200" y1="200" x2="100" y2="100" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" />
                      <line x1="200" y1="200" x2="300" y2="100" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                      <line x1="200" y1="200" x2="100" y2="300" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" style={{animationDelay: '1s'}} />
                      <line x1="200" y1="200" x2="300" y2="300" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" style={{animationDelay: '1.5s'}} />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="flex justify-between items-center mt-8 sm:mt-12 lg:mt-16 pt-4 sm:pt-6 lg:pt-8 border-t border-border/30">
            <div className="text-xs sm:text-sm text-foreground/60">02/03. Scroll down</div>
            <div className="flex space-x-1">
              <div className="w-1 h-4 sm:h-6 lg:h-8 bg-primary/60 rounded-full"></div>
              <div className="w-1 h-4 sm:h-6 lg:h-8 bg-primary/40 rounded-full"></div>
              <div className="w-1 h-4 sm:h-6 lg:h-8 bg-primary/20 rounded-full"></div>
            </div>
            <div className="text-xs sm:text-sm text-foreground/60">Safety horizons</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 lg:py-20 relative">
        <div className="absolute inset-0 defi-bg-pattern opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Comprehensive Safety Features
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-foreground/70 px-4 sm:px-0">
              Everything you need for a safe and secure experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                </div>
                <CardTitle className="text-foreground text-base sm:text-lg">Emergency Reporting</CardTitle>
                <CardDescription className="text-foreground/70 text-sm">
                  Quick incident reporting with real-time location sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-foreground/60">
                  Report emergencies instantly with GPS coordinates, photos, and priority levels.
                </p>
              </CardContent>
            </Card>

            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <CardTitle className="text-foreground text-base sm:text-lg">Real-time Tracking</CardTitle>
                <CardDescription className="text-foreground/70 text-sm">
                  Live location monitoring and geo-fence alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-foreground/60">
                  Stay connected with real-time location sharing and safety zone monitoring.
                </p>
              </CardContent>
            </Card>

            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <CardTitle className="text-foreground text-base sm:text-lg">Multi-Role Platform</CardTitle>
                <CardDescription className="text-foreground/70 text-sm">
                  Designed for tourists, citizens, police, and authorities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-foreground/60">
                  Role-based dashboards with specialized tools for each user type.
                </p>
              </CardContent>
            </Card>

            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
                <CardTitle className="text-foreground text-base sm:text-lg">Emergency Contacts</CardTitle>
                <CardDescription className="text-foreground/70 text-sm">
                  Quick access to local emergency services
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-foreground/60">
                  One-tap access to police, medical, and tourist helpline numbers.
                </p>
              </CardContent>
            </Card>

            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground text-base sm:text-lg">KYC Verification</CardTitle>
                <CardDescription className="text-foreground/70 text-sm">
                  Secure identity verification for all users
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-foreground/60">
                  Comprehensive KYC process ensuring platform security and trust.
                </p>
              </CardContent>
            </Card>

            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                </div>
                <CardTitle className="text-foreground text-base sm:text-lg">24/7 Support</CardTitle>
                <CardDescription className="text-foreground/70 text-sm">
                  Round-the-clock assistance and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-foreground/60">
                  Continuous support with dedicated response teams and monitoring.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Users Section */}
      <section className="py-8 sm:py-12 lg:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Try Demo Accounts
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-foreground/70 px-4 sm:px-0">
              Test the platform with pre-configured demo accounts
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <CardTitle className="text-base sm:text-lg text-foreground">Tourist Demo</CardTitle>
                <CardDescription className="text-foreground/70 text-xs sm:text-sm">Experience the tourist interface</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm mb-1 sm:mb-2 text-foreground/80"><strong>Email:</strong> tourist@demo.com</p>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-foreground/80"><strong>Password:</strong> demo123</p>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="w-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm py-2">
                    Try Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                </div>
                <CardTitle className="text-base sm:text-lg text-foreground">Police Demo</CardTitle>
                <CardDescription className="text-foreground/70 text-xs sm:text-sm">Test police officer features</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm mb-1 sm:mb-2 text-foreground/80"><strong>Email:</strong> police@demo.com</p>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-foreground/80"><strong>Password:</strong> demo123</p>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="w-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm py-2">
                    Try Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
                <CardTitle className="text-base sm:text-lg text-foreground">Authority Demo</CardTitle>
                <CardDescription className="text-foreground/70 text-xs sm:text-sm">Explore authority dashboard</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm mb-1 sm:mb-2 text-foreground/80"><strong>Email:</strong> authority@demo.com</p>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-foreground/80"><strong>Password:</strong> demo123</p>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="w-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm py-2">
                    Try Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="defi-card hover:defi-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg text-foreground">Admin Demo</CardTitle>
                <CardDescription className="text-foreground/70 text-xs sm:text-sm">Access admin controls</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm mb-1 sm:mb-2 text-foreground/80"><strong>Email:</strong> admin@demo.com</p>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-foreground/80"><strong>Password:</strong> demo123</p>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="w-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm py-2">
                    Try Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/90 backdrop-blur-md border-t border-border/50 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2" />
                <span className="text-base sm:text-lg font-semibold text-foreground">Yatri Rakshak</span>
              </div>
              <p className="text-sm sm:text-base text-foreground/70">
                Ensuring safety and security for all travelers and citizens.
              </p>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2 text-foreground/70">
                <li><Link href="/auth/signin" className="hover:text-foreground transition-colors text-sm sm:text-base">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-foreground transition-colors text-sm sm:text-base">Sign Up</Link></li>
                <li><a href="#features" className="hover:text-foreground transition-colors text-sm sm:text-base">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-foreground/70">
                <li><a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">Emergency</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Emergency</h4>
              <ul className="space-y-1 sm:space-y-2 text-foreground/70">
                <li className="text-sm sm:text-base">Police: 100</li>
                <li className="text-sm sm:text-base">Medical: 108</li>
                <li className="text-sm sm:text-base">Tourist Helpline: 1363</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/30 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-foreground/60">
            <p className="text-xs sm:text-sm">&copy; 2025 Yatri Rakshak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
