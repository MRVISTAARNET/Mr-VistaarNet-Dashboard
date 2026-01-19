import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const { forgotPassword, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await forgotPassword(email);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset link");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl border-border/50">
                <CardHeader className="space-y-3">
                    <div className="w-full flex justify-center mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {isSubmitted ? "Check your email" : "Forgot Password?"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isSubmitted
                            ? "We have sent a password reset link to your email address."
                            : "Enter your email address to receive a password reset link."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg w-full justify-center border border-green-200 dark:border-green-900/50">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Link sent successfully!</span>
                            </div>
                            <div className="text-center text-sm text-muted-foreground w-full bg-muted/50 p-4 rounded-lg">
                                <p className="font-mono text-xs mb-2">DEV NOTE: CHECK SPRING BOOT CONSOLE</p>
                                <p>MrVistaarNet Backend Console</p>
                            </div>
                            <Button asChild className="w-full" variant="outline">
                                <Link to="/login">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-muted/30"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Sending Link..." : "Send Reset Link"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!isSubmitted && (
                    <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
                        <Link
                            to="/login"
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
