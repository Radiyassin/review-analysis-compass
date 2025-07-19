import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageSquare, TrendingUp, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">SentimentPro</span>
          </div>
          <Link to="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Advanced Sentiment Analysis Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your customer feedback into actionable insights with our powerful AI-driven sentiment analysis platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Start Analyzing
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Powerful Features for Better Insights
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Easy Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload CSV files with customer feedback and get instant analysis results.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Visual Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Beautiful charts and graphs to visualize sentiment trends and patterns.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive chatbot to help you understand and explore your data insights.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Predict future sentiment trends and make data-driven business decisions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Customer Insights?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using our platform to understand their customers better.
          </p>
          <Link to="/dashboard">
            <Button size="lg">
              Start Your Analysis Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 SentimentPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;