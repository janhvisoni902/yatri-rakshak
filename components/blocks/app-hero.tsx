'use client';

import { useEffect, useState } from 'react';
import { easeInOut, motion, spring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Database,
  Sparkles,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function AppHero() {
  // State for animated counters
  const [stats, setStats] = useState({
    users: 0,
    transactions: 0,
    networks: 0,
  });

  // Animation to count up numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        const newUsers = prev.users >= 10 ? 10 : prev.users + 1;
        const newTransactions =
          prev.transactions >= 1250 ? 1250 : prev.transactions + 20;
        const newNetworks = prev.networks >= 40 ? 40 : prev.networks + 1;

        if (
          newUsers === 20 &&
          newTransactions === 1250 &&
          newNetworks === 40
        ) {
          clearInterval(interval);
        }

        return {
          users: newUsers,
          transactions: newTransactions,
          networks: newNetworks,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: spring, stiffness: 100 },
    },
  };

  // Floating animation for the cube
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: easeInOut,
    },
  };

  // Rotation animation for the orbital ring
  const rotateAnimation = {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  };

  // Glowing effect animation
  const glowAnimation = {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easeInOut,
    },
  };

  // Tooltip animation
  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: spring,
        stiffness: 100,
        delay: 1.2,
      },
    },
  };

  // Badge pulse animation
  const badgePulse = {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-black py-8 sm:py-12 lg:py-16 text-white px-3 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0 h-full w-full rotate-180 items-center px-2 sm:px-5 py-12 sm:py-24 opacity-80 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <svg
        id="noice"
        className="absolute inset-0 z-10 h-full w-full opacity-30"
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.34"
            numOctaves="4"
            stitchTiles="stitch"
          ></feTurbulence>
          <feColorMatrix type="saturate" values="0"></feColorMatrix>
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.46"></feFuncR>
            <feFuncG type="linear" slope="0.46"></feFuncG>
            <feFuncB type="linear" slope="0.47"></feFuncB>
            <feFuncA type="linear" slope="0.37"></feFuncA>
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.47" intercept="-0.23" />
            <feFuncG type="linear" slope="1.47" intercept="-0.23" />
            <feFuncB type="linear" slope="1.47" intercept="-0.23" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)"></rect>
      </svg>
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-black/70 to-gray-950 blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        {/* Enhanced glow spots */}
        <div className="absolute top-10 sm:top-20 -left-10 sm:-left-20 h-32 w-32 sm:h-60 sm:w-60 rounded-full bg-purple-600/20 blur-[50px] sm:blur-[100px]"></div>
        <div className="absolute -right-10 sm:-right-20 bottom-10 sm:bottom-20 h-32 w-32 sm:h-60 sm:w-60 rounded-full bg-blue-600/20 blur-[50px] sm:blur-[100px]"></div>
        <motion.div
          animate={glowAnimation}
          className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-indigo-500/10 blur-[80px]"
        ></motion.div>
        <motion.div
          animate={glowAnimation}
          className="absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full bg-purple-500/10 blur-[80px]"
        ></motion.div>

        {/* Particle effects - subtle dots */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="fadein-blur relative z-0 mx-auto mb-6 sm:mb-10 h-[200px] w-[200px] xs:h-[250px] xs:w-[250px] sm:h-[300px] sm:w-[300px] lg:absolute lg:top-1/2 lg:right-1/2 lg:mx-0 lg:mb-0 lg:h-[400px] lg:w-[400px] xl:h-[500px] xl:w-[500px] lg:translate-x-1/2 lg:-translate-y-2/3">
        <img
          src="https://i.postimg.cc/fLptvwMg/nexus.webp"
          alt="A Platform 3D Visualization"
          className="h-full w-full object-contain drop-shadow-[0_0_20px_#3358ea85] sm:drop-shadow-[0_0_35px_#3358ea85] transition-all duration-1000 hover:scale-110"
        />
        <motion.div
          variants={tooltipVariants}
          className="absolute top-2 -left-2 sm:top-4 sm:-left-4 rounded-lg border border-purple-500/30 bg-black/80 p-1.5 sm:p-2 backdrop-blur-md lg:top-1/4 lg:-left-20"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-200">
              <span className="hidden xs:inline">High Performance</span>
              <span className="xs:hidden">Performance</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={tooltipVariants}
          className="absolute top-1/2 -right-2 sm:-right-4 rounded-lg border border-blue-500/30 bg-black/80 p-1.5 sm:p-2 backdrop-blur-md lg:-right-24"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Database className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-200">
              <span className="hidden xs:inline">Decentralized Storage</span>
              <span className="xs:hidden">Storage</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={tooltipVariants}
          className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 rounded-lg border border-indigo-500/30 bg-black/80 p-1.5 sm:p-2 backdrop-blur-md lg:bottom-1/4 lg:left-8"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-200">
              AI-Powered
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mb-6 sm:mb-10 flex w-full max-w-[1450px] flex-grow flex-col items-center justify-center px-2 sm:px-4 lg:px-8 text-center lg:mb-0 lg:items-start lg:justify-end lg:text-left"
      >
        <motion.div className="flex w-full flex-col items-center justify-between lg:flex-row lg:items-start">
          <div className="w-full lg:w-auto">
            <motion.div
              variants={itemVariants}
              className="mb-3 sm:mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-2 sm:px-3 py-1 text-xs sm:text-sm text-purple-300"
            >
              <span className="mr-1 sm:mr-2 rounded-full bg-purple-500 px-1.5 sm:px-2 py-0.5 text-xs font-semibold text-white">
                New
              </span>
              <span className="hidden xs:inline">Introducing Panic Feature</span>
              <span className="xs:hidden">Panic Feature</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-4 sm:mb-6 bg-gradient-to-r from-white/70 via-white to-slate-500/80 bg-clip-text text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight font-semibold text-transparent px-2 sm:px-0"
            >
              The Bridge Between <br className="hidden xs:inline" />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Safety and Web3
              </span>
            </motion.h1>

            {/* Animated Stats Row */}
            <motion.div
              variants={itemVariants}
              className="mb-4 sm:mb-6 flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 lg:justify-start"
            >
              {/* <div className="rounded-lg border border-purple-500/20 bg-black/40 px-4 py-2 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">
                  {stats.users.toLocaleString()}+
                </p>
                <p className="text-xs text-gray-400">Active Users</p>
              </div> */}
              <div className="rounded-lg border border-blue-500/20 bg-black/40 px-2 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm">
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {stats.transactions.toLocaleString()}+
                </p>
                <p className="text-xs text-gray-400">Transactions</p>
              </div>
              <div className="rounded-lg border border-indigo-500/20 bg-black/40 px-2 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm">
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {stats.networks}+
                </p>
                <p className="text-xs text-gray-400">Networks</p>
              </div>
            </motion.div>

            {/* Integration badges */}
            <motion.div
              variants={itemVariants}
              className="mb-6 sm:mb-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 lg:justify-start px-2 sm:px-0"
            >
              <span className="text-xs font-medium text-gray-400 w-full sm:w-auto text-center sm:text-left mb-1 sm:mb-0">
                Integrates with:
              </span>
              <div className="flex cursor-pointer items-center gap-1 sm:gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium text-slate-300 backdrop-blur-sm transition-all hover:bg-purple-950">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400"></div>
                <span className="hidden xs:inline">Ethereum</span>
                <span className="xs:hidden">ETH</span>
              </div>
              <div className="flex cursor-pointer items-center gap-1 sm:gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium text-slate-300 backdrop-blur-sm transition-all hover:bg-purple-950">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-400"></div>
                <span className="hidden xs:inline">Solana</span>
                <span className="xs:hidden">SOL</span>
              </div>
              <div className="flex cursor-pointer items-center gap-1 sm:gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium text-slate-300 backdrop-blur-sm transition-all hover:bg-purple-950">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-400"></div>
                <span className="hidden xs:inline">OpenAI</span>
                <span className="xs:hidden">AI</span>
              </div>
              <div className="flex cursor-pointer items-center gap-1 sm:gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium text-slate-300 backdrop-blur-sm transition-all hover:bg-purple-950">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-yellow-400"></div>
                +5 more
              </div>
            </motion.div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col items-center lg:mt-0 lg:items-end">
            <motion.p
              variants={itemVariants}
              className="mb-6 sm:mb-8 max-w-md px-3 sm:px-6 text-center text-sm sm:text-base lg:text-lg leading-relaxed text-slate-300/90 lg:text-end"
            >
              AI-Powered Tourist Safety Monitoring & Incident Response System Enhanced with Geo-Fencing and Blockchain-based Digital ID.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mb-6 sm:mb-8 flex flex-col flex-wrap gap-3 sm:gap-4 xs:flex-row lg:justify-end px-2 sm:px-0"
            >
              <Link href={"/dashboard"}>
              <Button
                className="group rounded-full border-t border-purple-400 bg-gradient-to-b from-purple-700 to-slate-950/80 px-4 sm:px-6 py-3 sm:py-6 text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-purple-600/40 text-sm sm:text-base w-full xs:w-auto"
                size="sm"
                >
                Dashboard
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
                </Link>

              <Button
                variant="outline"
                className="rounded-full border-purple-500/30 bg-transparent text-white hover:bg-purple-500/10 hover:text-white px-4 sm:px-6 py-3 sm:py-6 text-sm sm:text-base w-full xs:w-auto"
                size="sm"
              >
                Sign Up
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={itemVariants}
              className="mx-auto flex items-center gap-2 sm:gap-3 rounded-full border border-slate-800 bg-slate-900/50 px-2 sm:px-3 py-1 backdrop-blur-sm lg:mx-0 lg:ml-auto"
            >
              <div className="flex -space-x-1 sm:-space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-4 sm:h-6 sm:w-6 overflow-hidden rounded-full border-2 border-slate-900 bg-slate-800"
                  >
                    <div className="h-full w-full bg-gradient-to-br from-purple-500 to-blue-600 opacity-80"></div>
                  </div>
                ))}
              </div>
              <span className="text-xs text-slate-300">
                <span className="font-semibold text-white">500+</span>{' '}
                <span className="hidden xs:inline">developers already building</span>
                <span className="xs:hidden">devs building</span>
              </span>
              <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 text-purple-400" />
            </motion.div>
          </div>
        </motion.div>
      </motion.main>
      <div className="absolute right-auto -bottom-20 sm:-bottom-40 left-1/2 h-48 w-10 sm:h-96 sm:w-20 -translate-x-1/2 -rotate-45 rounded-full bg-gray-200/30 blur-[40px] sm:blur-[80px] lg:right-96 lg:left-auto lg:translate-x-0"></div>
      <div className="absolute right-auto -bottom-26 sm:-bottom-52 left-1/2 h-48 w-10 sm:h-96 sm:w-20 -translate-x-1/2 -rotate-45 rounded-full bg-gray-300/20 blur-[40px] sm:blur-[80px] lg:right-auto lg:left-auto lg:translate-x-0"></div>
      <div className="absolute right-auto -bottom-30 sm:-bottom-60 left-1/2 h-48 w-5 sm:h-96 sm:w-10 -translate-x-10 sm:-translate-x-20 -rotate-45 rounded-full bg-gray-300/20 blur-[40px] sm:blur-[80px] lg:right-96 lg:left-auto lg:-translate-x-40"></div>
    </section>
  );
}
