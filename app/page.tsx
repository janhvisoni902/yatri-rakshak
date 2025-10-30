'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, MapPin, AlertTriangle, Phone, Star, Search, Lock, ArrowRight, Play, Zap, Database, Sparkles } from 'lucide-react';
import Link from 'next/link';
import UserDropdown from '@/components/UserDropdown';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Remove auto-redirect to dashboard; stay on home with guidance

  const callNumber = useCallback((num: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${num}`;
    }
  }, []);

  // Siren playback using Web Audio API (no external asset needed)
  const playSiren = useCallback(async () => {
    try {
      const AudioCtx = (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext));
      if (!AudioCtx) return null;
      const audioContext = new AudioCtx();
      // Ensure maximum volume within app context
      const masterGain = audioContext.createGain();
      masterGain.gain.value = 1.0;
      masterGain.connect(audioContext.destination);

      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.connect(masterGain);
      oscillator.start();

      let isActive = true;
      const sweep = async () => {
        while (isActive) {
          // Sweep between 600Hz and 1200Hz to mimic a siren
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.5);
          oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 1.0);
          await new Promise((r) => setTimeout(r, 1000));
        }
      };
      sweep();

      const stop = () => {
        try {
          isActive = false;
          oscillator.stop();
          oscillator.disconnect();
          masterGain.disconnect();
          audioContext.close();
        } catch {}
      };
      return stop;
    } catch (err) {
      console.error('Failed to play siren', err);
      return null;
    }
  }, []);

  const holdTimerRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const sirenStopRef = useRef<(() => void) | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);

  const triggerPanic = useCallback(async () => {
    try {
      // Get current location for emergency
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Send enhanced emergency request
          const res = await fetch('/api/emergency', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'panic_button',
              location,
              timestamp: new Date().toISOString(),
              additionalInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform
              }
            })
          });
          
          if (!res.ok) {
            console.error('Panic API failed');
          } else {
            // Show success message
            alert('Emergency alert sent! Authorities have been notified.');
          }
        }, (error) => {
          // Fallback without location
          fetch('/api/emergency', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'panic_button',
              timestamp: new Date().toISOString()
            })
          });
        });
      }
      
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([200, 100, 200, 100, 200]); } catch {}
      }
      // Intentionally do not navigate away so the siren can continue playing
    } catch (e) {
      console.error('Panic error', e);
    }
  }, []);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    holdStartRef.current = null;
  }, []);

  const handlePanicPointerDown = useCallback(() => {
    setIsHolding(true);
    holdStartRef.current = Date.now();
    holdTimerRef.current = window.setTimeout(async () => {
      // 3 seconds hold completed
      try {
        await triggerPanic();
        if (!sirenStopRef.current) {
          const stop = await playSiren();
          if (stop) {
            sirenStopRef.current = stop;
            setIsSirenActive(true);
          }
        } else {
          setIsSirenActive(true);
        }
      } finally {
        setIsHolding(false);
        holdTimerRef.current = null;
      }
    }, 3000);
  }, [playSiren, triggerPanic]);

  const handlePanicPointerUpOrCancel = useCallback(() => {
    // If user releases before 3s, cancel
    cancelHold();
  }, [cancelHold]);

  // Optional: stop siren when leaving page
  useEffect(() => {
    return () => {
      if (sirenStopRef.current) {
        sirenStopRef.current();
        sirenStopRef.current = null;
      }
    };
  }, []);

  const handleStopSiren = useCallback(() => {
    try {
      if (sirenStopRef.current) {
        sirenStopRef.current();
        sirenStopRef.current = null;
      }
    } finally {
      setIsSirenActive(false);
    }
  }, []);

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
              <Link href="/" className="text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/dashboard" className="text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/dashboard/women-safety" className="text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
                Women Safety
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/kyc" className="text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
                KYC
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <a href="#how-to" className="text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
                How to use
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#emergency" className="text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105 relative group">
                Emergency
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {session ? (
                <UserDropdown />
              ) : (
                <Link href="/auth/signup">
                  <Button className="defi-button text-xs sm:text-sm px-3 sm:px-4 py-2">Create Account</Button>
                </Link>
              )}
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
                <a href="#how-to">
                  <Button variant="outline" size="sm" className="border-primary/30 bg-transparent text-foreground hover:bg-primary/10 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg w-full xs:w-auto">
                    How to use
                  </Button>
                </a>
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
                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgb(102, 126, 234)" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="rgb(118, 75, 162)" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      <line x1="200" y1="200" x2="100" y2="100" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" />
                      <line x1="200" y1="200" x2="300" y2="100" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" />
                      <line x1="200" y1="200" x2="100" y2="300" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" />
                      <line x1="200" y1="200" x2="300" y2="300" stroke="url(#lineGradient)" strokeWidth="2" className="animate-pulse" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to use */}
          <div id="how-to" className="mt-10 sm:mt-14 lg:mt-16">
            <Card className="defi-card">
              <CardHeader>
                <CardTitle className="text-foreground">How to use</CardTitle>
                <CardDescription className="text-foreground/70">Quick start guide</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">1. Create account</h4>
                  <p className="text-sm text-foreground/70">Sign up and complete KYC for best experience.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">2. Explore dashboard</h4>
                  <p className="text-sm text-foreground/70">Open the app to access role-based tools.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">3. Use panic button</h4>
                  <p className="text-sm text-foreground/70">Tap Panic to alert authorities with your info.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency quick actions */}
      <section id="emergency" className="py-10 sm:py-14 lg:py-20 relative">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="defi-card hover:defi-glow transition-all">
              <CardHeader>
                <CardTitle className="text-foreground">Panic Button</CardTitle>
                <CardDescription className="text-foreground/70">Instant help request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full flex items-center justify-center gap-6 flex-wrap">
                  <Button
                    className="relative select-none bg-red-600 hover:bg-red-700 text-white rounded-full w-40 h-40 sm:w-48 sm:h-48 active:scale-95 transition-transform shadow-lg shadow-red-600/40 focus:ring-4 focus:ring-red-500/40"
                    onPointerDown={handlePanicPointerDown}
                    onPointerUp={handlePanicPointerUpOrCancel}
                    onPointerCancel={handlePanicPointerUpOrCancel}
                    onPointerLeave={handlePanicPointerUpOrCancel}
                    aria-label="Press and hold for 3 seconds to send SOS"
                  >
                    <span className="absolute inset-0 rounded-full ring-2 ring-red-400 animate-pulse" aria-hidden="true"></span>
                    <span className="relative z-10 text-xl font-bold">
                      {isHolding ? 'HOLD…' : 'PANIC'}
                    </span>
                  </Button>
                  {isSirenActive && (
                    <Button
                      className="relative select-none bg-white hover:bg-gray-100 text-red-600 rounded-full w-40 h-40 sm:w-48 sm:h-48 active:scale-95 transition-transform shadow-lg shadow-gray-400/40 border border-gray-200 focus:ring-4 focus:ring-red-500/30"
                      onClick={handleStopSiren}
                      aria-label="Stop siren"
                    >
                      <span className="absolute inset-0 rounded-full ring-2 ring-gray-300" aria-hidden="true"></span>
                      <span className="relative z-10 text-xl font-bold">STOP</span>
                    </Button>
                  )}
                </div>
                <p className="mt-3 text-xs text-foreground/70 text-center">
                  Press and hold for 3 seconds to trigger SOS with siren
                </p>
              </CardContent>
            </Card>

            <Card className="defi-card">
              <CardHeader>
                <CardTitle className="text-foreground">Emergency Numbers</CardTitle>
                <CardDescription className="text-foreground/70">Tap to call - Available 24/7</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button variant="outline" onClick={() => callNumber('100')} className="h-16 flex-col space-y-1">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm font-semibold">Police 100</span>
                </Button>
                <Button variant="outline" onClick={() => callNumber('108')} className="h-16 flex-col space-y-1">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm font-semibold">Medical 108</span>
                </Button>
                <Button variant="outline" onClick={() => callNumber('1091')} className="h-16 flex-col space-y-1 border-pink-300 text-pink-600 hover:bg-pink-50">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm font-semibold">Women 1091</span>
                </Button>
                <Button variant="outline" onClick={() => callNumber('1363')} className="h-16 flex-col space-y-1">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm font-semibold">Tourist 1363</span>
                </Button>
              </CardContent>
              <CardContent className="pt-2">
                <div className="text-center">
                  <Link href="/dashboard/women-safety">
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      Women Safety Center
                    </Button>
                  </Link>
                </div>
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
                <li><a href="#how-to" className="hover:text-foreground transition-colors text-sm sm:text-base">How to use</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-foreground/70">
                <li><a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">Contact Us</a></li>
                <li><a href="#emergency" className="hover:text-foreground transition-colors text-sm sm:text-base">Emergency</a></li>
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
