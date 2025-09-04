import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { 
  Shield, 
  Eye, 
  Navigation,
  QrCode,
  Brain,
  AlertTriangle,
  Globe,
  Smartphone,
  Radio,
  Users,
  Zap,
  MapPin,
  Heart,
  CheckCircle
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Digital Tourist ID",
    description: "Blockchain-secured digital identity with KYC verification, trip itinerary, and emergency contacts.",
    features: ["Secure blockchain storage", "QR code verification", "Trip validity tracking", "Emergency contact integration"],
    color: "blue"
  },
  {
    icon: Navigation,
    title: "Smart Geo-Fencing",
    description: "AI-powered location monitoring with automatic alerts for high-risk or restricted zones.",
    features: ["Real-time location tracking", "Geo-fence boundary alerts", "Risk zone detection", "Safe zone recommendations"],
    color: "green"
  },
  {
    icon: AlertTriangle,
    title: "Emergency Response",
    description: "One-touch panic button with instant location sharing and automated emergency dispatch.",
    features: ["Instant panic button", "Live location sharing", "Multi-channel alerts", "Automated E-FIR generation"],
    color: "red"
  },
  {
    icon: Eye,
    title: "AI Anomaly Detection",
    description: "Machine learning algorithms detect unusual patterns and potential safety threats.",
    features: ["Behavioral pattern analysis", "Route deviation detection", "Inactivity monitoring", "Predictive risk assessment"],
    color: "purple"
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Complete system available in 10+ Indian languages with voice/text emergency access.",
    features: ["10+ Indian languages", "Voice emergency commands", "Cultural sensitivity", "Local dialect support"],
    color: "yellow"
  },
  {
    icon: Radio,
    title: "IoT Integration",
    description: "Smart wearable devices for continuous health and location monitoring in remote areas.",
    features: ["Smart bands/tags", "Health monitoring", "GPS tracking", "Manual SOS triggers"],
    color: "indigo"
  }
];

const stats = [
  { label: "Active Tourists", value: "50K+", icon: Users, color: "blue" },
  { label: "Tourist Zones", value: "250+", icon: MapPin, color: "green" },
  { label: "Response Time", value: "<2min", icon: Zap, color: "yellow" },
  { label: "Safety Score", value: "99.9%", icon: Shield, color: "purple" }
];

export default function SafetyFeatures() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Advanced Safety Technology
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-gray-900 dark:text-white">Comprehensive</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Safety Ecosystem
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform combines cutting-edge technology with human-centered design 
              to ensure the safety and security of every tourist exploring India.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="pt-6 pb-4">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                    stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                    stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                    feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                    feature.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                    feature.color === 'red' ? 'bg-red-100 dark:bg-red-900' :
                    feature.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                    feature.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-indigo-100 dark:bg-indigo-900'
                  }`}>
                    <feature.icon className={`w-7 h-7 ${
                      feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      feature.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      feature.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      feature.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      feature.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-indigo-600 dark:text-indigo-400'
                    }`} />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.features.map((item, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Technology Stack */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Powered by Advanced Technology</h3>
              <p className="text-blue-100 max-w-2xl mx-auto">
                Built with cutting-edge technologies to ensure reliability, security, and scalability 
                for India's growing tourism industry.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Blockchain", icon: "🔗", desc: "Secure Identity" },
                { name: "AI/ML", icon: "🧠", desc: "Smart Detection" },
                { name: "IoT", icon: "📡", desc: "Connected Devices" },
                { name: "Cloud", icon: "☁️", desc: "Scalable Infrastructure" }
              ].map((tech, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-2">{tech.icon}</div>
                  <h4 className="font-semibold mb-1">{tech.name}</h4>
                  <p className="text-sm text-blue-100">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Travel Safely?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of tourists who trust Yatri Rakshak for their safety while 
              exploring the incredible destinations across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700">
                <Smartphone className="w-5 h-5 mr-2" />
                Get Your Digital ID
              </Button>
              <Button size="lg" variant="outline">
                <Shield className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
