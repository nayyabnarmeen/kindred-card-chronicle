import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TreePine, Users, Heart, ArrowRight, Smartphone } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-primary/60">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          <TreePine className="h-24 w-24 mx-auto text-white animate-pulse" />
          <div className="absolute -top-2 -right-2">
            <Heart className="h-8 w-8 text-red-300 animate-bounce" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Kindred</h1>
          <p className="text-xl text-white/90">Card Chronicle</p>
          <p className="text-sm text-white/70">Connecting families across generations</p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
};

const Landing: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/10">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <TreePine className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Kindred</span>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/auth')}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Your Family Story
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground/90">
              Starts Here
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Create, organize, and preserve your family history with our beautiful and intuitive family tree builder.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            >
              Start Your Family Tree
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/app')}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <TreePine className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Beautiful Family Trees</h3>
              <p className="text-muted-foreground">
                Create stunning visual family trees with photos, dates, and relationships.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Family Management</h3>
              <p className="text-muted-foreground">
                Easily add, edit, and organize family members across generations.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <Smartphone className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
              <p className="text-muted-foreground">
                Access and update your family tree anywhere, anytime on any device.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center space-y-6 bg-primary/5 rounded-2xl p-12">
          <h3 className="text-3xl font-bold">Ready to Begin?</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of families who are preserving their heritage and connecting with their roots.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 p-8 border-t border-border/50 text-center">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <TreePine className="h-5 w-5" />
          <span>© 2024 Kindred Card Chronicle. Connecting families across generations.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;