import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { Shield, Users, AlertTriangle } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Component Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>Test Card</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">This is a test card component.</p>
            <div className="space-y-2">
              <Button className="w-full">Primary Button</Button>
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Outline Button
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge className="bg-green-100 text-green-800">Success</Badge>
              <Badge className="bg-red-100 text-red-800">Error</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>Icons Test</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Shield className="w-8 h-8 text-blue-500" />
              <Users className="w-8 h-8 text-green-500" />
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Components Working</h2>
        <p className="text-green-700">
          If you can see this page with proper styling and components, then the application is working correctly!
        </p>
      </div>
    </div>
  );
}
